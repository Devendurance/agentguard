"use client";

import { useEffect } from "react";

const revealSelector = [
  ".ag-border-section > .ag-container",
  ".ag-final > .ag-container",
  ".ag-border-section .ag-panel",
  ".ag-pipeline",
  ".ag-final .ag-btn",
].join(", ");

const anchorSelector = 'a[href^="#"]';

function getHashTarget(hash: string) {
  if (!hash || hash === "#") {
    return null;
  }

  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)));
  } catch {
    return document.getElementById(hash.slice(1));
  }
}

function stageAnchorArrival(target: HTMLElement, reduceMotion: boolean) {
  target.classList.remove("ag-anchor-landing", "ag-anchor-landed");

  if (reduceMotion) {
    return null;
  }

  target.classList.add("ag-anchor-landing");

  return window.setTimeout(() => {
    target.classList.add("ag-anchor-landed");
  }, 180);
}

export function RevealOnScroll() {
  useEffect(() => {
    const root = document.documentElement;
    const targets = Array.from(document.querySelectorAll<HTMLElement>(revealSelector));
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reduceMotion = motionQuery.matches;
    const anchorTimers = new Set<number>();

    if (reduceMotion) {
      targets.forEach((target) => target.classList.add("ag-is-visible"));
    } else {
      root.classList.add("ag-motion-ready");
    }

    const revealAll = () => {
      targets.forEach((target) => target.classList.add("ag-is-visible"));
    };

    let observer: IntersectionObserver | null = null;

    if (!reduceMotion && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("ag-is-visible");
              observer?.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -12%", threshold: 0.12 },
      );
    }

    if (observer) {
      targets.forEach((target) => observer.observe(target));
    } else {
      revealAll();
    }

    const handleAnchorClick = (event: MouseEvent) => {
      const eventTarget = event.target;

      if (!(eventTarget instanceof Element)) {
        return;
      }

      const link = eventTarget.closest<HTMLAnchorElement>(anchorSelector);

      if (!link || link.origin !== window.location.origin || link.pathname !== window.location.pathname) {
        return;
      }

      const target = getHashTarget(link.hash);

      if (!(target instanceof HTMLElement)) {
        return;
      }

      const landingTimer = stageAnchorArrival(target, motionQuery.matches);

      if (landingTimer !== null) {
        anchorTimers.add(landingTimer);
      }

      const cleanupTimer = window.setTimeout(() => {
        if (landingTimer !== null) {
          anchorTimers.delete(landingTimer);
        }
        anchorTimers.delete(cleanupTimer);
        target.classList.remove("ag-anchor-landing", "ag-anchor-landed");
      }, motionQuery.matches ? 0 : 960);

      anchorTimers.add(cleanupTimer);
    };

    document.addEventListener("click", handleAnchorClick);

    return () => {
      observer?.disconnect();
      document.removeEventListener("click", handleAnchorClick);
      anchorTimers.forEach((timer) => window.clearTimeout(timer));
      root.classList.remove("ag-motion-ready");
    };
  }, []);

  return null;
}
