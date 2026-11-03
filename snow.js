/**
 * =========================================================================
 * WINTERTRAY - INTERAKTÍV HÓHULLÁS MOTOR (SNOW.JS)
 * =========================================================================
 * - 60 FPS hardveresen gyorsított Canvas szimuláció
 * - 3 mélységi réteg (Parallax mélységérzet kristályos hópelyhekkel)
 * - Valósághű szél-, turbulencia- és lengésfizika
 * - Egérreakció: pelyhek finom kitérése és egérsöprés
 * - Interaktív vezérlés (sűrűség, szélsebesség, hóvihar-robbanás)
 * - Automatikus akkumulátorkímélő szüneteltetés (Page Visibility API)
 */

(function () {
  'use strict';

  class SnowEngine {
    constructor(canvasId = 'snow-canvas') {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) {
        console.warn(`SnowEngine: Canvas #${canvasId} nem található.`);
        return;
      }

      this.ctx = this.canvas.getContext('2d', { alpha: true });
      this.particles = [];
      this.baseCount = 140; // Default flake count on 1080p
      this.densityMultiplier = 1.0;
      this.windTarget = 0.5;
      this.windCurrent = 0.5;
      this.windOscillation = 0;
      this.isPaused = false;
      this.lastTime = performance.now();

      // Mouse tracking
      this.mouse = {
        x: -1000,
        y: -1000,
        lastX: -1000,
        lastY: -1000,
        vx: 0,
        vy: 0,
        radius: 110,
        isHovered: false
      };

      // Accumulation profile along the bottom
      this.bottomAccumulation = [];
      this.accumulationSegments = 60;

      this.init();
    }

    init() {
      this.handleResize();
      this.setupEventListeners();
      this.createParticles();
      this.initAccumulation();
      this.animate();
    }

    handleResize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = Math.floor(this.width * dpr);
      this.canvas.height = Math.floor(this.height * dpr);
      this.ctx.scale(dpr, dpr);

      // Adjust particle count dynamically based on screen resolution
      const screenArea = (this.width * this.height) / (1920 * 1080);
      this.targetCount = Math.max(70, Math.floor(this.baseCount * screenArea * this.densityMultiplier));
      
      this.adjustParticleCount();
      this.initAccumulation();
    }

    initAccumulation() {
      this.bottomAccumulation = [];
      for (let i = 0; i <= this.accumulationSegments; i++) {
        // Subtle natural wavy snow drift along the bottom
        const wave = Math.sin((i / this.accumulationSegments) * Math.PI * 4) * 3 +
                     Math.cos((i / this.accumulationSegments) * Math.PI * 8) * 1.5;
        this.bottomAccumulation.push(8 + wave);
      }
    }

    setupEventListeners() {
      window.addEventListener('resize', () => {
        clearTimeout(this._resizeTimer);
        this._resizeTimer = setTimeout(() => this.handleResize(), 150);
      }, { passive: true });

      // Page visibility optimization: 0 CPU when inactive
      document.addEventListener('visibilitychange', () => {
        this.isPaused = document.hidden;
        if (!document.hidden) {
          this.lastTime = performance.now();
          requestAnimationFrame((t) => this.loop(t));
        }
      });

      // Mouse motion & interaction
      window.addEventListener('mousemove', (e) => {
        this.mouse.vx = (e.clientX - this.mouse.x) * 0.4;
        this.mouse.vy = (e.clientY - this.mouse.y) * 0.4;
        this.mouse.lastX = this.mouse.x;
        this.mouse.lastY = this.mouse.y;
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        this.mouse.isHovered = true;
      }, { passive: true });

      window.addEventListener('mouseleave', () => {
        this.mouse.x = -1000;
        this.mouse.y = -1000;
        this.mouse.vx = 0;
        this.mouse.vy = 0;
        this.mouse.isHovered = false;
      });

      // Touch interaction for mobile devices
      window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
          const t = e.touches[0];
          this.mouse.vx = (t.clientX - this.mouse.x) * 0.3;
          this.mouse.vy = (t.clientY - this.mouse.y) * 0.3;
          this.mouse.x = t.clientX;
          this.mouse.y = t.clientY;
          this.mouse.isHovered = true;
        }
      }, { passive: true });

      window.addEventListener('touchend', () => {
        this.mouse.x = -1000;
        this.mouse.y = -1000;
        this.mouse.isHovered = false;
      });
    }

    createParticles() {
      this.particles = [];
      for (let i = 0; i < this.targetCount; i++) {
        this.particles.push(this.createParticle(true));
      }
    }

    adjustParticleCount() {
      const diff = this.targetCount - this.particles.length;
      if (diff > 0) {
        for (let i = 0; i < diff; i++) {
          this.particles.push(this.createParticle(false));
        }
      } else if (diff < 0) {
        this.particles.splice(0, Math.abs(diff));
      }
    }

    createParticle(randomY = false) {
      // 3 depth layers: 0 = far (small/slow), 1 = mid, 2 = near (large/fast/crystal)
      const layerRand = Math.random();
      let layer = 1;
      let radius = 2.4;
      let speedY = 1.2;
      let opacity = 0.65;
      let isCrystal = false;

      if (layerRand < 0.45) {
        // Far away: tiny, soft, slower
        layer = 0;
        radius = 0.9 + Math.random() * 1.3;
        speedY = 0.5 + Math.random() * 0.7;
        opacity = 0.2 + Math.random() * 0.35;
      } else if (layerRand < 0.85) {
        // Mid layer
        layer = 1;
        radius = 2.0 + Math.random() * 1.6;
        speedY = 1.0 + Math.random() * 1.1;
        opacity = 0.55 + Math.random() * 0.3;
        isCrystal = Math.random() > 0.65;
      } else {
        // Close foreground: crisp, faster, gentle crystalline glow
        layer = 2;
        radius = 3.6 + Math.random() * 2.2;
        speedY = 1.8 + Math.random() * 1.5;
        opacity = 0.75 + Math.random() * 0.25;
        isCrystal = true;
      }

      return {
        x: Math.random() * this.width,
        y: randomY ? Math.random() * this.height : -15,
        radius: radius,
        baseRadius: radius,
        speedY: speedY,
        baseSpeedY: speedY,
        speedX: 0,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.015 + Math.random() * 0.025,
        swayAmplitude: 0.6 + Math.random() * 1.2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03,
        opacity: opacity,
        baseOpacity: opacity,
        layer: layer,
        isCrystal: isCrystal,
        dispX: 0, // displacement caused by mouse
        dispY: 0
      };
    }

    animate() {
      const loop = (currentTime) => {
        if (!this.isPaused) {
          const delta = Math.min((currentTime - this.lastTime) / 1000, 0.1);
          this.lastTime = currentTime;
          this.update(delta);
          this.draw();
        }
        requestAnimationFrame(loop);
      };
      this.lastTime = performance.now();
      requestAnimationFrame(loop);
    }

    update(dt) {
      // Smooth wind oscillation
      this.windOscillation += dt * 0.4;
      const naturalWind = Math.sin(this.windOscillation) * 0.6 + Math.sin(this.windOscillation * 2.3) * 0.25;
      this.windCurrent += (this.windTarget + naturalWind - this.windCurrent) * (dt * 1.5);

      // Mouse velocity damping
      this.mouse.vx *= 0.9;
      this.mouse.vy *= 0.9;

      const mouseRadiusSq = this.mouse.radius * this.mouse.radius;

      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];

        // Sway oscillation
        p.swayPhase += p.swaySpeed;
        const sway = Math.sin(p.swayPhase) * p.swayAmplitude;

        // Base velocity with wind and layer parallax
        const layerMultiplier = p.layer === 0 ? 0.4 : p.layer === 1 ? 0.8 : 1.3;
        const totalVx = (this.windCurrent * 1.2 * layerMultiplier) + sway;
        const totalVy = p.speedY * layerMultiplier;

        // Mouse repulsion & wake physics
        if (this.mouse.isHovered) {
          const dx = p.x - this.mouse.x;
          const dy = p.y - this.mouse.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < mouseRadiusSq && distSq > 0) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / this.mouse.radius);
            const angle = Math.atan2(dy, dx);

            // Push outward
            const pushMagnitude = force * 6.5;
            p.dispX += Math.cos(angle) * pushMagnitude + this.mouse.vx * 0.15;
            p.dispY += Math.sin(angle) * pushMagnitude + this.mouse.vy * 0.15;

            // Extra spin on interaction
            p.rotationSpeed += (Math.random() - 0.5) * 0.08 * force;
          }
        }

        // Apply mouse displacement with gentle spring back
        p.dispX *= 0.88;
        p.dispY *= 0.88;

        // Update positions
        p.x += totalVx + p.dispX;
        p.y += totalVy + p.dispY;
        p.rotation += p.rotationSpeed;

        // Wrap around horizontal edges
        if (p.x < -30) {
          p.x = this.width + 25;
        } else if (p.x > this.width + 30) {
          p.x = -25;
        }

        // Reset if snowflake reaches beyond bottom of screen
        if (p.y > this.height + 15) {
          p.y = -15;
          p.x = Math.random() * this.width;
          p.dispX = 0;
          p.dispY = 0;
        }
      }
    }

    draw() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      // Draw particles by layer for clean depth
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation);

        if (p.isCrystal && p.radius >= 3.0) {
          this.drawCrystalFlake(p);
        } else {
          this.drawSoftFlake(p);
        }

        this.ctx.restore();
      }

      // Draw bottom snow accumulation drift
      this.drawBottomDrift();
    }

    drawSoftFlake(p) {
      this.ctx.beginPath();
      this.ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(224, 242, 254, ${p.opacity})`;
      this.ctx.fill();

      // Soft glow for larger flakes
      if (p.layer >= 1 && p.radius > 2.2) {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.radius * 1.5, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(186, 230, 253, ${p.opacity * 0.25})`;
        this.ctx.fill();
      }
    }

    drawCrystalFlake(p) {
      const r = p.radius;
      this.ctx.strokeStyle = `rgba(240, 249, 255, ${p.opacity * 0.95})`;
      this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
      this.ctx.lineWidth = 1.2;
      this.ctx.lineCap = 'round';

      // 6-pointed star snowflake geometry
      for (let k = 0; k < 6; k++) {
        const angle = (k * Math.PI) / 3;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        // Main branch
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(cos * r, sin * r);
        this.ctx.stroke();

        // Small side crystalline branches
        const subDist = r * 0.6;
        const subLength = r * 0.35;
        const subAngle1 = angle + Math.PI / 4;
        const subAngle2 = angle - Math.PI / 4;

        this.ctx.beginPath();
        this.ctx.moveTo(cos * subDist, sin * subDist);
        this.ctx.lineTo(
          cos * subDist + Math.cos(subAngle1) * subLength,
          sin * subDist + Math.sin(subAngle1) * subLength
        );
        this.ctx.moveTo(cos * subDist, sin * subDist);
        this.ctx.lineTo(
          cos * subDist + Math.cos(subAngle2) * subLength,
          sin * subDist + Math.sin(subAngle2) * subLength
        );
        this.ctx.stroke();
      }

      // Center bright crystal core
      this.ctx.beginPath();
      this.ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
      this.ctx.fill();
    }

    drawBottomDrift() {
      const segWidth = this.width / this.accumulationSegments;
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.moveTo(0, this.height);

      for (let i = 0; i <= this.accumulationSegments; i++) {
        const x = i * segWidth;
        const h = this.bottomAccumulation[i] || 10;
        const y = this.height - h;
        if (i === 0) {
          this.ctx.lineTo(x, y);
        } else {
          const prevX = (i - 1) * segWidth;
          const prevY = this.height - (this.bottomAccumulation[i - 1] || 10);
          const cpX = (prevX + x) / 2;
          this.ctx.quadraticCurveTo(prevX, prevY, cpX, (prevY + y) / 2);
        }
      }

      this.ctx.lineTo(this.width, this.height);
      this.ctx.closePath();

      // Frosted winter gradient for bottom drift
      const grad = this.ctx.createLinearGradient(0, this.height - 18, 0, this.height);
      grad.addColorStop(0, 'rgba(186, 230, 253, 0.28)');
      grad.addColorStop(0.5, 'rgba(147, 197, 253, 0.42)');
      grad.addColorStop(1, 'rgba(125, 211, 252, 0.65)');
      this.ctx.fillStyle = grad;
      this.ctx.fill();

      // Thin bright crest on top of the snowdrift
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      this.ctx.lineWidth = 1.2;
      this.ctx.stroke();

      this.ctx.restore();
    }

    /* =========================================================================
     * PUBLIC API METÓDUSOK AZ INTERAKTÍV KEZELŐSZERVEKHEZ
     * ========================================================================= */

    setDensity(multiplier) {
      this.densityMultiplier = Math.max(0.2, Math.min(3.0, multiplier));
      const screenArea = (this.width * this.height) / (1920 * 1080);
      this.targetCount = Math.max(40, Math.floor(this.baseCount * screenArea * this.densityMultiplier));
      this.adjustParticleCount();
    }

    setWind(value) {
      // Value from -3.0 (strong left) to +3.0 (strong right)
      this.windTarget = Math.max(-4.0, Math.min(4.0, value));
    }

    triggerFlurry(originX, originY) {
      // Spawn a sudden flurry of 40 active snowflakes exploding from a click/tap
      const x = originX !== undefined ? originX : this.width / 2;
      const y = originY !== undefined ? originY : this.height / 3;

      for (let i = 0; i < 40; i++) {
        const p = this.createParticle(false);
        p.x = x + (Math.random() - 0.5) * 40;
        p.y = y + (Math.random() - 0.5) * 40;
        const angle = Math.random() * Math.PI * 2;
        const speed = 3.0 + Math.random() * 6.0;
        p.dispX = Math.cos(angle) * speed;
        p.dispY = Math.sin(angle) * speed - 1.5;
        p.layer = 2;
        p.radius = 2.5 + Math.random() * 2.5;
        this.particles.push(p);
      }

      // Slowly trim back to target count over 4 seconds
      setTimeout(() => {
        this.adjustParticleCount();
      }, 4000);
    }

    togglePause() {
      this.isPaused = !this.isPaused;
      if (!this.isPaused) {
        this.lastTime = performance.now();
      }
      return this.isPaused;
    }
  }

  // Export globally
  window.SnowEngine = SnowEngine;
})();
