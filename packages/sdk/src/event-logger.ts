import { RiskEvent } from "./types";

/**
 * Event logger interface for risk events
 */
export interface EventLogger {
  log(event: RiskEvent): void;
  list(): RiskEvent[];
  clear(): void;
}

/**
 * Simple in-memory implementation of EventLogger
 * Suitable for MVP local demo and testing
 */
export class InMemoryEventLogger implements EventLogger {
  private events: RiskEvent[] = [];

  /**
   * Append a risk event to the internal log
   */
  log(event: RiskEvent): void {
    this.events.push(event);
  }

  /**
   * Return a copy of all logged events (not the mutable original)
   */
  list(): RiskEvent[] {
    return [...this.events];
  }

  /**
   * Clear all logged events
   */
  clear(): void {
    this.events = [];
  }
}

/**
 * Generate a simple unique-ish id for risk events
 * Format: risk_evt_<timestamp>_<random_suffix>
 * Suitable for local MVP; replace with proper UUID in production
 */
export function createRiskEventId(): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).slice(2, 8);
  return `risk_evt_${timestamp}_${randomSuffix}`;
}
