/**
 * Web Audio API synthesizer for cozy lo-fi background music and realistic tactile SFX
 * Zero external audio files required — runs 100% reliably in any browser environment!
 */

class CozySoundManager {
  private ctx: AudioContext | null = null;
  private isBgmPlaying = false;
  private bgmIntervalId: number | null = null;
  private rainNode: AudioNode | null = null;
  private rainGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;

  private currentTrack = 'Rainy Tea at 4PM';
  private chordIndex = 0;
  private currentScale: number[] = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25]; // C Major / A Minor cozy pentatonic

  // Cozy Lo-Fi Progression Chords (frequencies in Hz)
  private readonly chordProgressions: Record<string, { chords: number[][]; tempoMs: number }> = {
    'Rainy Tea at 4PM': {
      // Dm9 - G13 - Cmaj9 - Am7
      chords: [
        [146.83, 220.00, 261.63, 293.66, 349.23], // Dm9
        [196.00, 246.94, 293.66, 329.63, 440.00], // G13
        [130.81, 196.00, 246.94, 261.63, 329.63], // Cmaj9
        [110.00, 164.81, 220.00, 261.63, 329.63], // Am7
      ],
      tempoMs: 3800,
    },
    'Greenhouse Sunlight': {
      // Fmaj7 - Em7 - Dm7 - Cmaj7
      chords: [
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [164.81, 196.00, 246.94, 293.66], // Em7
        [146.83, 174.61, 220.00, 261.63], // Dm7
        [130.81, 164.81, 196.00, 246.94], // Cmaj7
      ],
      tempoMs: 3400,
    },
    'Lavender Breeze': {
      // Abmaj7 - Ebmaj7 - Fm9 - Dbmaj7
      chords: [
        [207.65, 261.63, 311.13, 392.00],
        [155.56, 196.00, 233.08, 311.13],
        [174.61, 207.65, 261.63, 311.13, 392.00],
        [138.59, 174.61, 207.65, 261.63],
      ],
      tempoMs: 4000,
    },
    'Cozy Cottage Lofi': {
      // Emaj9 - C#m7 - F#m7 - B11
      chords: [
        [164.81, 246.94, 329.63, 392.00, 493.88],
        [138.59, 207.65, 277.18, 329.63],
        [185.00, 220.00, 277.18, 329.63],
        [123.47, 185.00, 246.94, 329.63],
      ],
      tempoMs: 3600,
    },
  };

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.65, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.initRainGenerator();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private initRainGenerator() {
    if (!this.ctx || !this.masterGain) return;

    // Pink noise buffer for cozy rain ambience
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter for muffled window rain sound
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, this.ctx.currentTime);

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.setValueAtTime(0, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.rainGain);
    this.rainGain.connect(this.masterGain);

    whiteNoise.start(0);
    this.rainNode = whiteNoise;
  }

  public setRainVolume(volume: number) {
    this.initContext();
    if (this.rainGain && this.ctx) {
      this.rainGain.gain.setTargetAtTime(Math.max(0, Math.min(1, volume * 0.35)), this.ctx.currentTime, 0.2);
    }
  }

  public setBgmVolume(volume: number) {
    this.initContext();
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setTargetAtTime(Math.max(0, Math.min(1, volume * 0.5)), this.ctx.currentTime, 0.1);
    }
  }

  public setSfxVolume(volume: number) {
    this.initContext();
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime, 0.1);
    }
  }

  public setTrack(trackName: string) {
    if (this.chordProgressions[trackName]) {
      this.currentTrack = trackName;
      this.chordIndex = 0;
    }
  }

  public getTrackNames(): string[] {
    return Object.keys(this.chordProgressions);
  }

  public getCurrentTrack(): string {
    return this.currentTrack;
  }

  public isPlaying(): boolean {
    return this.isBgmPlaying;
  }

  public startBgm() {
    this.initContext();
    if (this.isBgmPlaying) return;
    this.isBgmPlaying = true;
    this.chordIndex = 0;
    this.playNextChordCycle();
  }

  public stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmIntervalId !== null) {
      window.clearTimeout(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
  }

  public toggleBgm(): boolean {
    if (this.isBgmPlaying) {
      this.stopBgm();
      return false;
    } else {
      this.startBgm();
      return true;
    }
  }

  private playNextChordCycle() {
    if (!this.isBgmPlaying || !this.ctx || !this.bgmGain) return;

    const track = this.chordProgressions[this.currentTrack] || this.chordProgressions['Rainy Tea at 4PM'];
    const chord = track.chords[this.chordIndex % track.chords.length];
    const tempo = track.tempoMs;

    this.playLoFiChord(chord, tempo / 1000);

    // Arpeggiated melody notes sprinkled softly
    const noteCount = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < noteCount; i++) {
      const delay = (i + 1) * (tempo / (noteCount + 2)) + (Math.random() * 200 - 100);
      window.setTimeout(() => {
        if (!this.isBgmPlaying) return;
        const randomNote = chord[Math.floor(Math.random() * chord.length)] * (Math.random() > 0.4 ? 2 : 1);
        this.playMelodyNote(randomNote);
      }, delay);
    }

    this.chordIndex++;
    this.bgmIntervalId = window.setTimeout(() => {
      this.playNextChordCycle();
    }, tempo);
  }

  private playLoFiChord(freqs: number[], duration: number) {
    if (!this.ctx || !this.bgmGain) return;
    const now = this.ctx.currentTime;

    freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.bgmGain) return;
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Warm rhodes / electric piano blend (sine + soft triangle)
      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq + (Math.random() * 0.4 - 0.2), now);

      // Lowpass for lo-fi warmth
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(850 + idx * 80, now);
      filter.Q.setValueAtTime(1.2, now);

      // Soft envelope attack & decay
      const attack = 0.12 + idx * 0.03;
      noteGain.gain.setValueAtTime(0, now);
      noteGain.gain.linearRampToValueAtTime(0.08 / (freqs.length * 0.6), now + attack);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.95);

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.bgmGain);

      osc.start(now);
      osc.stop(now + duration);
    });
  }

  private playMelodyNote(freq: number) {
    if (!this.ctx || !this.bgmGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.04, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGain);

    osc.start(now);
    osc.stop(now + 1.8);
  }

  // --- SOUND EFFECTS (SFX) ---

  public playSnip() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // High snap shears sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, now);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  public playWatering() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Gurgling water drops / splash
    for (let i = 0; i < 3; i++) {
      const dropTime = now + i * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600 + Math.random() * 400, dropTime);
      osc.frequency.exponentialRampToValueAtTime(1200 + Math.random() * 300, dropTime + 0.09);

      gain.gain.setValueAtTime(0.15, dropTime);
      gain.gain.exponentialRampToValueAtTime(0.001, dropTime + 0.09);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(dropTime);
      osc.stop(dropTime + 0.1);
    }
  }

  public playPaperRustle() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Kraft paper wrap rustle
    const bufferSize = this.ctx.sampleRate * 0.15;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, now);
    filter.Q.setValueAtTime(2.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
  }

  public playRibbonTie() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Soft silk cinch sound (sine glissando + soft chime)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playCoin() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Classic bright dual coin ping (B5 -> E6)
    [987.77, 1318.51].forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      gain.gain.setValueAtTime(0.2, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.4);
    });
  }

  public playCatPurr() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Low gentle purr vibration (low freq modulation)
    const osc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const mainGain = this.ctx.createGain();

    lfo.frequency.setValueAtTime(18, now); // 18Hz purr rhythm
    lfoGain.gain.setValueAtTime(25, now);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(75, now);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, now);

    mainGain.gain.setValueAtTime(0, now);
    mainGain.gain.linearRampToValueAtTime(0.25, now + 0.15);
    mainGain.gain.linearRampToValueAtTime(0, now + 0.8);

    osc.connect(filter);
    filter.connect(mainGain);
    mainGain.connect(this.sfxGain);

    lfo.start(now);
    osc.start(now);
    lfo.stop(now + 0.85);
    osc.stop(now + 0.85);
  }

  public playChime() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Wind chime chord (E5, G#5, B5, E6)
    const chord = [659.25, 830.61, 987.77, 1318.51];
    chord.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.12, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 1.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 1.25);
    });
  }
}

export const soundManager = new CozySoundManager();
