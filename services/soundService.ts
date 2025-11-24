
// Simple synthesizer for UI sound effects using Web Audio API
// No external assets required.

class SoundService {
    private audioCtx: AudioContext | null = null;
    private gainNode: GainNode | null = null;
    private enabled: boolean = true;
    
    // Focus Drone Nodes
    private droneOsc1: OscillatorNode | null = null;
    private droneOsc2: OscillatorNode | null = null;
    private droneGain: GainNode | null = null;

    private init() {
        if (!this.audioCtx) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                this.audioCtx = new AudioContextClass();
                this.gainNode = this.audioCtx.createGain();
                this.gainNode.connect(this.audioCtx.destination);
            }
        }
    }

    public toggle(enabled: boolean) {
        this.enabled = enabled;
        if (!enabled) this.stopFocusDrone();
    }

    private playTone(freq: number, type: OscillatorType, duration: number, vol: number = 0.1) {
        if (!this.enabled) return;
        this.init();
        if (!this.audioCtx || !this.gainNode) return;

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
        
        gain.connect(this.audioCtx.destination);
        gain.gain.setValueAtTime(vol, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

        osc.connect(gain);
        osc.start();
        osc.stop(this.audioCtx.currentTime + duration);
    }

    public playHover() {
        this.playTone(800, 'sine', 0.05, 0.02);
    }

    public playClick() {
        this.playTone(300, 'square', 0.05, 0.05);
    }

    public playSuccess() {
        if (!this.enabled) return;
        this.init();
        if (!this.audioCtx) return;
        
        const now = this.audioCtx.currentTime;
        [440, 554, 659, 880].forEach((freq, i) => {
            const osc = this.audioCtx!.createOscillator();
            const gain = this.audioCtx!.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.05, now + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.2);
            osc.connect(gain);
            gain.connect(this.audioCtx!.destination);
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.2);
        });
    }

    public playError() {
        this.playTone(150, 'sawtooth', 0.3, 0.05);
    }

    public playTyping() {
        const freq = 600 + Math.random() * 200;
        this.playTone(freq, 'sine', 0.03, 0.01);
    }

    // --- FOCUS DRONE ---
    // Generates a low, throbbing sci-fi hum
    public startFocusDrone() {
        if (!this.enabled) return;
        this.init();
        if (!this.audioCtx) return;

        // Prevent multiple drones
        if (this.droneOsc1) return;

        this.droneGain = this.audioCtx.createGain();
        this.droneGain.gain.value = 0; // Start silent and fade in
        this.droneGain.connect(this.audioCtx.destination);

        // Osc 1: Low foundation
        this.droneOsc1 = this.audioCtx.createOscillator();
        this.droneOsc1.type = 'sine';
        this.droneOsc1.frequency.value = 55; // Low A

        // Osc 2: Detuned slightly for binaural beat effect
        this.droneOsc2 = this.audioCtx.createOscillator();
        this.droneOsc2.type = 'sine';
        this.droneOsc2.frequency.value = 57; // 2Hz beat frequency

        this.droneOsc1.connect(this.droneGain);
        this.droneOsc2.connect(this.droneGain);

        this.droneOsc1.start();
        this.droneOsc2.start();

        // Fade in
        this.droneGain.gain.linearRampToValueAtTime(0.05, this.audioCtx.currentTime + 2);
    }

    public stopFocusDrone() {
        if (!this.audioCtx || !this.droneGain) return;
        
        // Fade out
        try {
            this.droneGain.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + 1);
            setTimeout(() => {
                if (this.droneOsc1) { this.droneOsc1.stop(); this.droneOsc1 = null; }
                if (this.droneOsc2) { this.droneOsc2.stop(); this.droneOsc2 = null; }
                this.droneGain = null;
            }, 1000);
        } catch (e) {
            // Safety catch if audio context was suspended/closed
        }
    }
}

export const soundService = new SoundService();
