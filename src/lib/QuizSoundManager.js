/**
 * QuizSoundManager
 *
 * Feedback sonore instantané pour quiz, 100% synthétisé via Web Audio API.
 * Aucun fichier externe : les sons sont générés en temps réel a chaque appel,
 * donc pas de latence réseau/décodage et pas d'asset a livrer.
 *
 * Usage :
 *   const sounds = new QuizSoundManager();
 *   sounds.playCorrect();
 *   sounds.playWrong();
 *   sounds.playNext();
 *   sounds.playStart();
 *   sounds.setVolume(80);   // 0-100
 *   sounds.toggleMute();    // ou sounds.setMuted(true)
 */
export class QuizSoundManager {
  constructor({ volume = 80, muted = false } = {}) {
    this.ctx = null; // AudioContext cree paresseusement (regles autoplay navigateur)
    this.volume = this._clampVolume(volume);
    this.muted = muted;
  }

  /** Cree l'AudioContext au premier son, et le reveille s'il est suspendu. */
  _ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      // Doit etre appele depuis un handler d'interaction utilisateur (click, etc.)
      this.ctx.resume();
    }
    return this.ctx;
  }

  _clampVolume(v) {
    return Math.min(100, Math.max(0, v)) / 100;
  }

  setVolume(v) {
    this.volume = this._clampVolume(v);
  }

  setMuted(muted) {
    this.muted = muted;
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  /**
   * Enveloppe de gain generique : attaque quasi instantanee, decroissance
   * exponentielle courte. C'est ce qui rend chaque son "percutant" plutot
   * que d'avoir un clic au demarrage/arret.
   */
  _envelope(gainNode, ctx, now, duration, peak) {
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(peak, now + 0.008);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
  }

  /** Joue un seul oscillateur (une note) avec l'enveloppe standard. */
  _tone({ freq, type = "sine", duration, delay = 0, peak = 1, freqEnd = null }) {
    if (this.muted || this.volume === 0) return;

    const ctx = this._ensureContext();
    const now = ctx.currentTime + delay;

    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (freqEnd !== null) {
      osc.frequency.exponentialRampToValueAtTime(freqEnd, now + duration);
    }

    const gain = ctx.createGain();
    this._envelope(gain, ctx, now, duration, peak * this.volume);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  /**
   * Bonne reponse : bip montant en deux notes, ~180ms. Type "ding" satisfaisant.
   */
  playCorrect() {
    this._tone({ freq: 880, type: "sine", duration: 0.09, peak: 0.5 });
    this._tone({ freq: 1320, type: "sine", duration: 0.11, delay: 0.06, peak: 0.5 });
  }

  /**
   * Mauvaise reponse : buzzer grave, courte dent-de-scie qui descend, ~120ms.
   */
  playWrong() {
    this._tone({
      freq: 180,
      freqEnd: 90,
      type: "sawtooth",
      duration: 0.12,
      peak: 0.45,
    });
  }

  /**
   * Transition vers la question suivante : tick leger et neutre, ~80ms.
   */
  playNext() {
    this._tone({ freq: 600, type: "triangle", duration: 0.08, peak: 0.3 });
  }

  /**
   * Debut du quiz : petite fanfare montante en 3 notes, ~250ms au total.
   */
  playStart() {
    this._tone({ freq: 523.25, type: "square", duration: 0.09, delay: 0, peak: 0.35 }); // C5
    this._tone({ freq: 659.25, type: "square", duration: 0.09, delay: 0.08, peak: 0.35 }); // E5
    this._tone({ freq: 783.99, type: "square", duration: 0.13, delay: 0.16, peak: 0.4 }); // G5
  }

  /** A appeler quand le composant se demonte, pour liberer l'AudioContext. */
  destroy() {
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

export default QuizSoundManager;
