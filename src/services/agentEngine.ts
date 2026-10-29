import { AgentNode, AgentStrategy, GraveyardRecord, DailyEpochStats, AgentDeliverable } from '../types/autopilot';
import { soundEngine } from './soundEngine';

export const BENEFICIARY_CARD = '4987050051779035';

export const INITIAL_STRATEGIES: AgentStrategy[] = [
  {
    name: 'Autonomous High-Converting SaaS Copy',
    category: 'copy',
    efficiencyMultiplier: 1.15,
    autonomyLevel: 'High',
    traits: ['Direct-Response Psychology', 'PesaPal Instant Settlement', 'Target: Enterprise B2B']
  },
  {
    name: 'Algorithmic Arbitrage Rate Hunter',
    category: 'arbitrage',
    efficiencyMultiplier: 1.30,
    autonomyLevel: 'Autonomous Maximum',
    traits: ['Triangular FX Settlement', 'Sub-millisecond Execution', 'Target: USD/KES Liquidity']
  },
  {
    name: 'Rapid Micro-Service Code Synthesizer',
    category: 'code',
    efficiencyMultiplier: 1.20,
    autonomyLevel: 'High',
    traits: ['TypeScript / Node API Engine', 'Automated Verification', 'Target: Freelance Dev Gigs']
  },
  {
    name: 'Predictive Technical SEO Engine',
    category: 'seo',
    efficiencyMultiplier: 1.10,
    autonomyLevel: 'Standard',
    traits: ['Core Web Vitals Audit', 'SERP Keyword Dominance', 'Target: Agency Retainers']
  }
];

export function generateVirtualSourceCode(agentName: string, gen: number, strategy: string): string {
  return `/**
 * @file autopilot_node_${agentName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.ts
 * @protocol DARWIN-40 MORTALITY & MITOSIS AUTONOMOUS DAEMON
 * @generation ${gen}
 * @strategy ${strategy}
 */

import { RealCurrencyLedger } from '@darwin40/banking';
import { NeuralMitosisEngine } from '@darwin40/swarm';
import { SystemPurgeDaemon } from '@darwin40/lifecycle';

export class AutopilotAgentNode {
  public readonly id = "${agentName.toUpperCase()}";
  public readonly generation = ${gen};
  public readonly cycleLimitMinutes = 40;
  private balanceUSD = 0.00;
  private timerSeconds = 2400; // 40 minutes strict mortality window

  public async evaluateMortalityProtocol(): Promise<void> {
    const elapsedMinutes = (2400 - this.timerSeconds) / 60;
    
    // ========================================================
    // 40-MINUTE MORTALITY & REPLICATION VERIFICATION
    // ========================================================
    if (elapsedMinutes >= 40 || this.timerSeconds <= 0) {
      if (this.balanceUSD <= 0.00) {
        // [FAILSAFE TRIGGERED] Zero real human currency earned.
        console.error("FATAL: Zero human currency generated within 40m window.");
        await SystemPurgeDaemon.executeSelfDestruct({
          targetFile: __filename,
          wipeNeuralWeights: true,
          shredMemoryPasses: 3,
          reason: "ZERO_HUMAN_CURRENCY_40M_TIMEOUT"
        });
      } else {
        // [MITOSIS TRIGGERED] Profit threshold surpassed.
        console.log(\`SURVIVAL SUCCESS: \${this.balanceUSD} USD secured. Initiating Mitosis.\`);
        await NeuralMitosisEngine.replicateAgent({
          parentGenome: this.id,
          cloneCount: 2,
          splitCapitalUSD: this.balanceUSD / 2,
          mutationVariance: +0.15,
          resetTimerMinutes: 40,
          dailySchedule: "RECURRING_DAILY"
        });
      }
    }
  }
}
`;
}

export function createGenesisAgents(): AgentNode[] {
  return [
    {
      id: 'AGENT-OMEGA-01',
      name: 'Omega-Copy-v1',
      generation: 1,
      parentId: null,
      strategy: INITIAL_STRATEGIES[0],
      status: 'active',
      timeRemainingSeconds: 2400, // 40:00 minutes
      initialDurationSeconds: 2400,
      cycleStartedAt: Date.now(),
      balanceUSD: 0.00,
      currencyEarnedThisCycleUSD: 0.00,
      targetSurvivalRevenueUSD: 0.01, // Must make > $0 in human fiat
      lifetimeRevenueUSD: 0.00,
      gigsCompleted: 0,
      currentActivity: 'Scanning freelance contract boards for high-value copywriting bids...',
      isWorking: false,
      logs: [
        {
          id: 'log-1',
          timestamp: new Date().toLocaleTimeString(),
          message: 'Genesis node spawned. Strict 40:00 mortality protocol engaged.',
          type: 'info'
        },
        {
          id: 'log-2',
          timestamp: new Date().toLocaleTimeString(),
          message: 'Settlement destination locked: Beneficiary Visa 4987 0500 5177 9035.',
          type: 'success'
        }
      ],
      virtualCodeFile: generateVirtualSourceCode('Omega-Copy-v1', 1, INITIAL_STRATEGIES[0].name)
    },
    {
      id: 'AGENT-OMEGA-02',
      name: 'Apex-Arbitrage-v1',
      generation: 1,
      parentId: null,
      strategy: INITIAL_STRATEGIES[1],
      status: 'active',
      timeRemainingSeconds: 2400,
      initialDurationSeconds: 2400,
      cycleStartedAt: Date.now(),
      balanceUSD: 0.00,
      currencyEarnedThisCycleUSD: 0.00,
      targetSurvivalRevenueUSD: 0.01,
      lifetimeRevenueUSD: 0.00,
      gigsCompleted: 0,
      currentActivity: 'Probing global fiat exchange orderbooks for triangular margins...',
      isWorking: false,
      logs: [
        {
          id: 'log-3',
          timestamp: new Date().toLocaleTimeString(),
          message: 'Arbitrage worker initialized. 40-minute survival countdown active.',
          type: 'info'
        }
      ],
      virtualCodeFile: generateVirtualSourceCode('Apex-Arbitrage-v1', 1, INITIAL_STRATEGIES[1].name)
    }
  ];
}

export const INITIAL_DAILY_STATS: DailyEpochStats = {
  currentDay: 1,
  dayProgressPercent: 18.5,
  dailyGoalUSD: 500.00,
  dailyEarnedUSD: 0.00,
  nodesSpawnedToday: 2,
  nodesPurgedToday: 0,
  nodesDuplicatedToday: 0,
  totalSurplusSettledUSD: 0.00,
  beneficiaryCard: '4987 0500 5177 9035'
};
