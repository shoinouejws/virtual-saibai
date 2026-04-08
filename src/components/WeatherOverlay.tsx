import { useRef, useEffect, useCallback } from 'react';
import { WeatherEffectType } from '../types';

interface Props {
  effect: WeatherEffectType;
  onDismiss?: () => void;
}

// ===== Rain =====

interface RainDrop {
  x: number;
  y: number;
  speed: number;
  length: number;
  opacity: number;
  wind: number;
}

interface Splash {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
}

function createRainDrop(w: number, heavy: boolean): RainDrop {
  return {
    x: Math.random() * (w + 80) - 40,
    y: -(Math.random() * 100 + 10),
    speed: heavy ? 12 + Math.random() * 8 : 7 + Math.random() * 5,
    length: heavy ? 18 + Math.random() * 14 : 10 + Math.random() * 8,
    opacity: heavy ? 0.35 + Math.random() * 0.3 : 0.2 + Math.random() * 0.25,
    wind: heavy ? 2.5 + Math.random() * 1.5 : 1 + Math.random() * 1,
  };
}

function drawRain(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  drops: RainDrop[],
  splashes: Splash[],
  heavy: boolean,
) {
  ctx.clearRect(0, 0, w, h);

  // background tint
  ctx.fillStyle = heavy ? 'rgba(30, 40, 60, 0.25)' : 'rgba(50, 60, 80, 0.10)';
  ctx.fillRect(0, 0, w, h);

  // rain drops
  ctx.lineCap = 'round';
  for (const d of drops) {
    ctx.beginPath();
    ctx.moveTo(d.x, d.y);
    ctx.lineTo(d.x + d.wind * 2, d.y + d.length);
    ctx.strokeStyle = `rgba(170, 200, 240, ${d.opacity})`;
    ctx.lineWidth = heavy ? 1.8 : 1.2;
    ctx.stroke();
  }

  // splashes
  for (const s of splashes) {
    ctx.beginPath();
    ctx.ellipse(s.x, s.y, s.radius, s.radius * 0.3, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(180, 210, 250, ${s.opacity})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // mist at bottom for heavy rain
  if (heavy) {
    const grad = ctx.createLinearGradient(0, h - 40, 0, h);
    grad.addColorStop(0, 'rgba(180, 200, 230, 0)');
    grad.addColorStop(1, 'rgba(180, 200, 230, 0.15)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, h - 40, w, 40);
  }
}

function animateRain(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  heavy: boolean,
  frameRef: { current: number },
) {
  const dropCount = heavy ? 200 : 100;
  const drops: RainDrop[] = Array.from({ length: dropCount }, () => {
    const d = createRainDrop(w, heavy);
    d.y = Math.random() * h;
    return d;
  });
  const splashes: Splash[] = [];

  function tick() {
    for (let i = 0; i < drops.length; i++) {
      const d = drops[i];
      d.y += d.speed;
      d.x += d.wind;

      if (d.y > h) {
        if (Math.random() < (heavy ? 0.4 : 0.2)) {
          splashes.push({
            x: d.x,
            y: h - 2,
            radius: 1,
            maxRadius: 4 + Math.random() * 4,
            opacity: 0.4,
          });
        }
        drops[i] = createRainDrop(w, heavy);
      }
    }

    for (let i = splashes.length - 1; i >= 0; i--) {
      const s = splashes[i];
      s.radius += 0.6;
      s.opacity -= 0.04;
      if (s.opacity <= 0 || s.radius >= s.maxRadius) {
        splashes.splice(i, 1);
      }
    }

    drawRain(ctx, w, h, drops, splashes, heavy);
    frameRef.current = requestAnimationFrame(tick);
  }

  frameRef.current = requestAnimationFrame(tick);
}

// ===== Bird =====

interface Bird {
  x: number;
  y: number;
  baseY: number;
  speed: number;
  size: number;
  wingPhase: number;
  wingSpeed: number;
}

function createBird(w: number, h: number): Bird {
  const baseY = 30 + Math.random() * (h * 0.5);
  return {
    x: -(20 + Math.random() * 60),
    y: baseY,
    baseY,
    speed: 1.2 + Math.random() * 1.5,
    size: 8 + Math.random() * 8,
    wingPhase: Math.random() * Math.PI * 2,
    wingSpeed: 0.08 + Math.random() * 0.05,
  };
}

function drawBird(ctx: CanvasRenderingContext2D, b: Bird) {
  const wingAngle = Math.sin(b.wingPhase) * 0.5;
  const s = b.size;

  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.strokeStyle = 'rgba(60, 40, 20, 0.7)';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';

  // left wing
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-s * 0.5, -s * wingAngle, -s, -s * 0.3 * wingAngle);
  ctx.stroke();

  // right wing
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(s * 0.5, -s * wingAngle, s, -s * 0.3 * wingAngle);
  ctx.stroke();

  // body dot
  ctx.beginPath();
  ctx.arc(0, 0, 2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(60, 40, 20, 0.8)';
  ctx.fill();

  ctx.restore();
}

function animateBirds(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  frameRef: { current: number },
) {
  const birds: Bird[] = Array.from({ length: 8 }, () => {
    const b = createBird(w, h);
    b.x = Math.random() * w;
    return b;
  });

  function tick() {
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(180, 140, 80, 0.04)';
    ctx.fillRect(0, 0, w, h);

    for (const b of birds) {
      b.x += b.speed;
      b.wingPhase += b.wingSpeed;
      b.y = b.baseY + Math.sin(b.wingPhase * 0.4) * 6;

      drawBird(ctx, b);

      if (b.x > w + 40) {
        Object.assign(b, createBird(w, h));
      }
    }

    frameRef.current = requestAnimationFrame(tick);
  }

  frameRef.current = requestAnimationFrame(tick);
}

// ===== Heat (highTemp) =====

interface HeatWave {
  y: number;
  phase: number;
  speed: number;
  amplitude: number;
}

interface SunRay {
  angle: number;
  length: number;
  width: number;
  baseOpacity: number;
  pulsePhase: number;
  pulseSpeed: number;
}

function animateHeat(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  frameRef: { current: number },
) {
  const sunR = Math.min(w, h) * 0.18;
  const sunX = w - sunR * 0.4;
  const sunY = sunR * 0.4;

  const waves: HeatWave[] = Array.from({ length: 16 }, (_, i) => ({
    y: h * 0.3 + i * 14,
    phase: Math.random() * Math.PI * 2,
    speed: 0.018 + Math.random() * 0.012,
    amplitude: 2.5 + Math.random() * 2.5,
  }));

  const rayCount = 14;
  const rays: SunRay[] = Array.from({ length: rayCount }, (_, i) => ({
    angle: (i / rayCount) * Math.PI * 2,
    length: Math.max(w, h) * 1.2,
    width: 12 + Math.random() * 30,
    baseOpacity: 0.06 + Math.random() * 0.06,
    pulsePhase: Math.random() * Math.PI * 2,
    pulseSpeed: 0.008 + Math.random() * 0.008,
  }));

  let t = 0;

  function tick() {
    t++;
    ctx.clearRect(0, 0, w, h);

    // warm overlay that pulses
    const overlayAlpha = 0.12 + Math.sin(t * 0.012) * 0.04;
    ctx.fillStyle = `rgba(255, 120, 0, ${overlayAlpha})`;
    ctx.fillRect(0, 0, w, h);

    // radial heat gradient from sun position
    const heatGrad = ctx.createRadialGradient(sunX, sunY, sunR * 0.5, sunX, sunY, Math.max(w, h) * 0.9);
    heatGrad.addColorStop(0, 'rgba(255, 200, 50, 0.18)');
    heatGrad.addColorStop(0.3, 'rgba(255, 160, 30, 0.08)');
    heatGrad.addColorStop(1, 'rgba(255, 100, 0, 0)');
    ctx.fillStyle = heatGrad;
    ctx.fillRect(0, 0, w, h);

    // sun rays (rotating slowly)
    ctx.save();
    ctx.translate(sunX, sunY);
    const rotOffset = t * 0.002;
    for (const r of rays) {
      r.pulsePhase += r.pulseSpeed;
      const op = r.baseOpacity * (0.6 + Math.sin(r.pulsePhase) * 0.4);

      ctx.save();
      ctx.rotate(r.angle + rotOffset);

      const grad = ctx.createLinearGradient(0, 0, 0, r.length);
      grad.addColorStop(0, `rgba(255, 230, 80, ${op * 2})`);
      grad.addColorStop(0.15, `rgba(255, 200, 50, ${op})`);
      grad.addColorStop(0.5, `rgba(255, 160, 30, ${op * 0.4})`);
      grad.addColorStop(1, 'rgba(255, 140, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(-r.width / 2, 0, r.width, r.length);

      ctx.restore();
    }
    ctx.restore();

    // sun body - outer glow
    const glowPulse = 1 + Math.sin(t * 0.02) * 0.15;
    const outerGlow = ctx.createRadialGradient(sunX, sunY, sunR * 0.3, sunX, sunY, sunR * 2.2 * glowPulse);
    outerGlow.addColorStop(0, 'rgba(255, 240, 100, 0.5)');
    outerGlow.addColorStop(0.3, 'rgba(255, 200, 50, 0.25)');
    outerGlow.addColorStop(0.6, 'rgba(255, 160, 30, 0.08)');
    outerGlow.addColorStop(1, 'rgba(255, 100, 0, 0)');
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR * 2.2 * glowPulse, 0, Math.PI * 2);
    ctx.fill();

    // sun body - core
    const coreGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR);
    coreGrad.addColorStop(0, 'rgba(255, 255, 220, 0.95)');
    coreGrad.addColorStop(0.5, 'rgba(255, 230, 100, 0.9)');
    coreGrad.addColorStop(0.8, 'rgba(255, 190, 50, 0.7)');
    coreGrad.addColorStop(1, 'rgba(255, 160, 30, 0.3)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
    ctx.fill();

    // heat haze waves (lower half)
    for (const wave of waves) {
      wave.phase += wave.speed;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const yOff = Math.sin(x * 0.025 + wave.phase) * wave.amplitude
                   + Math.sin(x * 0.01 + wave.phase * 1.3) * wave.amplitude * 0.5;
        if (x === 0) ctx.moveTo(x, wave.y + yOff);
        else ctx.lineTo(x, wave.y + yOff);
      }
      ctx.strokeStyle = 'rgba(255, 180, 80, 0.07)';
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    // shimmer sparkles
    for (let i = 0; i < 6; i++) {
      const px = Math.random() * w;
      const py = Math.random() * h;
      const sz = 1 + Math.random() * 2.5;
      const sparkleOp = 0.2 + Math.random() * 0.35;
      ctx.beginPath();
      ctx.arc(px, py, sz, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 245, 200, ${sparkleOp})`;
      ctx.fill();
    }

    frameRef.current = requestAnimationFrame(tick);
  }

  frameRef.current = requestAnimationFrame(tick);
}

// ===== Pest =====

interface Bug {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  wingPhase: number;
  wingSpeed: number;
  targetX: number;
  targetY: number;
  changeTimer: number;
}

function createBug(w: number, h: number): Bug {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: 0,
    vy: 0,
    size: 2.5 + Math.random() * 2,
    wingPhase: Math.random() * Math.PI * 2,
    wingSpeed: 0.3 + Math.random() * 0.2,
    targetX: Math.random() * w,
    targetY: Math.random() * h,
    changeTimer: 30 + Math.random() * 60,
  };
}

function drawBug(ctx: CanvasRenderingContext2D, b: Bug) {
  const wingSpread = Math.sin(b.wingPhase) * 0.6;

  ctx.save();
  ctx.translate(b.x, b.y);

  const angle = Math.atan2(b.vy, b.vx);
  ctx.rotate(angle);

  // body
  ctx.beginPath();
  ctx.ellipse(0, 0, b.size, b.size * 0.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(40, 30, 10, 0.7)';
  ctx.fill();

  // wings
  ctx.fillStyle = 'rgba(120, 110, 90, 0.25)';
  // left wing
  ctx.beginPath();
  ctx.ellipse(-b.size * 0.2, -b.size * 0.4, b.size * 0.7, b.size * (0.3 + wingSpread * 0.3), -0.3, 0, Math.PI * 2);
  ctx.fill();
  // right wing
  ctx.beginPath();
  ctx.ellipse(-b.size * 0.2, b.size * 0.4, b.size * 0.7, b.size * (0.3 + wingSpread * 0.3), 0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function animatePests(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  frameRef: { current: number },
) {
  const bugs: Bug[] = Array.from({ length: 15 }, () => createBug(w, h));

  function tick() {
    ctx.clearRect(0, 0, w, h);

    // slight yellowish tint
    ctx.fillStyle = 'rgba(100, 80, 0, 0.03)';
    ctx.fillRect(0, 0, w, h);

    for (const b of bugs) {
      b.wingPhase += b.wingSpeed;
      b.changeTimer--;

      if (b.changeTimer <= 0) {
        b.targetX = Math.random() * w;
        b.targetY = Math.random() * h;
        b.changeTimer = 40 + Math.random() * 80;
      }

      const dx = b.targetX - b.x;
      const dy = b.targetY - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 1) {
        b.vx += (dx / dist) * 0.15;
        b.vy += (dy / dist) * 0.15;
      }

      // add some random jitter
      b.vx += (Math.random() - 0.5) * 0.4;
      b.vy += (Math.random() - 0.5) * 0.4;

      // damping
      b.vx *= 0.95;
      b.vy *= 0.95;

      b.x += b.vx;
      b.y += b.vy;

      // keep in bounds (with wrap)
      if (b.x < -10) b.x = w + 10;
      if (b.x > w + 10) b.x = -10;
      if (b.y < -10) b.y = h + 10;
      if (b.y > h + 10) b.y = -10;

      drawBug(ctx, b);
    }

    frameRef.current = requestAnimationFrame(tick);
  }

  frameRef.current = requestAnimationFrame(tick);
}

// ===== Component =====

export function WeatherOverlay({ effect, onDismiss }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const startAnimation = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !effect) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    cancelAnimationFrame(frameRef.current);

    const w = rect.width;
    const h = rect.height;

    if (effect === 'rain' || effect === 'longRain') {
      animateRain(ctx, w, h, effect === 'longRain', frameRef);
    } else if (effect === 'highTemp') {
      animateHeat(ctx, w, h, frameRef);
    } else if (effect === 'pest') {
      animatePests(ctx, w, h, frameRef);
    } else if (effect === 'birdDamage') {
      animateBirds(ctx, w, h, frameRef);
    }
  }, [effect]);

  useEffect(() => {
    startAnimation();

    const handleResize = () => {
      cancelAnimationFrame(frameRef.current);
      startAnimation();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [startAnimation]);

  if (!effect) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-10 pointer-events-none overflow-hidden"
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
      {/* {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 z-20 pointer-events-auto
            bg-white/70 backdrop-blur-sm rounded-full w-7 h-7
            flex items-center justify-center text-xs text-gray-500
            hover:bg-white/90 transition-colors shadow-sm"
          aria-label="エフェクトを消す"
        >
          ✕
        </button>
      )} */}
    </div>
  );
}
