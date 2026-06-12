import {
  OrderIntent,
  AccountState,
  MarketState,
  RiskPolicy,
  GuardDecision,
  RiskEvent,
} from "./types";
import { evaluateRisk } from "./risk-engine";
import {
  EventLogger,
  InMemoryEventLogger,
  createRiskEventId,
} from "./event-logger";

/**
 * Configuration options for AgentGuard constructor
 */
export interface AgentGuardOptions {
  policy: RiskPolicy;
  eventLogger?: EventLogger;
}

/**
 * AgentGuard: Main class that intercepts orders and evaluates them against risk policy
 */
export class AgentGuard {
  private policy: RiskPolicy;
  private eventLogger: EventLogger;

  constructor(options: AgentGuardOptions) {
    this.policy = options.policy;
    this.eventLogger = options.eventLogger ?? new InMemoryEventLogger();
  }

  /**
   * Evaluate an order against the current risk policy
   * Logs the evaluation as a RiskEvent and returns the decision
   */
  async evaluateOrder(
    order: OrderIntent,
    accountState?: AccountState,
    marketState?: MarketState
  ): Promise<GuardDecision> {
    const decision = evaluateRisk(order, accountState, marketState, this.policy);

    const event: RiskEvent = {
      id: createRiskEventId(),
      timestamp: new Date().toISOString(),
      order,
      decision,
      accountState,
      marketState,
    };

    this.eventLogger.log(event);
    return decision;
  }

  /**
   * Return all logged risk events
   */
  getEvents(): RiskEvent[] {
    return this.eventLogger.list();
  }

  /**
   * Clear all logged risk events
   */
  clearEvents(): void {
    this.eventLogger.clear();
  }

  /**
   * Return the current risk policy
   */
  getPolicy(): RiskPolicy {
    return this.policy;
  }

  /**
   * Update the risk policy (validation should be done externally via policy.ts)
   */
  updatePolicy(policy: RiskPolicy): void {
    this.policy = policy;
  }
}
