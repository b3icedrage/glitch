import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Fighter, Projectile, CharacterDef, GameMode } from '../types/game';
import { CHARACTERS } from '../data/characters';
import { soundEngine } from '../services/soundEngine';
import { vfx } from '../services/vfxEngine';

interface ArenaCanvasProps {
  player1Char: CharacterDef;
  player2Char: CharacterDef;
  gameMode: GameMode;
  arenaBackground: string;
  onMatchEnd: (winner: 'player1' | 'player2') => void;
  onDomainClashStart?: () => void;
  aiDifficulty?: 'Grade 2' | 'Semi-Grade 1' | 'Grade 1' | 'Special Grade';
}

const GROUND_Y = 460;
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 560;

export const ArenaCanvas: React.FC<ArenaCanvasProps> = ({
  player1Char,
  player2Char,
  gameMode,
  arenaBackground,
  onMatchEnd,
  onDomainClashStart,
  aiDifficulty = 'Grade 1',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);

  // Fighter state references to avoid React render delay inside the 60fps loop
  const p1Ref = useRef<Fighter>({
    id: 'player1',
    charId: player1Char.id,
    name: player1Char.name,
    x: 250,
    y: GROUND_Y,
    vx: 0,
    vy: 0,
    isGrounded: true,
    facing: 'right',
    action: 'idle',
    actionTimer: 0,
    activeSkillIndex: null,
    hp: player1Char.stats.maxHp,
    maxHp: player1Char.stats.maxHp,
    ce: 40,
    maxCe: player1Char.stats.maxCe,
    skillCooldowns: [0, 0, 0],
    isBlocking: false,
    hitStun: 0,
    invincibleTimer: 0,
    domainActive: false,
    domainTimer: 0,
    infinityShield: 100,
    blackFlashCount: 0,
    blackFlashWindow: false,
    comboHits: 0,
    comboDamage: 0,
    comboTimer: 0,
    score: 0,
  });

  const p2Ref = useRef<Fighter>({
    id: 'player2',
    charId: player2Char.id,
    name: player2Char.name,
    x: 750,
    y: GROUND_Y,
    vx: 0,
    vy: 0,
    isGrounded: true,
    facing: 'left',
    action: 'idle',
    actionTimer: 0,
    activeSkillIndex: null,
    hp: player2Char.stats.maxHp,
    maxHp: player2Char.stats.maxHp,
    ce: 40,
    maxCe: player2Char.stats.maxCe,
    skillCooldowns: [0, 0, 0],
    isBlocking: false,
    hitStun: 0,
    invincibleTimer: 0,
    domainActive: false,
    domainTimer: 0,
    infinityShield: 100,
    blackFlashCount: 0,
    blackFlashWindow: false,
    comboHits: 0,
    comboDamage: 0,
    comboTimer: 0,
    score: 0,
  });

  const projectilesRef = useRef<Projectile[]>([]);
  const keysPressed = useRef<Record<string, boolean>>({});
  const isGameOverRef = useRef<boolean>(false);
  const matchWinnerRef = useRef<'player1' | 'player2' | null>(null);

  // Sync state for HUD React components
  const [hudData, setHudData] = useState<{
    p1Hp: number;
    p1MaxHp: number;
    p1Ce: number;
    p1MaxCe: number;
    p1Cooldowns: number[];
    p1Domain: boolean;
    p1BlackFlashStreak: number;
    p1Combo: number;
    p2Hp: number;
    p2MaxHp: number;
    p2Ce: number;
    p2MaxCe: number;
    p2Domain: boolean;
    p2BlackFlashStreak: number;
    p2Combo: number;
  }>({
    p1Hp: player1Char.stats.maxHp,
    p1MaxHp: player1Char.stats.maxHp,
    p1Ce: 40,
    p1MaxCe: player1Char.stats.maxCe,
    p1Cooldowns: [0, 0, 0],
    p1Domain: false,
    p1BlackFlashStreak: 0,
    p1Combo: 0,
    p2Hp: player2Char.stats.maxHp,
    p2MaxHp: player2Char.stats.maxHp,
    p2Ce: 40,
    p2MaxCe: player2Char.stats.maxCe,
    p2Domain: false,
    p2BlackFlashStreak: 0,
    p2Combo: 0,
  });

  // Preload background image
  useEffect(() => {
    const img = new Image();
    img.src = arenaBackground;
    img.onload = () => setBgImage(img);
  }, [arenaBackground]);

  // Execute Skill
  const executeSkill = useCallback((fighter: Fighter, opponent: Fighter, charDef: CharacterDef, skillIndex: number) => {
    const skill = charDef.skills[skillIndex];
    if (!skill) return;

    if (fighter.ce < skill.cost) {
      if (fighter.id === 'player1') {
        vfx.addFloatingText('NOT ENOUGH CE', fighter.x, fighter.y - 70, '#94a3b8', 14);
      }
      return;
    }
    if (fighter.skillCooldowns[skillIndex] > 0) return;
    if (fighter.action === 'hit' || fighter.action === 'knockdown') return;

    // Consume CE and set cooldown
    fighter.ce -= skill.cost;
    fighter.skillCooldowns[skillIndex] = skill.cooldown;
    fighter.action = 'skill';
    fighter.actionTimer = 24;
    fighter.activeSkillIndex = skillIndex;

    const facingDir = fighter.facing === 'right' ? 1 : -1;
    const spawnX = fighter.x + facingDir * 45;
    const spawnY = fighter.y - 45;

    // Trigger unique technique audio & projectiles
    switch (skill.vfx) {
      case 'blue':
        soundEngine.playLimitlessBlue();
        projectilesRef.current.push({
          id: Math.random().toString(),
          ownerId: fighter.id,
          type: 'blue',
          x: spawnX,
          y: spawnY,
          vx: facingDir * 9,
          vy: 0,
          radius: 24,
          damage: skill.damage,
          piercing: false,
          color: '#00d2ff',
          life: 75,
          maxLife: 75,
        });
        break;

      case 'red':
        soundEngine.playLimitlessRed();
        projectilesRef.current.push({
          id: Math.random().toString(),
          ownerId: fighter.id,
          type: 'red',
          x: spawnX,
          y: spawnY,
          vx: facingDir * 14,
          vy: 0,
          radius: 20,
          damage: skill.damage,
          piercing: false,
          color: '#ef4444',
          life: 50,
          maxLife: 50,
        });
        break;

      case 'purple':
        soundEngine.playHollowPurple();
        projectilesRef.current.push({
          id: Math.random().toString(),
          ownerId: fighter.id,
          type: 'purple',
          x: spawnX,
          y: spawnY,
          vx: facingDir * 8,
          vy: 0,
          radius: 38,
          damage: skill.damage,
          piercing: true,
          color: '#a855f7',
          life: 90,
          maxLife: 90,
        });
        break;

      case 'dismantle':
        soundEngine.playDismantle();
        vfx.emitDismantleSlashes(fighter.x, fighter.y - 40, fighter.facing);
        projectilesRef.current.push({
          id: Math.random().toString(),
          ownerId: fighter.id,
          type: 'dismantle',
          x: spawnX,
          y: spawnY,
          vx: facingDir * 18,
          vy: 0,
          radius: 28,
          damage: skill.damage,
          piercing: false,
          color: '#ffffff',
          life: 40,
          maxLife: 40,
        });
        break;

      case 'cleave':
        soundEngine.playCleave();
        // Teleport adjacent to opponent and slash!
        fighter.x = opponent.x - facingDir * 50;
        fighter.vx = 0;
        vfx.emitDismantleSlashes(opponent.x, opponent.y - 45, fighter.facing);
        applyHit(opponent, fighter, skill.damage, true, 'cleave');
        break;

      case 'fire_arrow':
        soundEngine.playFireArrow();
        projectilesRef.current.push({
          id: Math.random().toString(),
          ownerId: fighter.id,
          type: 'fire_arrow',
          x: spawnX,
          y: spawnY,
          vx: facingDir * 13,
          vy: 0,
          radius: 30,
          damage: skill.damage,
          piercing: false,
          color: '#f97316',
          life: 65,
          maxLife: 65,
        });
        break;

      case 'divergent':
        soundEngine.playHit('heavy');
        fighter.vx = facingDir * 12;
        // Check melee collision
        if (Math.abs(fighter.x - opponent.x) < 85 && Math.abs(fighter.y - opponent.y) < 60) {
          applyHit(opponent, fighter, skill.damage * 0.6, false, 'hit');
          // Delayed cursed energy shockwave
          setTimeout(() => {
            if (!isGameOverRef.current) {
              soundEngine.playHit('critical');
              applyHit(opponent, fighter, skill.damage * 0.7, true, 'divergent');
              vfx.emitHitSparks(opponent.x, opponent.y - 45, '#3b82f6', 22, true);
            }
          }, 240);
        }
        break;

      case 'black_flash':
        // Guaranteed Black Flash skill attack!
        soundEngine.playBlackFlash();
        fighter.vx = facingDir * 16;
        if (Math.abs(fighter.x - opponent.x) < 95 && Math.abs(fighter.y - opponent.y) < 60) {
          triggerBlackFlashStrike(fighter, opponent, skill.damage);
        }
        break;

      case 'shadow_wolf':
        soundEngine.playShikigami('wolf');
        projectilesRef.current.push({
          id: Math.random().toString(),
          ownerId: fighter.id,
          type: 'shadow_wolf',
          x: spawnX,
          y: GROUND_Y - 20,
          vx: facingDir * 11,
          vy: 0,
          radius: 26,
          damage: skill.damage,
          piercing: false,
          color: '#10b981',
          life: 60,
          maxLife: 60,
        });
        break;

      case 'nue':
        soundEngine.playShikigami('nue');
        // Nue dives from above
        projectilesRef.current.push({
          id: Math.random().toString(),
          ownerId: fighter.id,
          type: 'nue',
          x: opponent.x,
          y: 40,
          vx: 0,
          vy: 14,
          radius: 32,
          damage: skill.damage,
          piercing: false,
          color: '#38bdf8',
          life: 45,
          maxLife: 45,
        });
        break;

      case 'mahoraga':
        soundEngine.playShikigami('mahoraga');
        vfx.triggerScreenShake(18);
        vfx.addFloatingText('MAHORAGA ADAPTATION', opponent.x, opponent.y - 70, '#facc15', 20, true);
        applyHit(opponent, fighter, skill.damage, true, 'mahoraga');
        vfx.emitHitSparks(opponent.x, opponent.y - 45, '#eab308', 35, true);
        break;

      default:
        break;
    }
  }, []);

  // Trigger Black Flash Strike
  const triggerBlackFlashStrike = (attacker: Fighter, target: Fighter, baseDamage: number) => {
    attacker.blackFlashCount += 1;
    const multiplier = 2.5 + Math.min(attacker.blackFlashCount * 0.2, 1.0);
    const totalDmg = Math.round(baseDamage * multiplier);

    soundEngine.playBlackFlash();
    vfx.emitBlackFlashVFX(target.x, target.y - 45);

    // Hit-stop effect (pause briefly)
    attacker.vx = 0;
    target.vx = (attacker.facing === 'right' ? 1 : -1) * 16;
    target.vy = -7;
    target.isGrounded = false;
    target.action = 'knockdown';
    target.actionTimer = 40;
    target.hp = Math.max(0, target.hp - totalDmg);

    // Attacker gains CE and enters the Zone!
    attacker.ce = Math.min(attacker.maxCe, attacker.ce + 35);
    attacker.comboHits += 1;
    attacker.comboDamage += totalDmg;
    attacker.comboTimer = 70;

    vfx.addFloatingText(`-${totalDmg}`, target.x, target.y - 80, '#ef4444', 26, true);
    checkGameOver();
  };

  // Apply hit damage & check Black Flash chance
  const applyHit = (target: Fighter, attacker: Fighter, rawDamage: number, isHeavy: boolean, hitType: string) => {
    if (target.invincibleTimer > 0) return;

    const attackerChar = attacker.id === 'player1' ? player1Char : player2Char;
    const targetChar = target.id === 'player1' ? player1Char : player2Char;

    // Check Black Flash probability (base crit rate + combo bonus)
    const isBlackFlash = Math.random() < (attackerChar.stats.critRate + attacker.comboHits * 0.04);
    if (isBlackFlash && (isHeavy || attacker.blackFlashWindow || hitType === 'black_flash')) {
      triggerBlackFlashStrike(attacker, target, rawDamage);
      return;
    }

    // Gojo's passive Infinity check
    let damage = rawDamage;
    if (targetChar.id === 'gojo' && !target.domainActive && target.infinityShield > 0) {
      damage = Math.round(damage * 0.6); // 40% damage absorption
      target.infinityShield = Math.max(0, target.infinityShield - 8);
      vfx.emitHitSparks(target.x, target.y - 45, '#00d2ff', 8);
    }

    // Blocking check
    if (target.isBlocking) {
      damage = Math.round(damage * 0.25);
      soundEngine.playHit('block');
      vfx.addFloatingText('GUARD', target.x, target.y - 65, '#94a3b8', 16);
      target.hp = Math.max(0, target.hp - damage);
      attacker.comboHits += 1;
      attacker.comboDamage += damage;
      attacker.comboTimer = 50;
      checkGameOver();
      return;
    }

    // Normal hit
    soundEngine.playHit(isHeavy ? 'heavy' : 'light');
    target.action = isHeavy ? 'knockdown' : 'hit';
    target.actionTimer = isHeavy ? 30 : 16;
    target.hitStun = isHeavy ? 20 : 12;

    const pushDir = attacker.facing === 'right' ? 1 : -1;
    target.vx = pushDir * (isHeavy ? 10 : 5);
    if (isHeavy) {
      target.vy = -6;
      target.isGrounded = false;
    }

    target.hp = Math.max(0, target.hp - damage);
    attacker.comboHits += 1;
    attacker.comboDamage += damage;
    attacker.comboTimer = 60;

    // Attacker gains CE on hit
    attacker.ce = Math.min(attacker.maxCe, attacker.ce + (isHeavy ? 14 : 7));

    vfx.emitHitSparks(target.x, target.y - 45, isHeavy ? '#f59e0b' : '#ffffff', isHeavy ? 20 : 10, isHeavy);
    vfx.addFloatingText(`-${damage}`, target.x, target.y - 60, isHeavy ? '#f97316' : '#ffffff', isHeavy ? 20 : 16);

    checkGameOver();
  };

  // Activate Domain Expansion
  const triggerDomainExpansion = useCallback((fighter: Fighter, charDef: CharacterDef) => {
    if (fighter.ce < charDef.domain.cost) {
      if (fighter.id === 'player1') {
        vfx.addFloatingText('NEED 100% CE', fighter.x, fighter.y - 70, '#f43f5e', 16);
      }
      return;
    }
    if (fighter.domainActive) return;

    fighter.ce = 0;
    fighter.domainActive = true;
    fighter.domainTimer = charDef.domain.duration * 60; // frames
    fighter.action = 'domain_casting';
    fighter.actionTimer = 45;

    soundEngine.playDomainExpansion();
    vfx.triggerScreenShake(24);
    vfx.triggerScreenInvert(10);
    vfx.addFloatingText(`DOMAIN EXPANSION: ${charDef.domain.name.toUpperCase()}`, CANVAS_WIDTH / 2, 140, charDef.domain.themeColor, 28, true);

    const otherFighter = fighter.id === 'player1' ? p2Ref.current : p1Ref.current;
    if (otherFighter.domainActive && onDomainClashStart) {
      onDomainClashStart();
    }
  }, [onDomainClashStart]);

  // Check Game Over
  const checkGameOver = () => {
    if (isGameOverRef.current) return;
    const p1 = p1Ref.current;
    const p2 = p2Ref.current;

    if (p1.hp <= 0) {
      isGameOverRef.current = true;
      p1.action = 'knockdown';
      matchWinnerRef.current = 'player2';
      vfx.triggerScreenShake(20);
      vfx.addFloatingText('K.O.', CANVAS_WIDTH / 2, 220, '#ef4444', 48, true);
      setTimeout(() => onMatchEnd('player2'), 1800);
    } else if (p2.hp <= 0) {
      isGameOverRef.current = true;
      p2.action = 'knockdown';
      matchWinnerRef.current = 'player1';
      vfx.triggerScreenShake(20);
      vfx.addFloatingText('EXORCISED! K.O.', CANVAS_WIDTH / 2, 220, '#10b981', 48, true);
      setTimeout(() => onMatchEnd('player1'), 1800);
    }
  };

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;
      keysPressed.current[e.code] = true;

      const p1 = p1Ref.current;
      const p2 = p2Ref.current;

      // Player 1 controls: Q, W, E for skills, R for Domain, J for Light, K for Heavy, L for Block
      const key = e.key.toLowerCase();
      if (key === 'q') executeSkill(p1, p2, player1Char, 0);
      if (key === 'w' && p1.isGrounded) executeSkill(p1, p2, player1Char, 1);
      if (key === 'e') executeSkill(p1, p2, player1Char, 2);
      if (key === 'r') triggerDomainExpansion(p1, player1Char);

      // Melee attack triggers
      if (key === 'j') {
        // Light Attack
        if (p1.action === 'idle' || p1.action === 'walk') {
          p1.action = 'attack_light';
          p1.actionTimer = 14;
          const facingDir = p1.facing === 'right' ? 1 : -1;
          p1.vx = facingDir * 3;
          if (Math.abs(p1.x - p2.x) < 75 && Math.abs(p1.y - p2.y) < 50) {
            applyHit(p2, p1, player1Char.stats.attack * 0.45, false, 'light');
          }
        }
      }

      if (key === 'k') {
        // Heavy Attack
        if (p1.action === 'idle' || p1.action === 'walk') {
          p1.action = 'attack_heavy';
          p1.actionTimer = 22;
          const facingDir = p1.facing === 'right' ? 1 : -1;
          p1.vx = facingDir * 6;
          if (Math.abs(p1.x - p2.x) < 85 && Math.abs(p1.y - p2.y) < 50) {
            applyHit(p2, p1, player1Char.stats.attack * 0.9, true, 'heavy');
          }
        }
      }

      // Player 2 controls in Local Versus Mode (Numpad or Arrow Keys + I/O/P/Numpad)
      if (gameMode === 'versus_local') {
        if (key === 'u') executeSkill(p2, p1, player2Char, 0);
        if (key === 'i') executeSkill(p2, p1, player2Char, 1);
        if (key === 'o') executeSkill(p2, p1, player2Char, 2);
        if (key === 'p') triggerDomainExpansion(p2, player2Char);

        if (key === '1' || key === 'n') {
          if (p2.action === 'idle' || p2.action === 'walk') {
            p2.action = 'attack_light';
            p2.actionTimer = 14;
            const facingDir = p2.facing === 'right' ? 1 : -1;
            p2.vx = facingDir * 3;
            if (Math.abs(p2.x - p1.x) < 75 && Math.abs(p2.y - p1.y) < 50) {
              applyHit(p1, p2, player2Char.stats.attack * 0.45, false, 'light');
            }
          }
        }

        if (key === '2' || key === 'm') {
          if (p2.action === 'idle' || p2.action === 'walk') {
            p2.action = 'attack_heavy';
            p2.actionTimer = 22;
            const facingDir = p2.facing === 'right' ? 1 : -1;
            p2.vx = facingDir * 6;
            if (Math.abs(p2.x - p1.x) < 85 && Math.abs(p2.y - p1.y) < 50) {
              applyHit(p1, p2, player2Char.stats.attack * 0.9, true, 'heavy');
            }
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
      keysPressed.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [player1Char, player2Char, gameMode, executeSkill, triggerDomainExpansion]);

  // AI Logic for Player 2
  const updateAI = useCallback((ai: Fighter, opponent: Fighter, aiDef: CharacterDef) => {
    if (isGameOverRef.current || ai.hp <= 0) return;
    if (ai.hitStun > 0 || ai.action === 'knockdown') return;

    const dist = Math.abs(ai.x - opponent.x);
    ai.facing = ai.x < opponent.x ? 'right' : 'left';
    const facingDir = ai.facing === 'right' ? 1 : -1;

    // Domain Expansion priority if 100% CE
    if (ai.ce >= 100 && !ai.domainActive && Math.random() < 0.04) {
      triggerDomainExpansion(ai, aiDef);
      return;
    }

    // Reaction speed & aggressiveness based on difficulty
    const aggro = aiDifficulty === 'Special Grade' ? 0.08 : aiDifficulty === 'Grade 1' ? 0.05 : 0.03;

    // Defense / Blocking when opponent is attacking
    if ((opponent.action === 'attack_heavy' || opponent.action === 'skill') && dist < 120) {
      if (Math.random() < 0.6) {
        ai.isBlocking = true;
        ai.action = 'block';
        return;
      }
    } else {
      ai.isBlocking = false;
    }

    // Range-based decisions
    if (dist > 280) {
      // Approach opponent
      ai.vx = facingDir * (aiDef.stats.speed * 0.75);
      ai.action = 'walk';

      // Use ranged skill if available
      if (Math.random() < aggro) {
        if (ai.skillCooldowns[0] <= 0 && ai.ce >= aiDef.skills[0].cost) {
          executeSkill(ai, opponent, aiDef, 0);
        } else if (ai.skillCooldowns[2] <= 0 && ai.ce >= aiDef.skills[2].cost && Math.random() < 0.3) {
          executeSkill(ai, opponent, aiDef, 2);
        }
      }
    } else if (dist > 80) {
      // Mid-range
      if (Math.random() < 0.03 && ai.isGrounded) {
        // Jump attack
        ai.vy = -12;
        ai.isGrounded = false;
        ai.action = 'jump';
      } else if (Math.random() < aggro) {
        if (ai.skillCooldowns[1] <= 0 && ai.ce >= aiDef.skills[1].cost) {
          executeSkill(ai, opponent, aiDef, 1);
        } else {
          ai.vx = facingDir * (aiDef.stats.speed * 0.8);
        }
      }
    } else {
      // Close melee range
      if (Math.random() < 0.09) {
        // Light attack
        ai.action = 'attack_light';
        ai.actionTimer = 14;
        applyHit(opponent, ai, aiDef.stats.attack * 0.45, false, 'light');
      } else if (Math.random() < 0.06) {
        // Heavy attack
        ai.action = 'attack_heavy';
        ai.actionTimer = 22;
        applyHit(opponent, ai, aiDef.stats.attack * 0.9, true, 'heavy');
      } else if (Math.random() < 0.04) {
        // Step back
        ai.vx = -facingDir * (aiDef.stats.speed * 0.7);
      }
    }
  }, [aiDifficulty, executeSkill, triggerDomainExpansion]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    soundEngine.startCombatBgm();

    const gameLoop = () => {
      const p1 = p1Ref.current;
      const p2 = p2Ref.current;

      // 1. Player 1 Movement Controls
      if (p1.action !== 'hit' && p1.action !== 'knockdown' && p1.action !== 'domain_casting') {
        const left = keysPressed.current['a'] || keysPressed.current['arrowleft'];
        const right = keysPressed.current['d'] || keysPressed.current['arrowright'];
        const jump = keysPressed.current['w'] || keysPressed.current['space'] || keysPressed.current['arrowup'];
        const block = keysPressed.current['l'] || keysPressed.current['s'] || keysPressed.current['shiftleft'];

        p1.isBlocking = block;

        if (block) {
          p1.action = 'block';
          p1.vx = 0;
        } else if (left) {
          p1.vx = -player1Char.stats.speed;
          p1.facing = 'left';
          if (p1.isGrounded) p1.action = 'walk';
        } else if (right) {
          p1.vx = player1Char.stats.speed;
          p1.facing = 'right';
          if (p1.isGrounded) p1.action = 'walk';
        } else {
          p1.vx *= 0.75;
          if (p1.isGrounded && p1.action === 'walk') p1.action = 'idle';
        }

        if (jump && p1.isGrounded && !block) {
          p1.vy = -13;
          p1.isGrounded = false;
          p1.action = 'jump';
          soundEngine.playHit('light');
        }
      }

      // 2. Player 2 Controls (AI or Local 2P)
      if (gameMode === 'versus_local') {
        if (p2.action !== 'hit' && p2.action !== 'knockdown' && p2.action !== 'domain_casting') {
          const left = keysPressed.current['arrowleft'];
          const right = keysPressed.current['arrowright'];
          const jump = keysPressed.current['arrowup'];
          const block = keysPressed.current['arrowdown'];

          p2.isBlocking = block;
          if (block) {
            p2.action = 'block';
            p2.vx = 0;
          } else if (left) {
            p2.vx = -player2Char.stats.speed;
            p2.facing = 'left';
            if (p2.isGrounded) p2.action = 'walk';
          } else if (right) {
            p2.vx = player2Char.stats.speed;
            p2.facing = 'right';
            if (p2.isGrounded) p2.action = 'walk';
          } else {
            p2.vx *= 0.75;
            if (p2.isGrounded && p2.action === 'walk') p2.action = 'idle';
          }

          if (jump && p2.isGrounded && !block) {
            p2.vy = -13;
            p2.isGrounded = false;
            p2.action = 'jump';
          }
        }
      } else {
        updateAI(p2, p1, player2Char);
      }

      // 3. Update Physics & States for Fighters
      [p1, p2].forEach((f) => {
        // Gravity
        f.vy += 0.65;
        f.x += f.vx;
        f.y += f.vy;

        // Ground constraint
        if (f.y >= GROUND_Y) {
          f.y = GROUND_Y;
          f.vy = 0;
          f.isGrounded = true;
          if (f.action === 'jump') f.action = 'idle';
        }

        // Arena boundary constraints
        if (f.x < 50) f.x = 50;
        if (f.x > CANVAS_WIDTH - 50) f.x = CANVAS_WIDTH - 50;

        // Action timers
        if (f.actionTimer > 0) {
          f.actionTimer -= 1;
          if (f.actionTimer <= 0) {
            if (f.action === 'knockdown' || f.action === 'hit' || f.action === 'attack_light' || f.action === 'attack_heavy' || f.action === 'skill' || f.action === 'domain_casting') {
              f.action = 'idle';
            }
          }
        }

        if (f.hitStun > 0) f.hitStun -= 1;
        if (f.invincibleTimer > 0) f.invincibleTimer -= 1;

        // Passive CE regeneration (1 per second)
        f.ce = Math.min(f.maxCe, f.ce + 0.05);

        // Sukuna passive regeneration under 50% HP
        if (f.charId === 'sukuna' && f.hp < f.maxHp * 0.5 && f.hp > 0) {
          f.hp = Math.min(f.maxHp, f.hp + 0.12);
        }

        // Gojo passive infinity recovery
        if (f.charId === 'gojo' && f.infinityShield < 100) {
          f.infinityShield = Math.min(100, f.infinityShield + 0.15);
        }

        // Skill cooldowns decay
        for (let i = 0; i < f.skillCooldowns.length; i++) {
          if (f.skillCooldowns[i] > 0) {
            f.skillCooldowns[i] = Math.max(0, f.skillCooldowns[i] - 1 / 60);
          }
        }

        // Combo timer decay
        if (f.comboTimer > 0) {
          f.comboTimer -= 1;
          if (f.comboTimer <= 0) {
            f.comboHits = 0;
            f.comboDamage = 0;
          }
        }

        // Domain Expansion duration & Sure-Hit damage
        if (f.domainActive) {
          f.domainTimer -= 1;
          const target = f.id === 'player1' ? p2 : p1;
          const charDef = f.id === 'player1' ? player1Char : player2Char;

          // Sure-hit damage tick every second
          if (f.domainTimer % 30 === 0 && target.hp > 0) {
            const sureHitDmg = Math.round(charDef.domain.sureHitDamagePerSecond / 2);
            target.hp = Math.max(0, target.hp - sureHitDmg);
            vfx.emitHitSparks(target.x, target.y - 45, charDef.domain.themeColor, 8);
            vfx.addFloatingText(`SURE HIT -${sureHitDmg}`, target.x, target.y - 65, charDef.domain.themeColor, 15);
            checkGameOver();
          }

          if (f.domainTimer <= 0) {
            f.domainActive = false;
          }
        }

        // Emit aura particles
        const themeColor = f.id === 'player1' ? player1Char.themeColor : player2Char.themeColor;
        vfx.emitAura(f.x, f.y - 30, themeColor, f.domainActive ? 3 : 1);
      });

      // 4. Update Projectiles
      for (let i = projectilesRef.current.length - 1; i >= 0; i--) {
        const proj = projectilesRef.current[i];
        proj.x += proj.vx;
        proj.y += proj.vy;
        proj.life -= 1;

        // VFX trail
        vfx.emitAura(proj.x, proj.y, proj.color, 1);

        // Check collision against opponent
        const target = proj.ownerId === 'player1' ? p2 : p1;
        const attacker = proj.ownerId === 'player1' ? p1 : p2;
        const dist = Math.hypot(proj.x - target.x, proj.y - (target.y - 40));

        if (dist < proj.radius + 28) {
          applyHit(target, attacker, proj.damage, true, proj.type);
          vfx.emitHitSparks(proj.x, proj.y, proj.color, 16, true);

          if (!proj.piercing) {
            projectilesRef.current.splice(i, 1);
            continue;
          }
        }

        if (proj.life <= 0 || proj.x < -100 || proj.x > CANVAS_WIDTH + 100) {
          projectilesRef.current.splice(i, 1);
        }
      }

      // 5. Update VFX Engine
      vfx.update();

      // 6. Draw Canvas Frame
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Camera shake transform
      ctx.save();
      if (vfx.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * vfx.screenShake;
        const shakeY = (Math.random() - 0.5) * vfx.screenShake;
        ctx.translate(shakeX, shakeY);
      }

      // Draw Arena Background
      if (bgImage) {
        ctx.drawImage(bgImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      } else {
        // Fallback gradient arena
        const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        grad.addColorStop(0, '#090a12');
        grad.addColorStop(0.7, '#1e1b4b');
        grad.addColorStop(1, '#05050a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }

      // Domain Expansion Active Environmental Overlay
      if (p1.domainActive || p2.domainActive) {
        ctx.save();
        const activeDomainChar = p1.domainActive ? player1Char : player2Char;
        const domainColor = activeDomainChar.domain.themeColor;

        if (activeDomainChar.id === 'gojo') {
          // Unlimited Void - cosmic stars and infinite void
          ctx.fillStyle = 'rgba(2, 6, 23, 0.78)';
          ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

          // Starfield and spatial rings
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40, 220, 0, Math.PI * 2);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40, 360, 0, Math.PI * 2);
          ctx.stroke();
        } else if (activeDomainChar.id === 'sukuna') {
          // Malevolent Shrine - blood sea & cutting grid
          ctx.fillStyle = 'rgba(69, 10, 10, 0.75)';
          ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

          // Slashing grid lines
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
          ctx.lineWidth = 1;
          for (let x = 0; x < CANVAS_WIDTH; x += 60) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, CANVAS_HEIGHT);
            ctx.stroke();
          }
        } else {
          // Chimera Shadow Garden - deep liquid darkness
          ctx.fillStyle = 'rgba(6, 78, 59, 0.75)';
          ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        }
        ctx.restore();
      }

      // Draw Floor / Ground shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(p1.x, GROUND_Y + 5, 38, 12, 0, 0, Math.PI * 2);
      ctx.ellipse(p2.x, GROUND_Y + 5, 38, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Render Fighters
      renderFighter(ctx, p1, player1Char);
      renderFighter(ctx, p2, player2Char);

      // Render Projectiles
      for (const proj of projectilesRef.current) {
        renderProjectile(ctx, proj);
      }

      // Render VFX (Particles, Slashes, Lightning, Floating Texts)
      vfx.render(ctx, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.restore(); // Restore camera shake

      // Sync React HUD
      setHudData({
        p1Hp: Math.round(p1.hp),
        p1MaxHp: p1.maxHp,
        p1Ce: Math.round(p1.ce),
        p1MaxCe: p1.maxCe,
        p1Cooldowns: [...p1.skillCooldowns],
        p1Domain: p1.domainActive,
        p1BlackFlashStreak: p1.blackFlashCount,
        p1Combo: p1.comboHits,
        p2Hp: Math.round(p2.hp),
        p2MaxHp: p2.maxHp,
        p2Ce: Math.round(p2.ce),
        p2MaxCe: p2.maxCe,
        p2Domain: p2.domainActive,
        p2BlackFlashStreak: p2.blackFlashCount,
        p2Combo: p2.comboHits,
      });

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => {
      cancelAnimationFrame(animationFrameId);
      soundEngine.stopCombatBgm();
    };
  }, [bgImage, gameMode, player1Char, player2Char, updateAI]);

  // Render stylized anime fighter model with dynamic motion poses
  const renderFighter = (ctx: CanvasRenderingContext2D, f: Fighter, charDef: CharacterDef) => {
    ctx.save();
    ctx.translate(f.x, f.y);
    if (f.facing === 'left') {
      ctx.scale(-1, 1);
    }

    // Gojo's Limitless Infinity Shimmer
    if (charDef.id === 'gojo' && f.infinityShield > 0) {
      ctx.save();
      ctx.strokeStyle = `rgba(0, 210, 255, ${0.35 + (f.infinityShield / 100) * 0.4})`;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#00d2ff';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, -45, 52, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Hit-flash white tint
    if (f.action === 'hit') {
      ctx.filter = 'brightness(1.8) drop-shadow(0 0 10px #ef4444)';
    }

    // Blocking barrier
    if (f.isBlocking) {
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(28, -45, 36, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      ctx.restore();
    }

    // Body silhouette & martial arts pose
    const isAttacking = f.action === 'attack_light' || f.action === 'attack_heavy' || f.action === 'skill';
    const isKnockdown = f.action === 'knockdown';

    if (isKnockdown) {
      // Fallen on back
      ctx.fillStyle = charDef.themeColor;
      ctx.shadowColor = charDef.themeColor;
      ctx.shadowBlur = 12;
      ctx.fillRect(-35, -15, 70, 15);
      // Head
      ctx.beginPath();
      ctx.arc(-35, -10, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    // 1. Torso / Uniform
    ctx.fillStyle = '#0f172a'; // Jujutsu High Dark Navy
    ctx.fillRect(-14, -65, 28, 42);

    // Collar / Details
    if (charDef.id === 'itadori') {
      // Red hood collar
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-16, -68, 32, 10);
    } else if (charDef.id === 'sukuna') {
      // Bare chest with cursed markings
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(-12, -63, 24, 38);
      // Tribal markings
      ctx.fillStyle = '#000000';
      ctx.fillRect(-8, -55, 16, 4);
      ctx.fillRect(-4, -45, 8, 12);
    }

    // 2. Head
    ctx.fillStyle = '#fed7aa'; // Skin tone
    ctx.beginPath();
    ctx.arc(0, -78, 14, 0, Math.PI * 2);
    ctx.fill();

    // 3. Hair
    if (charDef.id === 'gojo') {
      // Spiky White Hair
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-16, -82);
      ctx.lineTo(-12, -98);
      ctx.lineTo(-4, -86);
      ctx.lineTo(2, -102);
      ctx.lineTo(10, -88);
      ctx.lineTo(16, -96);
      ctx.lineTo(16, -80);
      ctx.fill();

      // Blindfold or Six Eyes cyan glow
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-14, -82, 28, 7);
      ctx.fillStyle = '#00d2ff';
      ctx.shadowColor = '#00d2ff';
      ctx.shadowBlur = 8;
      ctx.fillRect(2, -81, 7, 4);
    } else if (charDef.id === 'sukuna') {
      // Spiky Pink-salmon Hair
      ctx.fillStyle = '#fb7185';
      ctx.beginPath();
      ctx.moveTo(-15, -80);
      ctx.lineTo(-10, -96);
      ctx.lineTo(0, -100);
      ctx.lineTo(12, -94);
      ctx.lineTo(15, -78);
      ctx.fill();

      // Red eyes and markings
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(2, -79, 5, 3);
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, -84, 10, 2); // forehead mark
    } else if (charDef.id === 'itadori') {
      // Spiky Brown-pink Hair
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.moveTo(-14, -80);
      ctx.lineTo(-8, -94);
      ctx.lineTo(2, -98);
      ctx.lineTo(12, -92);
      ctx.lineTo(14, -78);
      ctx.fill();
    } else {
      // Megumi: Jet Black Spiky Sea Urchin Hair
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.moveTo(-16, -80);
      ctx.lineTo(-18, -98);
      ctx.lineTo(-8, -92);
      ctx.lineTo(0, -105);
      ctx.lineTo(10, -90);
      ctx.lineTo(18, -100);
      ctx.lineTo(16, -78);
      ctx.fill();
    }

    // 4. Legs
    ctx.fillStyle = charDef.id === 'sukuna' ? '#1e1b4b' : '#0f172a';
    if (f.action === 'walk') {
      const legCycle = Math.sin(Date.now() * 0.015);
      ctx.fillRect(-12 + legCycle * 8, -25, 10, 25);
      ctx.fillRect(2 - legCycle * 8, -25, 10, 25);
    } else if (f.action === 'jump') {
      // Tucked legs
      ctx.fillRect(-14, -25, 10, 18);
      ctx.fillRect(4, -25, 10, 14);
    } else {
      // Standing stance
      ctx.fillRect(-12, -25, 10, 25);
      ctx.fillRect(3, -25, 10, 25);
    }

    // 5. Arms & Attack Motion
    ctx.fillStyle = charDef.themeColor;
    if (isAttacking) {
      // Punching forward arm
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(4, -58, 35, 11);

      // Cursed Energy on Fist
      ctx.fillStyle = charDef.themeColor;
      ctx.shadowColor = charDef.themeColor;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(38, -52, 14, 0, Math.PI * 2);
      ctx.fill();

      // Back arm
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-22, -56, 12, 22);
    } else {
      // Guard stance arms
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-18, -60, 10, 24);
      ctx.fillRect(8, -60, 10, 24);
    }

    ctx.restore();
  };

  // Render Projectile Objects
  const renderProjectile = (ctx: CanvasRenderingContext2D, proj: Projectile) => {
    ctx.save();
    ctx.translate(proj.x, proj.y);

    if (proj.type === 'purple') {
      // Hollow Purple: Singularity sphere with dual orbits
      const rot = Date.now() * 0.02;

      // Outer violet destruction aura
      const grad = ctx.createRadialGradient(0, 0, 5, 0, 0, proj.radius);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#c084fc');
      grad.addColorStop(0.8, '#7e22ce');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, proj.radius, 0, Math.PI * 2);
      ctx.fill();

      // Blue & Red orbiting sparks
      ctx.fillStyle = '#00d2ff';
      ctx.beginPath();
      ctx.arc(Math.cos(rot) * (proj.radius * 0.8), Math.sin(rot) * (proj.radius * 0.8), 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(Math.cos(rot + Math.PI) * (proj.radius * 0.8), Math.sin(rot + Math.PI) * (proj.radius * 0.8), 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (proj.type === 'fire_arrow') {
      // Sukuna's Fuga
      ctx.fillStyle = '#f97316';
      ctx.shadowColor = '#ea580c';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(0, 0, proj.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, 0, proj.radius * 0.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Standard glowing energy orb
      ctx.fillStyle = proj.color;
      ctx.shadowColor = proj.color;
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(0, 0, proj.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, proj.radius * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  // On-screen Mobile / Click controls
  const handleVirtualSkill = (index: number) => {
    executeSkill(p1Ref.current, p2Ref.current, player1Char, index);
  };

  const handleVirtualDomain = () => {
    triggerDomainExpansion(p1Ref.current, player1Char);
  };

  const handleVirtualAttack = (heavy: boolean) => {
    const p1 = p1Ref.current;
    const p2 = p2Ref.current;
    if (p1.action === 'idle' || p1.action === 'walk') {
      p1.action = heavy ? 'attack_heavy' : 'attack_light';
      p1.actionTimer = heavy ? 22 : 14;
      const facingDir = p1.facing === 'right' ? 1 : -1;
      p1.vx = facingDir * (heavy ? 6 : 3);
      if (Math.abs(p1.x - p2.x) < 85 && Math.abs(p1.y - p2.y) < 50) {
        applyHit(p2, p1, player1Char.stats.attack * (heavy ? 0.9 : 0.45), heavy, heavy ? 'heavy' : 'light');
      }
    }
  };

  return (
    <div className="relative w-full max-w-[1000px] mx-auto select-none overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-2xl">
      {/* Dynamic Anime Combat HUD */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-start justify-between p-4 pointer-events-none">
        {/* Player 1 HUD Card */}
        <div className="flex items-center gap-3 w-5/12">
          <div className="relative w-14 h-14 rounded-lg overflow-hidden border-2 border-cyan-500 shrink-0 bg-slate-900 shadow-lg">
            <img
              src={player1Char.portrait}
              alt={player1Char.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {hudData.p1Domain && (
              <div className="absolute inset-0 bg-cyan-500/30 animate-pulse flex items-center justify-center">
                <span className="text-[9px] font-bold text-white bg-slate-950/80 px-1 rounded">DOMAIN</span>
              </div>
            )}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white tracking-wide">{player1Char.name}</span>
              <span className="text-slate-400 font-mono tabular-nums">{hudData.p1Hp} / {hudData.p1MaxHp}</span>
            </div>
            {/* Health Bar */}
            <div className="h-3.5 bg-slate-800/90 rounded overflow-hidden border border-slate-700/60 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-sm transition-all duration-150"
                style={{ width: `${Math.max(0, (hudData.p1Hp / hudData.p1MaxHp) * 100)}%` }}
              />
            </div>
            {/* Cursed Energy Bar */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-slate-800/90 rounded overflow-hidden border border-slate-700/40 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-cyan-600 to-blue-500 rounded-sm transition-all duration-100"
                  style={{ width: `${Math.max(0, (hudData.p1Ce / hudData.p1MaxCe) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-cyan-400 font-mono font-bold shrink-0">CE {hudData.p1Ce}%</span>
            </div>
            {hudData.p1Combo > 1 && (
              <div className="text-xs font-bold text-amber-400 animate-bounce">
                {hudData.p1Combo} HITS COMBO!
              </div>
            )}
          </div>
        </div>

        {/* Versus / Match Center Banner */}
        <div className="flex flex-col items-center justify-center shrink-0 px-2">
          <span className="text-sm font-black text-rose-500 tracking-widest font-mono">VS</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">{gameMode === 'versus_local' ? '2P LOCAL' : aiDifficulty}</span>
        </div>

        {/* Player 2 HUD Card */}
        <div className="flex items-center gap-3 w-5/12 flex-row-reverse text-right">
          <div className="relative w-14 h-14 rounded-lg overflow-hidden border-2 border-rose-500 shrink-0 bg-slate-900 shadow-lg">
            <img
              src={player2Char.portrait}
              alt={player2Char.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {hudData.p2Domain && (
              <div className="absolute inset-0 bg-rose-500/30 animate-pulse flex items-center justify-center">
                <span className="text-[9px] font-bold text-white bg-slate-950/80 px-1 rounded">DOMAIN</span>
              </div>
            )}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between flex-row-reverse text-xs">
              <span className="font-bold text-white tracking-wide">{player2Char.name}</span>
              <span className="text-slate-400 font-mono tabular-nums">{hudData.p2Hp} / {hudData.p2MaxHp}</span>
            </div>
            {/* Health Bar */}
            <div className="h-3.5 bg-slate-800/90 rounded overflow-hidden border border-slate-700/60 p-0.5">
              <div
                className="h-full bg-gradient-to-l from-rose-600 to-amber-500 rounded-sm transition-all duration-150 float-right"
                style={{ width: `${Math.max(0, (hudData.p2Hp / hudData.p2MaxHp) * 100)}%` }}
              />
            </div>
            {/* Cursed Energy Bar */}
            <div className="flex items-center gap-2 flex-row-reverse">
              <div className="flex-1 h-2 bg-slate-800/90 rounded overflow-hidden border border-slate-700/40 p-0.5">
                <div
                  className="h-full bg-gradient-to-l from-rose-600 to-orange-500 rounded-sm transition-all duration-100 float-right"
                  style={{ width: `${Math.max(0, (hudData.p2Ce / hudData.p2MaxCe) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-rose-400 font-mono font-bold shrink-0">CE {hudData.p2Ce}%</span>
            </div>
            {hudData.p2Combo > 1 && (
              <div className="text-xs font-bold text-rose-400 animate-bounce">
                {hudData.p2Combo} HITS COMBO!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main HTML5 Canvas */}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="block w-full h-auto aspect-[1000/560] cursor-crosshair"
      />

      {/* Interactive Combat Action Bar & Virtual Skills */}
      <div className="bg-slate-900/95 border-t border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* P1 Techniques & Hotkeys */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 mr-2">
            <button
              onClick={() => handleVirtualAttack(false)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded border border-slate-700 active:scale-95 transition-transform"
            >
              Light [J]
            </button>
            <button
              onClick={() => handleVirtualAttack(true)}
              className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded shadow active:scale-95 transition-transform"
            >
              Heavy [K]
            </button>
          </div>

          {/* Skill Buttons */}
          {player1Char.skills.map((skill, idx) => {
            const cd = hudData.p1Cooldowns[idx] || 0;
            const hasCe = hudData.p1Ce >= skill.cost;
            return (
              <button
                key={skill.id}
                onClick={() => handleVirtualSkill(idx)}
                disabled={cd > 0 || !hasCe}
                className={`relative px-3 py-1.5 rounded font-medium border transition-all text-left flex items-center gap-2 ${
                  cd > 0 || !hasCe
                    ? 'bg-slate-800/50 border-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-white hover:border-cyan-400 shadow-sm'
                }`}
              >
                <span className="font-mono text-cyan-400 font-bold">[{skill.key}]</span>
                <span className="truncate max-w-[120px]">{skill.name}</span>
                <span className="text-[10px] text-slate-400">({skill.cost} CE)</span>
                {cd > 0 && (
                  <span className="absolute inset-0 bg-slate-950/80 rounded flex items-center justify-center font-mono font-bold text-rose-400">
                    {cd.toFixed(1)}s
                  </span>
                )}
              </button>
            );
          })}

          {/* Domain Expansion Button */}
          <button
            onClick={handleVirtualDomain}
            disabled={hudData.p1Ce < player1Char.domain.cost || hudData.p1Domain}
            className={`px-3 py-1.5 rounded font-bold uppercase tracking-wider text-[11px] border transition-all ${
              hudData.p1Ce >= player1Char.domain.cost && !hudData.p1Domain
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-400 shadow-lg shadow-cyan-500/25 animate-pulse'
                : 'bg-slate-800/40 border-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            [R] Domain Expansion
          </button>
        </div>

        {/* Audio & Controls Info */}
        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
          <span className="hidden md:inline">Move: [A]/[D] · Jump: [W] · Guard: [L]</span>
        </div>
      </div>
    </div>
  );
};
