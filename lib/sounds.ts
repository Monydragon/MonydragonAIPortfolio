// Sound effects system for interactive feedback

export type SoundType = 'click' | 'hover' | 'navigation' | 'success' | 'error' | 'pageTransition';

class SoundManager {
  private audioContext: AudioContext | null = null;
  private soundsEnabled: boolean = false;
  private volume: number = 0.3;
  private hasAttemptedInit = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadPreferences();
    }
  }

  private initAudioContext() {
    if (this.hasAttemptedInit) return;
    this.hasAttemptedInit = true;
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('AudioContext not supported');
    }
  }

  private ensureAudioContext() {
    if (!this.audioContext) {
      this.initAudioContext();
    }
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  // Generate sound using Web Audio API
  private generateSound(frequency: number, duration: number, type: 'sine' | 'square' | 'sawtooth' = 'sine'): void {
    if (!this.soundsEnabled) return;

    this.ensureAudioContext();
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  play(type: SoundType): void {
    if (!this.soundsEnabled) return;

    switch (type) {
      case 'click':
        // Short, crisp click sound
        this.generateSound(800, 0.05, 'sine');
        break;
      case 'hover':
        // Subtle hover sound
        this.generateSound(600, 0.03, 'sine');
        break;
      case 'navigation':
        // Navigation sound (slightly longer)
        this.generateSound(400, 0.1, 'sine');
        break;
      case 'success':
        // Success sound (ascending)
        this.generateSound(600, 0.15, 'sine');
        setTimeout(() => this.generateSound(800, 0.15, 'sine'), 50);
        break;
      case 'error':
        // Error sound (descending)
        this.generateSound(400, 0.2, 'square');
        break;
      case 'pageTransition':
        // Page transition sound
        this.generateSound(500, 0.2, 'sine');
        break;
    }
  }

  setEnabled(enabled: boolean): void {
    this.soundsEnabled = enabled;
    if (enabled) {
      this.ensureAudioContext();
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('soundsEnabled', enabled.toString());
    }
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  isEnabled(): boolean {
    return this.soundsEnabled;
  }

  loadPreferences(): void {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('soundsEnabled');
      if (saved !== null) {
        this.soundsEnabled = saved === 'true';
        if (this.soundsEnabled) {
          this.initAudioContext();
        }
      }
    }
  }
}

// Singleton instance
export const soundManager = new SoundManager();

