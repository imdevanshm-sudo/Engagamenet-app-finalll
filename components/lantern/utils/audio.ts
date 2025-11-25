export class AudioController {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;

  init() {
    if (!this.ctx) {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      if (AudioContextClass) {
          this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // ✅ FIX: Added stopAll method
  stopAll() {
    if (this.ambientGain) {
      try {
        this.ambientGain.gain.exponentialRampToValueAtTime(0.001, (this.ctx?.currentTime || 0) + 0.5);
        setTimeout(() => {
            this.ambientGain?.disconnect();
            this.ambientGain = null;
        }, 500);
      } catch (e) {
        this.ambientGain?.disconnect();
        this.ambientGain = null;
      }
    }
    if (this.ctx && this.ctx.state === 'running') {
        this.ctx.suspend();
    }
  }

  playAmbientWind() {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    
    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; 
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 200;

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.value = 0.08; 

    noise.connect(filter);
    filter.connect(this.ambientGain);
    this.ambientGain.connect(this.ctx.destination);
    noise.start();
    
    const gustLoop = () => {
        if(!this.ctx || !filter || !this.ambientGain) return;
        if (this.ambientGain.gain.value < 0.001) return;

        const now = this.ctx.currentTime;
        const randomDelay = Math.random() * 5 + 5;
        
        filter.frequency.cancelScheduledValues(now);
        filter.frequency.setValueAtTime(filter.frequency.value, now);
        filter.frequency.linearRampToValueAtTime(Math.random() * 300 + 150, now + 2);
        filter.frequency.linearRampToValueAtTime(200, now + 4);

        this.ambientGain.gain.cancelScheduledValues(now);
        this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, now);
        this.ambientGain.gain.linearRampToValueAtTime(0.15, now + 2);
        this.ambientGain.gain.linearRampToValueAtTime(0.08, now + 4);

        setTimeout(gustLoop, randomDelay * 1000);
    };
    gustLoop();
  }

  playDoorOpen() {
     if (!this.ctx) return;
     const t = this.ctx.currentTime;
     const osc = this.ctx.createOscillator();
     const gain = this.ctx.createGain();
     osc.frequency.setValueAtTime(100, t);
     osc.frequency.exponentialRampToValueAtTime(0.01, t + 2);
     gain.gain.setValueAtTime(0.5, t);
     gain.gain.exponentialRampToValueAtTime(0.01, t + 2);
     osc.connect(gain);
     gain.connect(this.ctx.destination);
     osc.start();
     osc.stop(t + 2);
  }
  
  playLanternClick() {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const notes = [440, 493.88, 554.37, 659.25, 739.99]; 
      const note = notes[Math.floor(Math.random() * notes.length)];
      osc.frequency.setValueAtTime(note, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.1, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(t + 3.1);
  }
}