// DAYFLOW - Lightweight Canvas Confetti Engine (100% Offline, Zero External Dependencies)
class ConfettiEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.animId = null;
    this.active = false;
  }

  _getCanvas() {
    if (typeof document === 'undefined' || !document.createElement) return null;
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'dayflow-confetti-canvas';
      this.canvas.style.position = 'fixed';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100vw';
      this.canvas.style.height = '100vh';
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.zIndex = '9999';
      if (document.body && document.body.appendChild) {
        document.body.appendChild(this.canvas);
      }
      if (this.canvas.getContext) {
        this.ctx = this.canvas.getContext('2d');
      }
      this._resize();
      if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('resize', () => this._resize());
      }
    }
    return this.canvas;
  }

  _resize() {
    if (!this.canvas) return;
    const dpr = window.devicePixelRatio || 1;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    if (this.ctx) {
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  fire(options = {}) {
    if (!this._getCanvas() || !this.ctx) return;
    const particleCount = options.particleCount || 120;
    const colors = options.colors || ['#6366f1', '#8b5cf6', '#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#ffffff'];
    const originX = options.originX !== undefined ? options.originX : this.width / 2;
    const originY = options.originY !== undefined ? options.originY : this.height * 0.45;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.8;
      const speed = 4 + Math.random() * 9;
      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (Math.random() * 4 + 2),
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        wobble: Math.random() * 10,
        wobbleSpeed: 0.1 + Math.random() * 0.1,
        life: 1.0,
        decay: 0.007 + Math.random() * 0.008,
        shape: Math.random() > 0.3 ? 'rect' : 'circle'
      });
    }

    if (!this.active) {
      this.active = true;
      this._loop();
    }
  }

  burstFromBottom() {
    if (!this._getCanvas() || !this.ctx) return;
    const colors = ['#6366f1', '#8b5cf6', '#d946ef', '#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#ffffff'];
    const count = 140;
    
    // Left cannon
    for (let i = 0; i < count / 2; i++) {
      const angle = -Math.PI / 3 + (Math.random() - 0.5) * 0.6;
      const speed = 10 + Math.random() * 10;
      this.particles.push({
        x: this.width * 0.15,
        y: this.height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 14,
        wobble: Math.random() * 10,
        wobbleSpeed: 0.1 + Math.random() * 0.1,
        life: 1.0,
        decay: 0.007 + Math.random() * 0.006,
        shape: Math.random() > 0.3 ? 'rect' : 'circle'
      });
    }

    // Right cannon
    for (let i = 0; i < count / 2; i++) {
      const angle = -2 * Math.PI / 3 + (Math.random() - 0.5) * 0.6;
      const speed = 10 + Math.random() * 10;
      this.particles.push({
        x: this.width * 0.85,
        y: this.height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 14,
        wobble: Math.random() * 10,
        wobbleSpeed: 0.1 + Math.random() * 0.1,
        life: 1.0,
        decay: 0.007 + Math.random() * 0.006,
        shape: Math.random() > 0.3 ? 'rect' : 'circle'
      });
    }

    if (!this.active) {
      this.active = true;
      this._loop();
    }
  }

  _loop() {
    if (!this.active) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.22; // gravity
      p.vx *= 0.99; // drag
      p.rotation += p.rotSpeed;
      p.wobble += p.wobbleSpeed;
      p.life -= p.decay;

      if (p.life <= 0 || p.y > this.height + 50) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.scale(Math.cos(p.wobble), 1);
      this.ctx.globalAlpha = Math.max(0, p.life);
      this.ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.6);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animId = requestAnimationFrame(() => this._loop());
    } else {
      this.active = false;
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }

  stop() {
    this.particles = [];
    this.active = false;
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.ctx) this.ctx.clearRect(0, 0, this.width, this.height);
  }
}

window.confettiEngine = new ConfettiEngine();
