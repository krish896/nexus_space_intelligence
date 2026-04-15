import React, { useRef, useEffect } from 'react';

const SpaceCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Handles window resize
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);

    // Entity arrays
    let stars = [];
    let astronauts = [];
    let comets = [];
    let rockets = [];

    // --- Entity Classes ---

    class Star {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.z = Math.random() * 2 + 1;
        this.alpha = Math.random() * 0.8 + 0.2;
      }
      update() {
        this.y += 0.2 * this.z;
        if (this.y > height) this.reset();
      }
      draw(ctx) {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.z, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    class Astronaut {
      constructor() {
        this.size = 5; 
        this.x = Math.random() < 0.5 ? -30 : width + 30; // spawn at edges
        this.y = Math.random() * height;
        // Increased speed
        this.vx = (this.x < 0 ? 1 : -1) * (Math.random() * 0.5 + 0.4); 
        this.vy = (Math.random() - 0.5) * 0.4;
        this.angle = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.015; 
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.angle += this.rotSpeed;
      }
      draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.globalAlpha = 0.95; 
        
        // Draw limbs behind torso with dark borders to prevent "amoeba" blob effect
        ctx.lineCap = 'round';
        const drawLimb = (x1, y1, x2, y2) => {
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
          ctx.lineWidth = this.size * 0.8 + 2; ctx.strokeStyle = '#222'; ctx.stroke();
          ctx.lineWidth = this.size * 0.8; ctx.strokeStyle = '#fff'; ctx.stroke();
        };

        drawLimb(-this.size, -this.size*0.5, -this.size * 2.5, this.size); // left arm
        drawLimb(this.size, -this.size*0.5, this.size * 2.5, -this.size); // right arm
        drawLimb(-this.size*0.5, this.size, -this.size * 1.5, this.size * 3.5); // left leg
        drawLimb(this.size*0.5, this.size, this.size * 1.5, this.size * 3.5); // right leg

        // Backpack
        ctx.fillStyle = '#bbb';
        ctx.fillRect(-this.size * 1.8, -this.size, this.size * 3.6, this.size * 2.5);
        ctx.lineWidth = 1; ctx.strokeStyle = '#222';
        ctx.strokeRect(-this.size * 1.8, -this.size, this.size * 3.6, this.size * 2.5);

        // Suit body (torso)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-this.size * 1.2, -this.size * 1.2, this.size * 2.4, this.size * 3);
        ctx.strokeRect(-this.size * 1.2, -this.size * 1.2, this.size * 2.4, this.size * 3);

        // Helmet
        ctx.beginPath();
        ctx.arc(0, -this.size * 1.5, this.size * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Visor
        ctx.fillStyle = '#00f3ff';
        ctx.beginPath();
        ctx.arc(this.size * 0.4, -this.size * 1.5, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Safety tether cord trailing off into space!
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, this.size);
        ctx.bezierCurveTo(-this.size * 10, this.size * 5, -this.size * 5, this.size * 15, -this.size * 20, this.size * 10);
        ctx.stroke();

        ctx.restore();
      }
    }

    class Comet {
      constructor() {
        this.x = Math.random() * width;
        this.y = -50;
        this.radius = 4;
        this.vx = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 3 + 3);
        this.vy = Math.random() * 3 + 5;
        this.trail = [];
      }
      update() {
        this.trail.push({x: this.x, y: this.y});
        if (this.trail.length > 20) this.trail.shift();
        this.x += this.vx;
        this.y += this.vy;
      }
      draw(ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        for(let i = this.trail.length - 1; i >= 0; i--) {
          ctx.lineTo(this.trail[i].x, this.trail[i].y);
        }
        
        // Gradient trail
        if (this.trail.length > 0) {
          const old = this.trail[0];
          const grad = ctx.createLinearGradient(this.x, this.y, old.x, old.y);
          grad.addColorStop(0, 'rgba(0, 243, 255, 0.9)');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.strokeStyle = grad;
          ctx.lineWidth = 4;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
        
        // Bright head
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    class Rocket {
      constructor() {
        this.x = Math.random() * width;
        this.y = height + 50;
        this.radius = 15; 
        this.vy = -(Math.random() * 2.5 + 2.5);
      }
      update() {
        this.y += this.vy;
      }
      draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        // Alpha for deep space feel
        ctx.globalAlpha = 0.5;

        // Mach Diamond Thrust Plume
        ctx.fillStyle = `rgba(0, 243, 255, ${Math.random()*0.5 + 0.5})`;
        ctx.beginPath();
        ctx.moveTo(-1.5, 0);
        ctx.lineTo(1.5, 0);
        ctx.lineTo(0, 25 + Math.random()*15); // Long flickering tail
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-0.5, 0);
        ctx.lineTo(0.5, 0);
        ctx.lineTo(0, 10 + Math.random()*5); // Inner hot core
        ctx.fill();

        // Modern SpaceX Falcon 9 / Starship styling (Sleek tube, no fins)
        ctx.fillStyle = '#c7c7c7';
        ctx.fillRect(-1.5, -40, 3, 40);
        
        // Aerodynamic Nose
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-1.5, -40);
        ctx.lineTo(0, -48);
        ctx.lineTo(1.5, -40);
        ctx.fill();

        // Engine Bell Base
        ctx.fillStyle = '#333';
        ctx.fillRect(-2, 0, 4, 2);
        
        ctx.restore();
      }
    }

    // --- Instantiation ---
    for (let i = 0; i < 150; i++) stars.push(new Star());

    const spawnEntity = () => {
      // Astronaut: Spawn roughly once every ~8 seconds max
      if (Math.random() < 0.002 && astronauts.length < 1) astronauts.push(new Astronaut());
      if (Math.random() < 0.005 && comets.length < 2) comets.push(new Comet());
      if (Math.random() < 0.003 && rockets.length < 3) rockets.push(new Rocket());
    };

    // --- Main Loop ---
    let reqId;
    const loop = () => {
      ctx.fillStyle = 'rgba(0, 5, 10, 0.4)'; // trails fade effect
      ctx.fillRect(0, 0, width, height);

      spawnEntity();

      stars.forEach(s => { s.update(); s.draw(ctx); });

      // Update & Draw Astronauts
      astronauts.forEach((a, i) => {
        a.update();
        a.draw(ctx);
        if (a.y > height + 50 || a.x < -50 || a.x > width + 50) astronauts.splice(i, 1);
      });

      // Update & Draw Rockets
      rockets.forEach((r, i) => {
        r.update();
        r.draw(ctx);
        if (r.y < -50) rockets.splice(i, 1);
      });

      // Update, Draw Comets
      comets.forEach((c, cIndex) => {
        c.update();
        c.draw(ctx);

        if (c && (c.y > height + 50 || c.x < -50 || c.x > width + 50)) {
          comets.splice(cIndex, 1);
        }
      });

      reqId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none'
      }}
    />
  );
};

export default SpaceCanvas;
