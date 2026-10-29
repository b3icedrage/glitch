import { Particle } from '../types/game';

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  vy: number;
  color: string;
  fontSize: number;
  alpha: number;
  life: number;
  maxLife: number;
  isBlackFlash?: boolean;
}

export interface SlashCut {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width: number;
  life: number;
  maxLife: number;
}

export interface LightningBranch {
  points: { x: number; y: number }[];
  color: string;
  width: number;
  life: number;
  maxLife: number;
  isBlackFlash?: boolean;
}

export class VFXEngine {
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];
  public slashes: SlashCut[] = [];
  public lightnings: LightningBranch[] = [];
  public screenShake: number = 0;
  public screenInvert: number = 0;
  public chromaticAberration: number = 0;

  public triggerScreenShake(intensity: number) {
    this.screenShake = Math.max(this.screenShake, intensity);
  }

  public triggerScreenInvert(durationFrames: number = 6) {
    this.screenInvert = durationFrames;
  }

  public update() {
    // Screen shake decay
    if (this.screenShake > 0) {
      this.screenShake *= 0.88;
      if (this.screenShake < 0.2) this.screenShake = 0;
    }

    // Screen invert decay
    if (this.screenInvert > 0) {
      this.screenInvert -= 1;
    }

    // Chromatic aberration decay
    if (this.chromaticAberration > 0) {
      this.chromaticAberration *= 0.85;
      if (this.chromaticAberration < 0.1) this.chromaticAberration = 0;
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.gravity) p.vy += p.gravity;
      p.life -= 1;
      p.alpha = Math.max(0, p.life / p.maxLife);

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.vy *= 0.94;
      ft.life -= 1;
      ft.alpha = Math.max(0, ft.life / ft.maxLife);

      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Update slashes
    for (let i = this.slashes.length - 1; i >= 0; i--) {
      const s = this.slashes[i];
      s.life -= 1;
      if (s.life <= 0) {
        this.slashes.splice(i, 1);
      }
    }

    // Update lightnings
    for (let i = this.lightnings.length - 1; i >= 0; i--) {
      const l = this.lightnings[i];
      l.life -= 1;
      if (l.life <= 0) {
        this.lightnings.splice(i, 1);
      }
    }
  }

  // --- Particle Emitter Generators ---

  public emitHitSparks(x: number, y: number, color: string, count: number = 18, isCritical: boolean = false) {
    if (isCritical) {
      this.triggerScreenShake(8);
      this.chromaticAberration = 12;
    } else {
      this.triggerScreenShake(3);
    }

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * (isCritical ? 12 : 7) + 2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        color: isCritical ? '#facc15' : color,
        alpha: 1,
        life: Math.floor(Math.random() * 15 + 10),
        maxLife: 25,
        type: 'spark',
        gravity: 0.25,
      });
    }

    // Shockwave ring
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      size: 10,
      color: isCritical ? '#ffffff' : color,
      alpha: 0.9,
      life: 14,
      maxLife: 14,
      type: 'shockwave',
    });
  }

  // --- BLACK FLASH (Kokusen) Visual Explosion ---
  public emitBlackFlashVFX(x: number, y: number) {
    this.triggerScreenShake(26);
    this.triggerScreenInvert(8);
    this.chromaticAberration = 24;

    // 1. Generate branching jagged red & black lightning bolts
    for (let b = 0; b < 12; b++) {
      const angle = (b / 12) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const length = Math.random() * 140 + 90;
      const segments = 6;
      const points: { x: number; y: number }[] = [{ x, y }];

      for (let s = 1; s <= segments; s++) {
        const segDist = (length / segments) * s;
        const perpOffset = (Math.random() - 0.5) * 35;
        const px = x + Math.cos(angle) * segDist + Math.cos(angle + Math.PI / 2) * perpOffset;
        const py = y + Math.sin(angle) * segDist + Math.sin(angle + Math.PI / 2) * perpOffset;
        points.push({ x: px, y: py });
      }

      this.lightnings.push({
        points,
        color: b % 2 === 0 ? '#ff1e42' : '#000000',
        width: Math.random() * 4 + 3,
        life: 16,
        maxLife: 16,
        isBlackFlash: true,
      });
    }

    // 2. High-speed red & black sparks
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 16 + 6;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 6 + 3,
        color: i % 2 === 0 ? '#ef4444' : '#111827',
        alpha: 1,
        life: 25,
        maxLife: 25,
        type: 'spark',
        gravity: 0.2,
      });
    }

    // 3. Huge expanding shockwave ring
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      size: 20,
      color: '#ff2a55',
      alpha: 1,
      life: 22,
      maxLife: 22,
      type: 'shockwave',
    });

    // 4. Floating callout
    this.addFloatingText('BLACK FLASH!', x, y - 45, '#ff2255', 28, true);
  }

  // --- Sukuna Dismantle Razor Cuts ---
  public emitDismantleSlashes(x: number, y: number, facing: 'left' | 'right') {
    this.triggerScreenShake(7);
    const count = 3;
    for (let i = 0; i < count; i++) {
      const angle = (Math.random() * 0.8 - 0.4) + (facing === 'right' ? 0.3 : 2.8);
      const len = 120 + Math.random() * 60;
      const midX = x + (Math.random() - 0.5) * 40;
      const midY = y + (Math.random() - 0.5) * 50;

      this.slashes.push({
        x1: midX - Math.cos(angle) * (len / 2),
        y1: midY - Math.sin(angle) * (len / 2),
        x2: midX + Math.cos(angle) * (len / 2),
        y2: midY + Math.sin(angle) * (len / 2),
        color: '#ffffff',
        width: 3.5,
        life: 10,
        maxLife: 10,
      });
    }
  }

  // --- Cursed Energy Aura particles ---
  public emitAura(x: number, y: number, color: string, intensity: number = 2) {
    for (let i = 0; i < intensity; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 36,
        y: y + (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -(Math.random() * 3 + 1.5),
        size: Math.random() * 7 + 3,
        color,
        alpha: 0.65,
        life: 18,
        maxLife: 18,
        type: 'aura',
      });
    }
  }

  // --- Floating Combat Text ---
  public addFloatingText(text: string, x: number, y: number, color: string, fontSize: number = 18, isBlackFlash: boolean = false) {
    this.floatingTexts.push({
      id: Math.random().toString(),
      text,
      x: x + (Math.random() - 0.5) * 20,
      y,
      vy: -2.8,
      color,
      fontSize,
      alpha: 1,
      life: isBlackFlash ? 40 : 25,
      maxLife: isBlackFlash ? 40 : 25,
      isBlackFlash,
    });
  }

  // --- Canvas Render Method ---
  public render(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // 1. Screen Invert Effect (for Black Flash)
    if (this.screenInvert > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'difference';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    // 2. Render Slashes (Dismantle / Cleave)
    for (const s of this.slashes) {
      ctx.save();
      const progress = s.life / s.maxLife;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width * progress;
      ctx.shadowColor = '#e11d48';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(s.x2, s.y2);
      ctx.stroke();

      // Sharp crimson core
      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = s.width * 0.5 * progress;
      ctx.stroke();
      ctx.restore();
    }

    // 3. Render Lightnings (Black Flash arcs)
    for (const l of this.lightnings) {
      if (l.points.length < 2) continue;
      ctx.save();
      const progress = l.life / l.maxLife;

      // Outer glow
      ctx.strokeStyle = l.color;
      ctx.lineWidth = l.width * progress * 1.5;
      ctx.shadowColor = l.isBlackFlash ? '#ff1e42' : '#60a5fa';
      ctx.shadowBlur = l.isBlackFlash ? 20 : 10;
      ctx.beginPath();
      ctx.moveTo(l.points[0].x, l.points[0].y);
      for (let p = 1; p < l.points.length; p++) {
        ctx.lineTo(l.points[p].x, l.points[p].y);
      }
      ctx.stroke();

      // Inner core
      ctx.strokeStyle = l.isBlackFlash ? '#000000' : '#ffffff';
      ctx.lineWidth = l.width * progress * 0.6;
      ctx.stroke();
      ctx.restore();
    }

    // 4. Render Particles
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;

      if (p.type === 'shockwave') {
        const progress = 1 - p.life / p.maxLife;
        const currentRadius = p.size + progress * 90;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 4 * (1 - progress);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.type === 'aura') {
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Spark
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 5. Render Floating Texts
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.font = ft.isBlackFlash
        ? `900 ${ft.fontSize}px 'Outfit', sans-serif`
        : `700 ${ft.fontSize}px 'Outfit', sans-serif`;
      ctx.textAlign = 'center';

      if (ft.isBlackFlash) {
        // Red and black double stroke
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 6;
        ctx.strokeText(ft.text, ft.x, ft.y);
        ctx.fillStyle = ft.color;
        ctx.shadowColor = '#ff2255';
        ctx.shadowBlur = 16;
        ctx.fillText(ft.text, ft.x, ft.y);
      } else {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.lineWidth = 4;
        ctx.strokeText(ft.text, ft.x, ft.y);
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y);
      }
      ctx.restore();
    }
  }
}

export const vfx = new VFXEngine();
