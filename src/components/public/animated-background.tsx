'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  opacitySpeed: number;
  type: 'dot' | 'diamond' | 'star' | 'circle';
  color: string;
  rotation: number;
  rotationSpeed: number;
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight;
    };
    resize();

    const colors = [
      '16, 185, 129',   // emerald
      '20, 184, 166',   // teal
      '245, 158, 11',   // amber
      '14, 165, 233',   // sky
      '139, 92, 246',   // violet
    ];

    const types: Particle['type'][] = ['dot', 'diamond', 'star', 'circle'];

    // Initialize particles
    const particleCount = Math.min(60, Math.floor(window.innerWidth / 25));
    particlesRef.current = [];

    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push(createParticle(canvas.width, canvas.height, colors, types, true));
    }

    function createParticle(
      width: number,
      height: number,
      colors: string[],
      types: Particle['type'][],
      randomY = false
    ): Particle {
      return {
        x: Math.random() * width,
        y: randomY ? Math.random() * height : -20,
        size: Math.random() * 4 + 1.5,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: Math.random() * 0.3 + 0.1,
        opacity: Math.random() * 0.3 + 0.05,
        opacitySpeed: (Math.random() - 0.5) * 0.003,
        type: types[Math.floor(Math.random() * types.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.01,
      };
    }

    function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const method = i === 0 ? 'moveTo' : 'lineTo';
        ctx[method](Math.cos(angle) * size, Math.sin(angle) * size);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function drawDiamond(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size * 0.6, 0);
      ctx.moveTo(0, size);
      ctx.lineTo(-size * 0.6, 0);
      ctx.closePath();
      // Draw a proper diamond
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size * 0.6, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size * 0.6, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function drawIslamicStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.beginPath();
      // 8-pointed star
      for (let i = 0; i < 8; i++) {
        const outerAngle = (i * Math.PI) / 4 - Math.PI / 8;
        const innerAngle = outerAngle + Math.PI / 8;
        const outerR = size;
        const innerR = size * 0.45;
        if (i === 0) {
          ctx.moveTo(Math.cos(outerAngle) * outerR, Math.sin(outerAngle) * outerR);
        } else {
          ctx.lineTo(Math.cos(outerAngle) * outerR, Math.sin(outerAngle) * outerR);
        }
        ctx.lineTo(Math.cos(innerAngle) * innerR, Math.sin(innerAngle) * innerR);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function animate() {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Update position
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        // Update opacity with breathing effect
        p.opacity += p.opacitySpeed;
        if (p.opacity > 0.35) {
          p.opacity = 0.35;
          p.opacitySpeed *= -1;
        }
        if (p.opacity < 0.03) {
          p.opacity = 0.03;
          p.opacitySpeed *= -1;
        }

        // Wrap around
        if (p.y > canvas.height + 20) {
          particles[i] = createParticle(canvas.width, canvas.height, colors, types, false);
          particles[i].y = -20;
          continue;
        }
        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;

        // Draw
        ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;

        switch (p.type) {
          case 'dot':
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 'diamond':
            drawDiamond(ctx, p.x, p.y, p.size * 2, p.rotation);
            break;
          case 'star':
            drawStar(ctx, p.x, p.y, p.size * 1.5, p.rotation);
            break;
          case 'circle':
            drawIslamicStar(ctx, p.x, p.y, p.size * 2, p.rotation);
            break;
        }

        // Draw subtle glow for larger particles
        if (p.size > 3) {
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
          gradient.addColorStop(0, `rgba(${p.color}, ${p.opacity * 0.3})`);
          gradient.addColorStop(1, `rgba(${p.color}, 0)`);
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    }

    animate();

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(document.documentElement);

    return () => {
      cancelAnimationFrame(animationRef.current);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ opacity: 1 }}
    />
  );
}
