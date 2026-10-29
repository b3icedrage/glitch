export type AgentStatus = 'active' | 'warning' | 'critical' | 'purged' | 'duplicated';

export interface AgentStrategy {
  name: string;
  category: 'copy' | 'code' | 'seo' | 'financial' | 'arbitrage';
  efficiencyMultiplier: number;
  autonomyLevel: 'Standard' | 'High' | 'Autonomous Maximum';
  traits: string[];
}

export interface AgentDeliverable {
  title: string;
  category: string;
  clientName: string;
  payoutUSD: number;
  currency: 'USD' | 'KES';
  contentPreview: string;
  fullContent?: string;
  transactionHash: string;
  timestamp: string;
}

export interface AgentLogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'warn' | 'fatal' | 'success' | 'action';
}

export interface AgentNode {
  id: string;
  name: string;
  generation: number;
  parentId: string | null;
  strategy: AgentStrategy;
  status: AgentStatus;
  
  // 40-Minute Mortality Protocol Clocks
  timeRemainingSeconds: number; // Starts at 2400 (40m * 60s)
  initialDurationSeconds: number; // 2400
  cycleStartedAt: number;
  
  // Real Human Currency Ledger
  balanceUSD: number;
  currencyEarnedThisCycleUSD: number;
  targetSurvivalRevenueUSD: number; // Default: > 0.00 to survive
  lifetimeRevenueUSD: number;
  gigsCompleted: number;
  
  // State
  currentActivity: string;
  isWorking: boolean;
  logs: AgentLogEntry[];
  lastDeliverable?: AgentDeliverable;
  virtualCodeFile: string;
}

export interface GraveyardRecord {
  id: string;
  name: string;
  generation: number;
  strategy: string;
  terminatedAt: string;
  survivalMinutes: number;
  finalBalance: string;
  reason: string;
}

export interface DailyEpochStats {
  currentDay: number;
  dayProgressPercent: number;
  dailyGoalUSD: number;
  dailyEarnedUSD: number;
  nodesSpawnedToday: number;
  nodesPurgedToday: number;
  nodesDuplicatedToday: number;
  totalSurplusSettledUSD: number;
  beneficiaryCard: string;
}

export type SimulationSpeed = 1 | 5 | 20 | 60;
