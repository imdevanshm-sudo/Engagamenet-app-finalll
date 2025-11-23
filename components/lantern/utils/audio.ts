
export class AudioController {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private isMuted: boolean = false;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playAmbientWind() {
    if (!this.ctx) return;
    
    // Create noise buffer for wind texture
    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      // Pink noise approximation
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
    this.ambientGain.gain.value = 0.08; // Subtle background

    noise.connect(filter);
    filter.connect(this.ambientGain);
    this.ambientGain.connect(this.ctx.destination);
    noise.start();
    
    // Animate wind gusts
    const gustLoop = () => {
        if(!this.ctx || !filter || !this.ambientGain) return;
        const now = this.ctx.currentTime;
        const randomDelay = Math.random() * 5 + 5;
        
        // Gust frequency
        filter.frequency.cancelScheduledValues(now);
        filter.frequency.setValueAtTime(filter.frequency.value, now);
        filter.frequency.linearRampToValueAtTime(Math.random() * 300 + 150, now + 2);
        filter.frequency.linearRampToValueAtTime(200, now + 4);

        // Gust volume
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
     
     // 1. Heavy Door Rumble (Deep & Smooth)
     // Replaces the mechanical rumble with a smoother deep movement
     const rumble = this.ctx.createOscillator();
     const rumbleGain = this.ctx.createGain();
     rumble.type = 'sine'; // Sine is smoother/heavier than saw/square
     rumble.frequency.setValueAtTime(45, t);
     rumble.frequency.exponentialRampToValueAtTime(25, t + 2.5); // Slow settling pitch
     
     rumbleGain.gain.setValueAtTime(0, t);
     rumbleGain.gain.linearRampToValueAtTime(0.4, t + 0.2);
     rumbleGain.gain.exponentialRampToValueAtTime(0.001, t + 2.8);
     
     rumble.connect(rumbleGain);
     rumbleGain.connect(this.ctx.destination);
     rumble.start();
     rumble.stop(t + 3);

     // 2. Magical Breath/Texture (Replaces creak with ethereal wind/chime texture)
     const textureGain = this.ctx.createGain();
     textureGain.gain.setValueAtTime(0, t);
     textureGain.gain.linearRampToValueAtTime(0.12, t + 0.8);
     textureGain.gain.linearRampToValueAtTime(0, t + 2.5);
     textureGain.connect(this.ctx.destination);

     // Create two detuned oscillators for a "magical breath" sound
     const osc1 = this.ctx.createOscillator();
     osc1.type = 'triangle';
     osc1.frequency.setValueAtTime(120, t);
     osc1.frequency.linearRampToValueAtTime(130, t + 2); // Slight drift
     
     const osc2 = this.ctx.createOscillator();
     osc2.type = 'triangle';
     osc2.frequency.setValueAtTime(122, t); // Detuned
     osc2.frequency.linearRampToValueAtTime(132, t + 2);

     osc1.connect(textureGain);
     osc2.connect(textureGain);
     osc1.start();
     osc2.start();
     osc1.stop(t + 3);
     osc2.stop(t + 3);
     
     // 3. Soft Whoosh (Air displacement)
     const bufferSize = this.ctx.sampleRate * 1.5;
     const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
     const data = buffer.getChannelData(0);
     for (let i = 0; i < bufferSize; i++) {
         data[i] = Math.random() * 2 - 1;
     }
     
     const noise = this.ctx.createBufferSource();
     noise.buffer = buffer;
     
     const filter = this.ctx.createBiquadFilter();
     filter.type = 'lowpass';
     filter.frequency.setValueAtTime(150, t);
     filter.frequency.linearRampToValueAtTime(600, t + 1); // Opening up
     
     const noiseGain = this.ctx.createGain();
     noiseGain.gain.setValueAtTime(0, t);
     noiseGain.gain.linearRampToValueAtTime(0.1, t + 0.3);
     noiseGain.gain.linearRampToValueAtTime(0, t + 1.5);
     
     noise.connect(filter);
     filter.connect(noiseGain);
     noiseGain.connect(this.ctx.destination);
     noise.start();
  }
  
  playLanternClick() {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      
      // Ethereal chime
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      // Pentatonic scale random note
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
