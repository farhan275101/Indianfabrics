'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { addToBag, formatINR, getSarees } from '@/lib/store';
import { SareeProduct } from '@/lib/types';

function showToast(msg: string) {
  let toast = document.getElementById('vv-global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'vv-global-toast';
    toast.className = 'vv-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast?.classList.remove('show'), 2600);
}

export default function RunwaySection() {
  const [looks, setLooks] = useState<SareeProduct[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [zoomed, setZoomed] = useState(false);
  const [hotPin, setHotPin] = useState<number | null>(null);
  const [pickingOpen, setPickingOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<string>('');
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [sweepKey, setSweepKey] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const actorsRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);

  // Physics state refs
  const phys = useRef({
    target: 0,
    cur: -1.15,
    vel: 0,
    dragging: false,
    still: false,
    W: 900,
    H: 520,
    unit: 270,
    fs: 1.08,
    isMobile: false,
    bodies: [] as Array<{ el: HTMLDivElement; a: number; x: number; g: number; vel: number; w: number; blur?: number }>,
    raf: 0,
    lastT: 0,
    panelHover: false,
    engaged: false,
    suppressClickUntil: 0,
  });

  // Load sarees from store & listen to Admin updates
  useEffect(() => {
    const load = () => {
      const all = getSarees();
      const runwayList = all
        .filter((s) => s.is_runway)
        .sort((a, b) => a.runway_order - b.runway_order)
        .slice(0, 6);
      const finalLooks = runwayList.length >= 2 ? runwayList : all.slice(0, 6);
      setLooks(finalLooks);
      if (finalLooks[0]) setSelectedPack(finalLooks[0].pack_options[0]);
    };
    load();
    window.addEventListener('vv-store-update', load);
    return () => window.removeEventListener('vv-store-update', load);
  }, []);

  // Build 12 3D ring bodies whenever looks change
  useEffect(() => {
    if (!looks.length || !actorsRef.current || !stageRef.current) return;
    const actors = actorsRef.current;
    actors.innerHTML = '';

    const N = looks.length;
    const totalBodies = Math.ceil(8 / N) * N; // 12 bodies for 6 looks
    const list: typeof phys.current.bodies = [];

    for (let a = 0; a < totalBodies; a++) {
      const look = looks[a % N];
      const el = document.createElement('div');
      el.className = 'rw__model';
      el.innerHTML = `
        <span class="rw__shadow"></span>
        <div class="rw__figure">
          <div class="rw__art">
            <img src="${look.model_image}" alt="${look.name}" draggable="false" />
            <button class="rw__hit" data-go="${a % N}" aria-label="${look.name}"></button>
          </div>
        </div>
      `;
      actors.appendChild(el);
      list.push({ el, a, x: phys.current.cur, g: phys.current.cur, vel: 0, w: 300 });
    }
    phys.current.bodies = list;

    const measure = () => {
      if (!stageRef.current || !rootRef.current) return;
      const rect = stageRef.current.getBoundingClientRect();
      const isMob = window.innerWidth < 900;
      phys.current.isMobile = isMob;
      phys.current.W = rect.width || window.innerWidth;
      phys.current.H = rect.height || 480;
      phys.current.fs = isMob ? 1 : 1.08;
      phys.current.unit = isMob ? Math.max(90, phys.current.W * 0.35) : Math.max(120, 0.3 * phys.current.W);

      const modelH = isMob
        ? Math.max(220, Math.round(phys.current.H - 42))
        : Math.max(240, Math.round((phys.current.H - 52) / 1.08));

      stageRef.current.style.setProperty('--rw-model-h', `${modelH}px`);
      stageRef.current.style.setProperty('--rw-hx', isMob ? '50%' : `${0.5 * phys.current.W}px`);
      stageRef.current.style.setProperty('--rw-hy', isMob ? '20px' : '30px');
      phys.current.bodies.forEach((b) => {
        b.w = b.el.offsetWidth || modelH * 0.5625;
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stageRef.current);
    kickLoop();

    return () => {
      ro.disconnect();
      cancelAnimationFrame(phys.current.raf);
      phys.current.raf = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [looks]);

  const putBody = (
    b: (typeof phys.current.bodies)[0],
    x: number,
    bottom: number,
    scale: number,
    opacity: number,
    blur: number,
    z: number
  ) => {
    const W = phys.current.W;
    if (x + (b.w * scale) / 2 < -10 || x - (b.w * scale) / 2 > W + 10) opacity = 0;
    b.el.style.transform = `translate3d(${x.toFixed(1)}px, ${(-bottom).toFixed(1)}px, 0) translateX(-50%) scale(${scale.toFixed(4)})`;
    b.el.style.opacity = opacity.toFixed(3);
    b.el.style.zIndex = String(z);
    b.el.style.visibility = opacity < 0.01 ? 'hidden' : 'visible';
    b.el.style.pointerEvents = opacity < 0.5 ? 'none' : 'auto';
    const br = Math.round(blur * 10) / 10;
    if (b.blur !== br) {
      b.blur = br;
      b.el.style.filter = br <= 0.05 ? '' : `blur(${br}px)`;
    }
  };

  const renderBodies = () => {
    const p = phys.current;
    const N = p.bodies.length;
    if (!N) return;

    if (!p.isMobile) {
      const cx = 0.5 * p.W;
      const R = 0.62 * p.W;
      const P = 1.65 * p.W;
      const floor = p.H - 30;
      const horizon = 0.36 * p.H;
      const step = (2 * Math.PI) / N;

      p.bodies.forEach((b) => {
        let phi = ((b.a - p.cur) * step) % (2 * Math.PI);
        if (phi > Math.PI) phi -= 2 * Math.PI;
        if (phi <= -Math.PI) phi += 2 * Math.PI;

        const z = R * (1 - Math.cos(phi));
        const persp = P / (P + z);
        const sl = Math.abs(phi) / step;
        const scale = persp * (1 + (p.fs - 1) * Math.max(0, Math.min(1, 1 - sl)));
        const x = cx + R * Math.sin(phi) * persp;
        const feet = horizon + (floor - horizon) * persp;
        const bottom = p.H - feet;
        const blur = sl <= 1 ? 1.8 * sl : Math.min(1.8 + (sl - 1) * 2, 6.5);
        let op = Math.max(0, Math.min(1, (Math.cos(phi) + 0.55) / 0.3));
        if (p.still && sl < 0.02) op = 0;

        putBody(b, x, bottom, scale, op, blur, Math.round(scale * 1000));
      });
    } else {
      const wrapN = (v: number) => ((v % N) + N) % N;
      p.bodies.forEach((b) => {
        const k = wrapN(b.a - p.cur);
        const slot = k > N / 2 ? k - N : k;
        if (slot < -1.2 || slot > 3.2) {
          putBody(b, -999, 0, 0.5, 0, 0, 0);
          return;
        }
        const x = p.W * (0.5 + slot * 0.42);
        const bottom = 20 + Math.abs(slot) * 18;
        const scale = Math.pow(0.78, Math.abs(slot));
        let op = Math.max(0, 1 - Math.abs(slot) * 0.28);
        if (p.still && Math.abs(slot) < 0.03) op = 0;
        const blur = Math.min(Math.abs(slot) * 1.4, 4);
        putBody(b, x, bottom, scale, op, blur, 1000 - Math.round(Math.abs(slot) * 50));
      });
    }
  };

  const kickLoop = () => {
    if (phys.current.raf) return;
    phys.current.lastT = 0;
    const K = 95;
    const C = 2 * Math.sqrt(K);

    const tick = (now: number) => {
      const p = phys.current;
      p.raf = 0;
      const dt = p.lastT ? Math.min(0.034, (now - p.lastT) / 1000) : 1 / 60;
      p.lastT = now;

      let moving = false;
      const h = dt / 3;
      for (let s = 0; s < 3; s++) {
        const acc = -K * (p.cur - p.target) - C * p.vel;
        p.vel += acc * h;
        p.cur += p.vel * h;
      }

      if (Math.abs(p.cur - p.target) <= 0.0005 && Math.abs(p.vel) <= 0.0005 && !p.dragging) {
        p.cur = p.target;
        p.vel = 0;
      } else {
        moving = true;
      }

      p.still = !moving && !p.dragging;
      rootRef.current?.classList.toggle('rw--still', p.still);
      renderBodies();

      if (moving || p.dragging) {
        p.raf = requestAnimationFrame(tick);
      }
    };
    phys.current.raf = requestAnimationFrame(tick);
  };

  const moveTo = (T: number) => {
    if (!looks.length) return;
    phys.current.target = T;
    phys.current.still = false;
    rootRef.current?.classList.remove('rw--still');
    const L = looks.length;
    const nextIdx = ((T % L) + L) % L;
    setActiveIndex(nextIdx);
    setZoomed(false);
    setHotPin(null);
    setPickingOpen(false);
    setSelectedPack(looks[nextIdx].pack_options[0]);
    setSweepKey((k) => k + 1);
    kickLoop();
  };

  const nextLook = () => moveTo(Math.round(phys.current.target) + 1);
  const prevLook = () => moveTo(Math.round(phys.current.target) - 1);
  const goToLook = (i: number) => {
    let d = (i - activeIndex) % looks.length;
    if (d < 0) d += looks.length;
    if (d > looks.length / 2) d -= looks.length;
    moveTo(Math.round(phys.current.target) + d);
  };

  // Autoplay 5s
  useEffect(() => {
    if (!playing || zoomed || !looks.length) return;
    const id = setInterval(() => {
      if (!phys.current.dragging && !phys.current.panelHover && !phys.current.engaged) {
        nextLook();
      }
    }, 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, zoomed, activeIndex, looks.length]);

  // Custom Cursor
  useEffect(() => {
    const stage = stageRef.current;
    const cursor = cursorRef.current;
    if (!stage || !cursor || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    rootRef.current?.classList.add('rw--cursor');

    let x = 0, y = 0, tx = 0, ty = 0, active = false, cRaf = 0;
    const lerp = () => {
      cRaf = 0;
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      cursor.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      if (Math.hypot(tx - x, ty - y) > 0.2) cRaf = requestAnimationFrame(lerp);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = stage.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      if (!active) { x = tx; y = ty; active = true; cursor.classList.add('is-on'); }
      const t = e.target as HTMLElement;
      cursor.classList.toggle('is-view', !!t.closest('[data-rw-zoom]') && !phys.current.dragging);
      cursor.classList.toggle('is-link', !!t.closest('[data-go]') && !phys.current.dragging);
      if (!cRaf) cRaf = requestAnimationFrame(lerp);
    };
    const onLeave = () => {
      active = false;
      cursor.classList.remove('is-on', 'is-view', 'is-link');
    };
    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(cRaf);
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  // Drag / Swipe Events
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let sx = 0, sy = 0, st = 0, pid: number | null = null, lock = false;

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      sx = e.clientX; sy = e.clientY; st = phys.current.target; pid = e.pointerId; lock = false;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== pid) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (!lock) {
        if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { pid = null; return; }
        if (Math.abs(dx) > 8 && Math.abs(dx) > 1.2 * Math.abs(dy)) {
          lock = true;
          phys.current.dragging = true;
          rootRef.current?.classList.add('is-dragging');
          stage.setPointerCapture(pid);
        } else return;
      }
      phys.current.target = st - dx / phys.current.unit;
      phys.current.still = false;
      rootRef.current?.classList.remove('rw--still');
      kickLoop();
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== pid) return;
      pid = null;
      if (!phys.current.dragging) return;
      phys.current.dragging = false;
      rootRef.current?.classList.remove('is-dragging');
      phys.current.suppressClickUntil = performance.now() + 60;
      const dx = e.clientX - sx;
      const from = Math.round(st);
      if (Math.abs(dx) > 35) moveTo(from + (dx > 0 ? -1 : 1));
      else moveTo(from);
    };

    stage.addEventListener('pointerdown', onDown);
    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerup', onUp);
    stage.addEventListener('pointercancel', onUp);
    return () => {
      stage.removeEventListener('pointerdown', onDown);
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerup', onUp);
      stage.removeEventListener('pointercancel', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [looks]);

  const current = looks[activeIndex];
  if (!current) return null;

  const setTotal = current.wholesale_price * current.moq;
  const isAdded = !!addedIds[current.id];

  const handleAddSet = () => {
    phys.current.engaged = true;
    setPlaying(false);
    addToBag(current, selectedPack || current.pack_options[0], 1);
    setAddedIds((prev) => ({ ...prev, [current.id]: true }));
    setPickingOpen(false);
    showToast(`${current.name} (${current.moq} Pcs Set) added to Wholesale Bag`);
  };

  return (
    <section id="runway">
      <div
        ref={rootRef}
        className={`rw rw--popup ${playing ? 'is-playing' : ''} ${zoomed ? 'rw--zoom' : ''}`}
        style={{ ['--rw-progress' as string]: ((activeIndex + 1) / looks.length).toFixed(3) }}
      >
        <div className="rw__sticky">
          <div className="rw__grid">
            {/* Left 3D Stage */}
            <div className="rw__left">
              <div className="rw__head">
                <div className="rw__intro">
                  <span className="rw__eyebrow">2026 Factory Runway Showcase</span>
                  <h1 className="rw__title">Try the Look.</h1>
                  <p className="rw__sub">
                    {looks.length} signature wholesale saree looks straight from our looms. Drag to rotate or tap the center model to inspect pins.
                  </p>
                </div>
              </div>

              <div
                ref={stageRef}
                className={`rw__stage ${sweepKey ? 'is-sweep' : ''}`}
                onClick={(e) => {
                  if (performance.now() < phys.current.suppressClickUntil) return;
                  const t = e.target as HTMLElement;
                  const goEl = t.closest('[data-go]') as HTMLElement | null;
                  if (goEl) {
                    const idx = Number(goEl.dataset.go);
                    if (idx === activeIndex) {
                      phys.current.engaged = true;
                      setPlaying(false);
                      setZoomed(true);
                    } else {
                      goToLook(idx);
                    }
                  }
                }}
              >
                <div ref={actorsRef} className="rw__actors" />

                <div className="rw__heroes">
                  {looks.map((look, i) => (
                    <div key={look.id} className={`rw__hero ${i === activeIndex ? 'is-on' : ''}`}>
                      <div className="rw__figure">
                        <div className="rw__art">
                          <img src={look.model_image} alt={look.name} draggable={false} />
                          <button
                            type="button"
                            className="rw__zoom"
                            data-rw-zoom
                            aria-label={`View look: ${look.name}`}
                            onClick={() => {
                              phys.current.engaged = true;
                              setPlaying(false);
                              setZoomed(true);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <span key={sweepKey} className="rw__sweep" />
                <span ref={cursorRef} className="rw__cursor">
                  <span className="rw__cursor-in">
                    <span className="rw__cursor-label rw__cursor-drag">Drag</span>
                    <span className="rw__cursor-label rw__cursor-view">View</span>
                  </span>
                </span>
                <span className="rw__walk">
                  <span className="rw__walk-line" />
                </span>
              </div>

              {/* Bottom Controls + 01-06 Ticks */}
              <div className="rw__controls">
                <button type="button" className="rw__icon" onClick={prevLook} aria-label="Previous look">
                  <svg width="26" height="14" viewBox="0 0 26 14" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <path d="M25 7H1M7 1L1 7l6 6" />
                  </svg>
                </button>

                <div className="rw__ticks">
                  {looks.map((look, i) => (
                    <button
                      key={look.id}
                      type="button"
                      className={`rw__tick ${i < activeIndex ? 'is-past' : ''} ${i === activeIndex && playing ? 'is-run' : ''}`}
                      aria-current={i === activeIndex ? 'true' : 'false'}
                      onClick={() => goToLook(i)}
                    >
                      <span className="rw__tick-bar" />
                      <span className="rw__tick-label">
                        0{i + 1}
                        <span className="rw__tick-name">&nbsp;&nbsp;{look.name}</span>
                      </span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className={`rw__icon rw__auto ${playing ? 'is-playing' : ''}`}
                  onClick={() => {
                    phys.current.engaged = false;
                    setPlaying((p) => !p);
                  }}
                  aria-label="Toggle autoplay"
                >
                  <svg className="rw__play" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 4.5v15l12.5-7.5z" />
                  </svg>
                  <svg className="rw__pause" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.5 4.5h3.5v15H6.5zM14 4.5h3.5v15H14z" />
                  </svg>
                </button>

                <button type="button" className="rw__icon" onClick={nextLook} aria-label="Next look">
                  <svg width="26" height="14" viewBox="0 0 26 14" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <path d="M1 7h24M19 1l6 6-6 6" />
                  </svg>
                </button>
              </div>

              {/* View Look Popup */}
              <div className="rw__lb" aria-hidden={!zoomed}>
                <div className="rw__lb-stage" onClick={(e) => { if (e.target === e.currentTarget) setZoomed(false); }}>
                  {zoomed && (
                    <div className="rw__lb-model">
                      <div className="rw__art">
                        <img src={current.model_image} alt={current.name} style={{ opacity: 1 }} />
                        <div className="rw__pins">
                          <button
                            type="button"
                            className={`rw__pin ${hotPin === 1 ? 'is-hot' : ''}`}
                            data-tip={`${current.name} (${formatINR(current.wholesale_price)}/pc)`}
                            style={{ left: `${current.pin[0]}%`, top: `${current.pin[1]}%` }}
                            onClick={() => setHotPin(1)}
                          >
                            <span className="rw__pin-dot">1</span>
                          </button>
                          <button
                            type="button"
                            className={`rw__pin ${hotPin === 2 ? 'is-hot' : ''}`}
                            data-tip="Matching Unstitched Blouse Included"
                            style={{ left: `${Math.min(72, current.pin[0] + 6)}%`, top: '24%' }}
                            onClick={() => setHotPin(2)}
                          >
                            <span className="rw__pin-dot">2</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="rw__lb-top">
                  <p style={{ margin: 0 }}>
                    <span className="rw__lb-kicker">Look 0{activeIndex + 1} • {current.sku}</span>
                    <span className="rw__lb-name">{current.name}</span>
                  </p>
                  <button type="button" className="rw__lb-close" onClick={() => setZoomed(false)} aria-label="Close">
                    ✕
                  </button>
                </div>
                <p className="rw__lb-hint">Tap numbered pin to inspect piece details</p>
              </div>
            </div>

            {/* Right Wholesale Panel */}
            <aside
              className="rw__panel"
              onPointerEnter={() => { phys.current.panelHover = true; }}
              onPointerLeave={() => { phys.current.panelHover = false; }}
            >
              <div className="rw__panel-inner">
                <div className="rw__panel-head">
                  <h2 className="rw__panel-title">In this look</h2>
                  <span className="rw__label">Factory B2B</span>
                </div>

                <div className={`rw__look-panel ${isAdded ? 'is-complete' : ''}`}>
                  <div className="rw__mhead">
                    <span className="rw__mhead-title">{current.name}</span>
                    <span className="rw__label">{current.sku}</span>
                  </div>

                  <ul className="rw__items">
                    <li className={`rw__item ${pickingOpen ? 'is-picking' : ''} ${isAdded ? 'is-added' : ''} ${hotPin === 1 ? 'is-hot' : ''}`}>
                      {current.badge && <span className="rw__tag">{current.badge}</span>}
                      <Link href={`/saree/${current.slug}`} className="rw__media">
                        <img src={current.model_image} alt={current.name} />
                        <span className="rw__num">1</span>
                      </Link>
                      <div className="rw__info">
                        <span className="rw__type">{current.sku} • {current.category}</span>
                        <Link href={`/saree/${current.slug}`} className="rw__name">
                          {current.name}
                        </Link>
                        <span className="rw__price">
                          <span>{formatINR(current.wholesale_price)} / pc</span>
                          <span className="rw__moq-tag">MOQ: {current.moq} pcs</span>
                        </span>
                      </div>
                      <button
                        type="button"
                        className="rw__add"
                        onClick={() => {
                          phys.current.engaged = true;
                          setPlaying(false);
                          setPickingOpen((o) => !o);
                        }}
                        aria-label="Choose wholesale set"
                      >
                        {isAdded ? '✓' : '＋'}
                      </button>

                      {pickingOpen && !isAdded && (
                        <div className="rw__picker">
                          <fieldset className="rw__opt">
                            <legend className="rw__opt-name">Select Wholesale Set Option</legend>
                            <div className="rw__vals">
                              {current.pack_options.map((opt) => (
                                <label key={opt} className="rw__pill">
                                  <input
                                    type="radio"
                                    name={`pack-${current.id}`}
                                    checked={selectedPack === opt}
                                    onChange={() => setSelectedPack(opt)}
                                  />
                                  <span className="rw__pill-label">{opt}</span>
                                </label>
                              ))}
                            </div>
                          </fieldset>
                          <button type="button" className="rw__confirm" onClick={handleAddSet}>
                            Confirm {current.moq}-Pc Set ({formatINR(setTotal)})
                          </button>
                        </div>
                      )}
                    </li>

                    {/* Row 2: Specs & Blouse Piece Summary */}
                    <li className={`rw__item ${hotPin === 2 ? 'is-hot' : ''}`}>
                      <div className="rw__media">
                        <img src={current.gallery_images[1] || current.model_image} alt="Fabric & Blouse" />
                        <span className="rw__num">2</span>
                      </div>
                      <div className="rw__info">
                        <span className="rw__type">Included With Saree</span>
                        <span className="rw__name" style={{ fontSize: '15px' }}>{current.set_description}</span>
                        <span className="rw__type" style={{ textTransform: 'none', letterSpacing: 0 }}>
                          {current.fabric}
                        </span>
                      </div>
                      <Link href={`/saree/${current.slug}`} style={{ fontSize: '12px', fontWeight: 700, color: '#df382b' }}>
                        Specs →
                      </Link>
                    </li>
                  </ul>

                  <div className="rw__bundle">
                    <div className="rw__bundle-row">
                      <div>
                        <span className="rw__bundle-title">1 Complete Wholesale Set ({current.moq} Pcs)</span>
                        <span className="rw__bundle-note">Ex-Factory Rate • GST &amp; Transport Extra</span>
                      </div>
                      <div className="rw__bundle-price">
                        <strong>{formatINR(setTotal)}</strong>
                      </div>
                    </div>

                    <button type="button" className="rw__cta" onClick={handleAddSet}>
                      {isAdded ? '✓ Added to Wholesale Bag' : `Add ${current.moq}-Pc Set to Wholesale Bag →`}
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
