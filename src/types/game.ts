export type CharacterId = 'gojo' | 'sukuna' | 'itadori' | 'megumi';

export type GameMode = 'versus_ai' | 'versus_local' | 'story' | 'dojo' | 'boss_rush';

export type GameScreen = 'title' | 'select' | 'story_select' | 'arena' | 'victory';

export interface Skill {
  id: string;
  name: string;
  japaneseName: string;
  cost: number; // CE cost (0-100)
  cooldown: number; // seconds
  key: string;
  description: string;
  damage: number;
  type: 'melee' | 'projectile' | 'aoe' | 'buff' | 'dash';
  vfx: 'blue' | 'red' | 'purple' | 'dismantle' | 'cleave' | 'fire_arrow' | 'black_flash' | 'divergent' | 'shadow_wolf' | 'nue' | 'mahoraga';
}

export interface DomainExpansion {
  name: string;
  japaneseName: string;
  handSign: string;
  chant: string;
  cost: number;
  duration: number; // seconds
  description: string;
  sureHitDamagePerSecond: number;
  themeColor: string;
  ambientVFX: 'unlimited_void' | 'malevolent_shrine' | 'chimera_shadow';
}

export interface CharacterDef {
  id: CharacterId;
  name: string;
  japaneseName: string;
  epithet: string;
  portrait: string;
  themeColor: string; // Hex color for auras and effects
  secondaryColor: string;
  lore: string;
  stats: {
    maxHp: number;
    maxCe: number; // Cursed Energy
    speed: number;
    attack: number;
    defense: number;
    critRate: number; // Base Black Flash probability
  };
  passive: {
    name: string;
    description: string;
  };
  skills: Skill[];
  domain: DomainExpansion;
}

export interface Projectile {
  id: string;
  ownerId: 'player1' | 'player2';
  type: Skill['vfx'];
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  piercing: boolean;
  color: string;
  life: number;
  maxLife: number;
  isBlackFlash?: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'spark' | 'lightning' | 'shockwave' | 'aura' | 'blood' | 'shard' | 'kanji' | 'smoke';
  text?: string;
  gravity?: number;
}

export interface Fighter {
  id: 'player1' | 'player2';
  charId: CharacterId;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isGrounded: boolean;
  facing: 'left' | 'right';
  action: 'idle' | 'walk' | 'dash' | 'jump' | 'attack_light' | 'attack_heavy' | 'skill' | 'block' | 'hit' | 'knockdown' | 'domain_casting';
  actionTimer: number;
  activeSkillIndex: number | null;
  hp: number;
  maxHp: number;
  ce: number;
  maxCe: number;
  skillCooldowns: number[];
  isBlocking: boolean;
  hitStun: number;
  invincibleTimer: number;
  domainActive: boolean;
  domainTimer: number;
  infinityShield: number; // Gojo's infinity (0 - 100)
  blackFlashCount: number; // Consecutive Black Flashes landed
  blackFlashWindow: boolean; // Active timing frame for Black Flash
  comboHits: number;
  comboDamage: number;
  comboTimer: number;
  score: number;
}

export interface StoryStage {
  id: number;
  title: string;
  chapter: string;
  locationName: string;
  arenaBackground: string;
  playerCharId: CharacterId;
  opponentCharId: CharacterId;
  difficulty: 'Grade 2' | 'Semi-Grade 1' | 'Grade 1' | 'Special Grade';
  introDialogues: { speaker: string; text: string; side: 'left' | 'right' }[];
  winCondition: string;
  specialRules?: string;
}
