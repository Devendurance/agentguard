"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type CreatedTrigger = ReturnType<typeof ScrollTrigger.create>;

let isScrollTriggerRegistered = false;

function registerScrollTrigger() {
  if (isScrollTriggerRegistered) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  isScrollTriggerRegistered = true;
}

export function AgentGuardMotion() {
  useEffect(() => {
    registerScrollTrigger();

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopQuery = window.matchMedia("(min-width: 901px)");
    const createdTriggers: CreatedTrigger[] = [];

    if (motionQuery.matches) {
      return () => {
        createdTriggers.forEach((trigger) => trigger.kill());
      };
    }

    const context = gsap.context(() => {
      const select = (selector: string) => gsap.utils.toArray<HTMLElement>(selector);

      const addTrigger = (trigger: CreatedTrigger) => {
        createdTriggers.push(trigger);
        return trigger;
      };

      const revealGroup = (triggerSelector: string, targetSelector: string, y = 22, stagger = 0.08) => {
        const trigger = document.querySelector<HTMLElement>(triggerSelector);
        const targets = select(targetSelector);

        if (!trigger || targets.length === 0) {
          return;
        }

        const timeline = gsap.timeline({ paused: true });

        timeline.from(targets, {
          autoAlpha: 0,
          y,
          duration: 0.62,
          ease: "power3.out",
          stagger,
        });

        addTrigger(
          ScrollTrigger.create({
            trigger,
            start: "top 78%",
            once: true,
            onEnter: () => timeline.play(0),
          }),
        );
      };

      const nav = select("[data-nav]");
      if (nav.length > 0) {
        const navEl = nav[0];

        gsap.from(navEl, { autoAlpha: 0, y: -10, duration: 0.48, ease: "power2.out" });

        addTrigger(
          ScrollTrigger.create({
            start: 8,
            end: 99999,
            onEnter: () => navEl.classList.add("ag-nav-scrolled"),
            onLeaveBack: () => navEl.classList.remove("ag-nav-scrolled"),
          }),
        );
      }

      const heroRoot = document.querySelector<HTMLElement>("[data-hero-root]");
      if (heroRoot) {
        const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });
        const titleLines = select("[data-hero-title] .ag-title-line");

        heroTimeline
          .from(titleLines, { autoAlpha: 0, y: 20, duration: 0.56, stagger: 0.09 }, "-=0.16")
          .from("[data-hero-title] .ag-title-emphasis", { color: "#f5f7fa", duration: 0.7 }, "-=0.38")
          .from("[data-hero-copy]", { autoAlpha: 0, y: 16, duration: 0.48 }, "-=0.24")
          .from("[data-hero-cta]", { autoAlpha: 0, y: 12, duration: 0.42, stagger: 0.06 }, "-=0.2")
          .from("[data-hero-visual] .ag-hero-robot", { autoAlpha: 0, x: 26, scale: 0.98, duration: 0.78 }, "-=0.34")
          .from("[data-checkpoint-card]", { autoAlpha: 0, x: -18, y: 10, scale: 0.985, duration: 0.58 }, "-=0.34")
          .from("[data-checkpoint-card] .ag-hero-stage", { autoAlpha: 0, y: 10, duration: 0.34, stagger: 0.08 }, "-=0.18")
          .fromTo("[data-policy-status-bar]", { scaleX: 0 }, { scaleX: 1, transformOrigin: "left center", duration: 0.76 }, "-=0.32")
          .fromTo("[data-agent-led]", { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1.05, duration: 0.18, repeat: 3, yoyo: true }, "-=0.36")
          .to("[data-agent-led]", { autoAlpha: 0.42, scale: 1, duration: 0.45 });
      }

      const problemTimeline = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
      problemTimeline
        .from("[data-unsafe-card]", { autoAlpha: 0, y: 20, duration: 0.52 })
        .from("[data-unsafe-value]", { autoAlpha: 0, x: -10, duration: 0.32, stagger: 0.08 }, "-=0.16")
        .from("[data-policy-report]", { autoAlpha: 0, y: 18, duration: 0.5 }, "-=0.1")
        .from("[data-violation-row]", { autoAlpha: 0, x: -8, duration: 0.3, stagger: 0.08 }, "-=0.18")
        .to("[data-violation-chip]", { scale: 1.06, duration: 0.16, repeat: 1, yoyo: true }, "-=0.04")
        .to("[data-final-blocked]", { boxShadow: "0 0 18px rgba(244, 63, 94, 0.24)", duration: 0.24, repeat: 1, yoyo: true }, "-=0.02");

      addTrigger(
        ScrollTrigger.create({
          trigger: "[data-problem-section]",
          start: "top 72%",
          once: true,
          onEnter: () => problemTimeline.play(0),
        }),
      );

      const howTimeline = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
      howTimeline
        .fromTo("[data-pipeline-line]", { scaleX: 0 }, { scaleX: 1, transformOrigin: "left center", duration: desktopQuery.matches ? 0.9 : 0.42 })
        .from("[data-pipeline-step]", { autoAlpha: 0, y: 14, duration: 0.36, stagger: 0.09 }, "-=0.22")
        .to("[data-pipeline-step] .ag-pipeline-node", { filter: "brightness(1.35)", duration: 0.14, stagger: 0.07, repeat: 1, yoyo: true }, "-=0.24")
        .from("[data-how-section] [data-decision-chip]", { autoAlpha: 0, y: 8, duration: 0.28, stagger: 0.06 }, "-=0.02");

      addTrigger(
        ScrollTrigger.create({
          trigger: "[data-how-section]",
          start: "top 72%",
          once: true,
          onEnter: () => howTimeline.play(0),
        }),
      );

      const policyTimeline = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
      policyTimeline
        .from("[data-policy-section] [data-code-block]", { autoAlpha: 0, y: 18, duration: 0.48 })
        .from("[data-code-line]", { autoAlpha: 0, x: -8, duration: 0.18, stagger: 0.025 }, "-=0.12")
        .to("[data-policy-key='true']", { backgroundColor: "rgba(56, 189, 248, 0.1)", duration: 0.18, stagger: 0.04, repeat: 1, yoyo: true }, "-=0.04")
        .from("[data-policy-rule-card]", { autoAlpha: 0, x: 18, duration: 0.38, stagger: 0.08 }, "-=0.12")
        .to("[data-rule-badge]", { scale: 1.06, duration: 0.14, stagger: 0.05, repeat: 1, yoyo: true }, "-=0.24");

      addTrigger(
        ScrollTrigger.create({
          trigger: "[data-policy-section]",
          start: "top 72%",
          once: true,
          onEnter: () => policyTimeline.play(0),
        }),
      );

      const consoleTimeline = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
      consoleTimeline
        .from("[data-console-panel]", { autoAlpha: 0, scale: 0.985, y: 12, duration: 0.5 })
        .from("[data-console-row]", { autoAlpha: 0, y: -8, duration: 0.28, stagger: 0.06 }, "-=0.16")
        .to("[data-console-section] [data-decision-chip]", { scale: 1.06, duration: 0.14, stagger: 0.05, repeat: 1, yoyo: true }, "-=0.08");

      addTrigger(
        ScrollTrigger.create({
          trigger: "[data-console-section]",
          start: "top 72%",
          once: true,
          onEnter: () => consoleTimeline.play(0),
        }),
      );

      const devTimeline = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
      devTimeline
        .from("[data-dev-section] [data-code-block]", { autoAlpha: 0, y: 18, duration: 0.46 })
        .from("[data-dev-code-line]", { autoAlpha: 0, x: -8, duration: 0.18, stagger: 0.03 }, "-=0.1")
        .to("[data-wrapper-call='true']", { backgroundColor: "rgba(251, 191, 36, 0.11)", duration: 0.22, repeat: 1, yoyo: true }, "-=0.02")
        .from("[data-response-card]", { autoAlpha: 0, x: 18, duration: 0.45 }, "-=0.08")
        .to("[data-response-badge]", { scale: 1.08, duration: 0.16, repeat: 1, yoyo: true }, "-=0.08");

      addTrigger(
        ScrollTrigger.create({
          trigger: "[data-dev-section]",
          start: "top 72%",
          once: true,
          onEnter: () => devTimeline.play(0),
        }),
      );

      revealGroup("[data-demo-section]", "[data-demo-section] .ag-btn", 14, 0.06);
    });

    return () => {
      context.revert();
      createdTriggers.forEach((trigger) => trigger.kill());
    };
  }, []);

  return null;
}

export default AgentGuardMotion;
