// Synthesized Web Audio API sound engine for Jujutsu Kaisen Cursed Clash

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private isMuted: boolean = false;
  private sfxVolume: number = 0.8;
  private bgmVolume: number = 0.35;
  private bgmInterval: number | null = null;
  private isBgmPlaying: boolean = false;
  private bgmStep: number = 0;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 1, this.ctx.currentTime);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  public setBgmVolume(vol: number) {
    this.bgmVolume = Math.max(0, Math.min(1, vol));
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
    }
  }

  // --- Core Sound Synthesis Utilities ---

  private createNoiseBuffer(duration: number): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // --- Jujutsu Sound Effects ---

  public playHit(type: 'light' | 'heavy' | 'critical' | 'block') {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    if (type === 'block') {
      // Metallic resonant barrier clink
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.15);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.15);
      return;
    }

    // Impact punch
    const baseFreq = type === 'critical' ? 70 : type === 'heavy' ? 90 : 130;
    const duration = type === 'critical' ? 0.35 : type === 'heavy' ? 0.25 : 0.15;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq * 2.5, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, now + duration);

    gain.gain.setValueAtTime(type === 'critical' ? 0.9 : 0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + duration);

    // Punch thump noise burst
    const noiseBuffer = this.createNoiseBuffer(duration * 0.8);
    if (noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      const filter = this.ctx.createBiquadFilter();
      const noiseGain = this.ctx.createGain();

      noise.buffer = noiseBuffer;
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(type === 'critical' ? 1200 : 700, now);
      filter.frequency.exponentialRampToValueAtTime(100, now + duration * 0.8);

      noiseGain.gain.setValueAtTime(type === 'critical' ? 0.8 : 0.5, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.8);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.sfxGain);
      noise.start(now);
    }
  }

  // --- BLACK FLASH (Kokusen) ---
  // Sub bass drop, distortion snap, spatial bell ringing
  public playBlackFlash() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // 1. Massive Sub-Drop (60Hz down to 18Hz)
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(80, now);
    subOsc.frequency.exponentialRampToValueAtTime(18, now + 0.8);

    subGain.gain.setValueAtTime(1.0, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);
    subOsc.start(now);
    subOsc.stop(now + 0.8);

    // 2. High-Voltage Electric Distortion Crackle
    const oscDistort = this.ctx.createOscillator();
    const waveShaper = this.ctx.createWaveShaper();
    const distGain = this.ctx.createGain();

    // Soft clipping curve
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i * 2) / 256 - 1;
      curve[i] = ((Math.PI + 10) * x) / (Math.PI + 10 * Math.abs(x));
    }
    waveShaper.curve = curve;

    oscDistort.type = 'sawtooth';
    oscDistort.frequency.setValueAtTime(440, now);
    oscDistort.frequency.exponentialRampToValueAtTime(60, now + 0.3);

    distGain.gain.setValueAtTime(0.8, now);
    distGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    oscDistort.connect(waveShaper);
    waveShaper.connect(distGain);
    distGain.connect(this.sfxGain);
    oscDistort.start(now);
    oscDistort.stop(now + 0.35);

    // 3. Eerie Resonant Bell Chime (Cursed energy distortion)
    const bellOsc = this.ctx.createOscillator();
    const bellGain = this.ctx.createGain();
    bellOsc.type = 'sine';
    bellOsc.frequency.setValueAtTime(520, now + 0.05);
    bellOsc.frequency.exponentialRampToValueAtTime(260, now + 0.6);

    bellGain.gain.setValueAtTime(0.6, now + 0.05);
    bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    bellOsc.connect(bellGain);
    bellGain.connect(this.sfxGain);
    bellOsc.start(now + 0.05);
    bellOsc.stop(now + 0.7);
  }

  // --- Gojo: Limitless Blue (Cursed Technique Lapse) ---
  public playLimitlessBlue() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Vacuum suction sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.5);

    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  // --- Gojo: Limitless Red (Cursed Technique Reversal) ---
  public playLimitlessRed() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Explosive divergence
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.4);

    gain.gain.setValueAtTime(0.85, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.45);
  }

  // --- Gojo: Hollow Purple (Murasaki) ---
  public playHollowPurple() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // 1. Dual tone spatial oscillation
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const mixGain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(220, now);
    osc2.frequency.setValueAtTime(224, now); // Detuned beat frequency

    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.4);
    osc2.frequency.exponentialRampToValueAtTime(888, now + 0.4);

    mixGain.gain.setValueAtTime(0.6, now);
    mixGain.gain.setValueAtTime(0.9, now + 0.35);
    mixGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc1.connect(mixGain);
    osc2.connect(mixGain);
    mixGain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.5);
    osc2.stop(now + 0.5);

    // 2. Erasing blast aftermath (Thunderous sub-bass tremor)
    const boomOsc = this.ctx.createOscillator();
    const boomGain = this.ctx.createGain();
    boomOsc.type = 'sawtooth';
    boomOsc.frequency.setValueAtTime(140, now + 0.35);
    boomOsc.frequency.exponentialRampToValueAtTime(25, now + 1.2);

    boomGain.gain.setValueAtTime(0.95, now + 0.35);
    boomGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    boomOsc.connect(boomGain);
    boomGain.connect(this.sfxGain);
    boomOsc.start(now + 0.35);
    boomOsc.stop(now + 1.2);
  }

  // --- Sukuna: Dismantle (Kai) & Cleave (Hachi) ---
  public playDismantle() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Ultra sharp razor blade cut
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.18);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, now);
    filter.Q.value = 4;

    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  public playCleave() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    // Multi-cut sequence
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.playDismantle();
      }, i * 70);
    }
  }

  // --- Sukuna: Fire Arrow (Fūga) ---
  public playFireArrow() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Rising ignition flame whistle
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(1100, now + 0.3);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.9, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.8);
  }

  // --- DOMAIN EXPANSION (Ryōiki Tenkai) ---
  // Temple gong bell + heartbeat throb + barrier crystallization snap
  public playDomainExpansion() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // 1. Ominous temple gong bell
    const gong = this.ctx.createOscillator();
    const gongGain = this.ctx.createGain();
    gong.type = 'sine';
    gong.frequency.setValueAtTime(174.61, now); // F3 note
    gong.frequency.exponentialRampToValueAtTime(110, now + 1.8);

    gongGain.gain.setValueAtTime(0.9, now);
    gongGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

    gong.connect(gongGain);
    gongGain.connect(this.sfxGain);
    gong.start(now);
    gong.stop(now + 1.8);

    // 2. Pulse of Cursed Domain
    const pulse = this.ctx.createOscillator();
    const pulseGain = this.ctx.createGain();
    pulse.type = 'triangle';
    pulse.frequency.setValueAtTime(70, now + 0.2);
    pulse.frequency.exponentialRampToValueAtTime(40, now + 0.6);

    pulseGain.gain.setValueAtTime(0.8, now + 0.2);
    pulseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    pulse.connect(pulseGain);
    pulseGain.connect(this.sfxGain);
    pulse.start(now + 0.2);
    pulse.stop(now + 0.6);

    // 3. Glass / Barrier Crystallization snap
    const crystal = this.ctx.createOscillator();
    const crystalGain = this.ctx.createGain();
    crystal.type = 'sine';
    crystal.frequency.setValueAtTime(1400, now + 0.4);
    crystal.frequency.exponentialRampToValueAtTime(2200, now + 0.7);

    crystalGain.gain.setValueAtTime(0.5, now + 0.4);
    crystalGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    crystal.connect(crystalGain);
    crystalGain.connect(this.sfxGain);
    crystal.start(now + 0.4);
    crystal.stop(now + 0.85);
  }

  // --- Megumi: Shikigami Sounds ---
  public playShikigami(type: 'wolf' | 'nue' | 'mahoraga') {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    if (type === 'wolf') {
      // Beast roar snap
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);
      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'nue') {
      // Electric screech
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.linearRampToValueAtTime(1800, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.4);
      gain.gain.setValueAtTime(0.65, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.4);
    } else {
      // Mahoraga wheel rotation metallic click
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1320, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.25);
      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  }

  // --- Dynamic Procedural Anime Combat BGM ---
  public startCombatBgm() {
    if (this.isBgmPlaying) return;
    this.initContext();
    this.isBgmPlaying = true;
    this.bgmStep = 0;

    // Tempo: 130 BPM (~115ms per 16th note)
    const stepInterval = (60 / 130 / 4) * 1000;

    // Bassline and drum notes for intense JJK dark anime theme
    const bassline = [
      65.41, 65.41, 77.78, 65.41, // C2, C2, Eb2, C2
      87.31, 65.41, 98.00, 77.78, // F2, C2, G2, Eb2
      65.41, 65.41, 77.78, 87.31,
      61.74, 61.74, 65.41, 58.27, // B1, B1, C2, Bb1
    ];

    const chords = [
      [261.63, 311.13, 392.00], // C minor
      [261.63, 311.13, 415.30], // Ab major
      [293.66, 349.23, 440.00], // D diminished
      [246.94, 311.13, 369.99], // B diminished / tension
    ];

    this.bgmInterval = window.setInterval(() => {
      if (!this.ctx || !this.bgmGain || this.isMuted) {
        this.bgmStep = (this.bgmStep + 1) % 64;
        return;
      }

      const now = this.ctx.currentTime;
      const step16 = this.bgmStep % 16;
      const bar = Math.floor(this.bgmStep / 16) % 4;

      // 1. Kick Drum on beats 0, 4, 8, 12
      if (step16 % 4 === 0) {
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(140, now);
        kickOsc.frequency.exponentialRampToValueAtTime(35, now + 0.12);
        kickGain.gain.setValueAtTime(0.5, now);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        kickOsc.connect(kickGain);
        kickGain.connect(this.bgmGain);
        kickOsc.start(now);
        kickOsc.stop(now + 0.12);
      }

      // 2. Snare / Clap on beats 4 and 12
      if (step16 === 4 || step16 === 12) {
        const snareBuf = this.createNoiseBuffer(0.1);
        if (snareBuf) {
          const noise = this.ctx.createBufferSource();
          const filter = this.ctx.createBiquadFilter();
          const noiseGain = this.ctx.createGain();
          noise.buffer = snareBuf;
          filter.type = 'highpass';
          filter.frequency.setValueAtTime(1000, now);
          noiseGain.gain.setValueAtTime(0.28, now);
          noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
          noise.connect(filter);
          filter.connect(noiseGain);
          noiseGain.connect(this.bgmGain);
          noise.start(now);
        }
      }

      // 3. Arpeggiated Dark Bass Synth
      const bassNote = bassline[step16];
      if (bassNote) {
        const bassOsc = this.ctx.createOscillator();
        const bassFilter = this.ctx.createBiquadFilter();
        const bGain = this.ctx.createGain();

        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(bassNote, now);

        bassFilter.type = 'lowpass';
        bassFilter.frequency.setValueAtTime(380, now);
        bassFilter.frequency.exponentialRampToValueAtTime(120, now + 0.1);

        bGain.gain.setValueAtTime(0.3, now);
        bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        bassOsc.connect(bassFilter);
        bassFilter.connect(bGain);
        bGain.connect(this.bgmGain);
        bassOsc.start(now);
        bassOsc.stop(now + 0.1);
      }

      // 4. Eerie chord pad pulse on start of every bar
      if (step16 === 0) {
        const chordNotes = chords[bar];
        chordNotes.forEach((freq) => {
          if (!this.ctx || !this.bgmGain) return;
          const padOsc = this.ctx.createOscillator();
          const padGain = this.ctx.createGain();
          padOsc.type = 'triangle';
          padOsc.frequency.setValueAtTime(freq, now);

          padGain.gain.setValueAtTime(0.08, now);
          padGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

          padOsc.connect(padGain);
          padGain.connect(this.bgmGain);
          padOsc.start(now);
          padOsc.stop(now + 0.8);
        });
      }

      this.bgmStep = (this.bgmStep + 1) % 64;
    }, stepInterval);
  }

  public stopCombatBgm() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    this.isBgmPlaying = false;
  }

  // =========================================================================
  // DARWIN-40 PROCEDURAL SOUND SYNTHESIS
  // =========================================================================

  public playCoinDrop() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    [1046.5, 1318.5, 1567.98, 2093.0].forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);

      gain.gain.setValueAtTime(0.2, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.3);
    });
  }

  public playMitosisChime() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    // Cyberpunk harmonic chord: F#4 -> A#4 -> C#5 -> F#5 -> G#5
    const notes = [369.99, 466.16, 554.37, 739.99, 830.61];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.25, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.5);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.5);
    });
  }

  public playSelfDestruct() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;

    // 1. Descending pitch crash
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.6);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.6);

    // 2. Static white noise wipe
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.4);

    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.35, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + 0.4);
  }

  public playPurgeAlarm() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(660, now + 0.12);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playSpawn() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playClick() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.04);
  }
}

export const soundEngine = new SoundEngine();
