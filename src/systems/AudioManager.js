// AudioManager.js - Handles all sound effects and audio logic
// Adapted from temp/campus_rush_with_audio.html for modular use

export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.enabled = false;
        this.masterVolume = 0.3;
    }

    async initialize() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.enabled = true;
            const notice = document.getElementById('audioNotice');
            if (notice) notice.style.display = 'none';
            return true;
        } catch (error) {
            console.warn('Audio not supported:', error);
            return false;
        }
    }

    createOscillator(frequency, type = 'square') {
        if (!this.enabled || !this.audioContext) return null;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        return { oscillator, gainNode };
    }

    playTone(frequency, duration, type = 'square', volume = 1.0) {
        if (!this.enabled) return;
        const { oscillator, gainNode } = this.createOscillator(frequency, type);
        if (!oscillator) return;
        const now = this.audioContext.currentTime;
        const adjustedVolume = volume * this.masterVolume;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(adjustedVolume, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
        oscillator.start(now);
        oscillator.stop(now + duration);
    }

    // Sound effect methods
    playDoorOpen() {
        if (!this.enabled) return;
        const { oscillator, gainNode } = this.createOscillator(200, 'sawtooth');
        if (!oscillator) return;
        const now = this.audioContext.currentTime;
        oscillator.frequency.setValueAtTime(200, now);
        oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.15);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.6, now + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        oscillator.start(now);
        oscillator.stop(now + 0.15);
    }

    playSuccess() {
        this.playTone(523, 0.1, 'sine', 0.4);
        setTimeout(() => this.playTone(659, 0.1, 'sine', 0.4), 100);
        setTimeout(() => this.playTone(784, 0.2, 'sine', 0.5), 200);
    }

    playCollision() {
        if (!this.enabled) return;
        const { oscillator, gainNode } = this.createOscillator(150, 'sawtooth');
        if (!oscillator) return;
        const now = this.audioContext.currentTime;
        oscillator.frequency.setValueAtTime(150, now);
        oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.2);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.8, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        oscillator.start(now);
        oscillator.stop(now + 0.2);
        setTimeout(() => { this.playTone(100, 0.05, 'sawtooth', 0.6); }, 50);
    }

    playPowerupCollection() {
        this.playTone(330, 0.08, 'sine', 0.4);
        setTimeout(() => this.playTone(440, 0.08, 'sine', 0.4), 80);
        setTimeout(() => this.playTone(550, 0.08, 'sine', 0.4), 160);
        setTimeout(() => this.playTone(660, 0.12, 'sine', 0.5), 240);
    }

    playButtonPress() {
        this.playTone(800, 0.05, 'square', 0.3);
    }

    playMaleFriendContact() {
        this.playTone(440, 0.1, 'sine', 0.5);
        setTimeout(() => this.playTone(554, 0.1, 'sine', 0.5), 100);
        setTimeout(() => this.playTone(659, 0.15, 'sine', 0.6), 200);
        setTimeout(() => {
            this.playTone(880, 0.08, 'triangle', 0.4);
            setTimeout(() => this.playTone(1108, 0.08, 'triangle', 0.4), 80);
        }, 300);
    }

    playDoorPassUsed() {
        this.playTone(659, 0.1, 'sine', 0.5);
        setTimeout(() => this.playTone(784, 0.1, 'sine', 0.5), 100);
        setTimeout(() => this.playTone(988, 0.15, 'sine', 0.6), 200);
        setTimeout(() => this.playTone(1319, 0.2, 'sine', 0.7), 300);
    }

    playGameOver() {
        this.playTone(440, 0.2, 'sine', 0.6);
        setTimeout(() => this.playTone(370, 0.2, 'sine', 0.6), 200);
        setTimeout(() => this.playTone(330, 0.2, 'sine', 0.6), 400);
        setTimeout(() => this.playTone(294, 0.4, 'sine', 0.7), 600);
    }

    playVictory() {
        const victoryNotes = [523, 659, 784, 1047, 1319];
        victoryNotes.forEach((note, index) => {
            setTimeout(() => this.playTone(note, 0.2, 'sine', 0.7), index * 150);
        });
        setTimeout(() => {
            this.playTone(1047, 0.5, 'sine', 0.8);
            this.playTone(1319, 0.5, 'sine', 0.6);
            this.playTone(1568, 0.5, 'sine', 0.4);
        }, 1000);
    }
}
