import { animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'framer-motion';
import { useGesture } from '@use-gesture/react';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { asset, type Cam, type World } from '../../data';

export const MIN_ZOOM = 0.6;
export const MAX_ZOOM = 2;

export interface MapHandle {
  flyTo: (cam: Partial<Cam>, opts?: { duration?: number; spring?: boolean }) => Promise<void>;
  zoomBy: (factor: number) => void;
  jumpTo: (cam: Cam) => void;
  cam: () => Cam;
}

interface Props {
  world: World;
  initial: Cam;
  children?: ReactNode; // world-space overlays (sprites, tags…)
  onBackgroundTap?: () => void;
  overlay?: (api: MapApi) => ReactNode;
}

export interface MapApi {
  cx: MotionValue<number>;
  cy: MotionValue<number>;
  s: MotionValue<number>;
  vw: MotionValue<number>;
  vh: MotionValue<number>;
  handle: MapHandle;
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * Pan/zoom camera over a layered isometric world.
 * Camera = world point shown at the viewport centre (cx, cy) + scale s.
 */
export const MapView = forwardRef<MapHandle, Props>(function MapView({ world, initial, children, onBackgroundTap, overlay }, ref) {
  const reduce = useReducedMotion();
  const vpRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const cx = useMotionValue(initial.x);
  const cy = useMotionValue(initial.y);
  const s = useMotionValue(initial.s);
  const vw = useMotionValue(0);
  const vh = useMotionValue(0);
  const anims = useRef<{ stop: () => void }[]>([]);
  const zoomTarget = useRef<number | null>(null);
  const moved = useRef(false);
  const [dragging, setDragging] = useState(false);

  const g = world.ground;
  const bound = useCallback(
    (x: number, y: number) => [clamp(x, g.x, g.x + g.w), clamp(y, g.y, g.y + g.h)] as const,
    [g.x, g.y, g.w, g.h],
  );

  useLayoutEffect(() => {
    const el = vpRef.current!;
    const update = () => {
      setSize({ w: el.clientWidth, h: el.clientHeight });
      vw.set(el.clientWidth);
      vh.set(el.clientHeight);
    };
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => ro.disconnect();
  }, []);

  const tx = useTransform([cx, s, vw], ([x, sc, w]: number[]) => w / 2 - x * sc);
  const ty = useTransform([cy, s, vh], ([y, sc, h]: number[]) => h / 2 - y * sc);

  const stopAll = () => {
    anims.current.forEach((a) => a.stop());
    anims.current = [];
    zoomTarget.current = null;
  };

  /** zoom to `ns` keeping the screen point (px,py) fixed */
  const zoomAt = useCallback(
    (ns: number, px: number, py: number) => {
      const sc = s.get();
      ns = clamp(ns, MIN_ZOOM, MAX_ZOOM);
      const wx = cx.get() + (px - size.w / 2) / sc;
      const wy = cy.get() + (py - size.h / 2) / sc;
      const [nx, ny] = bound(wx - (px - size.w / 2) / ns, wy - (py - size.h / 2) / ns);
      cx.set(nx);
      cy.set(ny);
      s.set(ns);
    },
    [bound, cx, cy, s, size.w, size.h],
  );

  const handle: MapHandle = {
    flyTo: (cam, opts = {}) => {
      stopAll();
      const [x, y] = bound(cam.x ?? cx.get(), cam.y ?? cy.get());
      const ns = clamp(cam.s ?? s.get(), MIN_ZOOM, 2.4);
      const t = reduce
        ? { duration: 0 }
        : opts.spring === false
          ? { duration: opts.duration ?? 0.4, ease: [0.22, 1, 0.36, 1] as const }
          : { type: 'spring' as const, stiffness: 170, damping: 26, mass: 1, restDelta: 0.01 };
      const a = [animate(cx, x, t), animate(cy, y, t), animate(s, ns, t)];
      anims.current = a;
      return Promise.all(a.map((x) => x.then(() => undefined))).then(() => undefined);
    },
    zoomBy: (f) => {
      // build on the pending target so quick repeated taps compound
      const from = anims.current.length && zoomTarget.current ? zoomTarget.current : s.get();
      stopAll();
      const target = clamp(from * f, MIN_ZOOM, MAX_ZOOM);
      zoomTarget.current = target;
      const t = reduce ? { duration: 0 } : { type: 'spring' as const, stiffness: 260, damping: 30 };
      const a = animate(s, target, t);
      anims.current = [a];
      a.then(() => {
        if (anims.current[0] === a) anims.current = [];
      });
    },
    jumpTo: (cam) => {
      stopAll();
      cx.set(cam.x);
      cy.set(cam.y);
      s.set(cam.s);
    },
    cam: () => ({ x: cx.get(), y: cy.get(), s: s.get() }),
  };
  useImperativeHandle(ref, () => handle);

  useGesture(
    {
      onDragStart: () => {
        stopAll();
        moved.current = false;
      },
      onDrag: ({ delta: [dx, dy], movement: [mx, my], pinching, cancel, first }) => {
        if (pinching) return cancel();
        if (first) return;
        if (Math.hypot(mx, my) > 10 && !moved.current) {
          moved.current = true;
          setDragging(true);
        }
        const sc = s.get();
        const [nx, ny] = bound(cx.get() - dx / sc, cy.get() - dy / sc);
        cx.set(nx);
        cy.set(ny);
      },
      onDragEnd: ({ velocity: [vx, vy], direction: [dx, dy] }) => {
        setDragging(false);
        if (reduce || !moved.current) return;
        const sc = s.get();
        // momentum: inertia on both axes, bounded to the ground
        const mk = (mv: MotionValue<number>, v: number, min: number, max: number) =>
          animate(mv, mv.get(), { type: 'inertia', velocity: -v * 1000 / sc, power: 0.35, timeConstant: 320, min, max, bounceStiffness: 300, bounceDamping: 40 });
        anims.current = [mk(cx, vx * dx, g.x, g.x + g.w), mk(cy, vy * dy, g.y, g.y + g.h)];
      },
      onPinchStart: () => stopAll(),
      onPinch: ({ offset: [scale], origin: [ox, oy] }) => {
        const r = vpRef.current!.getBoundingClientRect();
        moved.current = true;
        zoomAt(scale, ox - r.left, oy - r.top);
      },
      onWheel: ({ event, delta: [, dy] }) => {
        event.preventDefault();
        stopAll();
        const r = vpRef.current!.getBoundingClientRect();
        const e = event as WheelEvent;
        zoomAt(s.get() * Math.exp(-dy * 0.0018), e.clientX - r.left, e.clientY - r.top);
      },
    },
    {
      target: vpRef,
      eventOptions: { passive: false },
      drag: { filterTaps: true, threshold: 6 },
      pinch: { scaleBounds: { min: MIN_ZOOM, max: MAX_ZOOM }, from: () => [s.get(), 0], rubberband: false },
      wheel: { eventOptions: { passive: false } },
    },
  );

  // every new touch/press starts clean – a drag that ended without a click
  // (common on touch screens) must not swallow the next tap
  const onPointerDownCapture = () => {
    moved.current = false;
  };
  // block the click that follows a drag; detect taps on empty map
  const onClickCapture = (e: React.MouseEvent) => {
    if (moved.current) {
      e.stopPropagation();
      e.preventDefault();
      moved.current = false;
    }
  };
  const onClick = (e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest('[data-place]')) onBackgroundTap?.();
  };

  useEffect(() => () => stopAll(), []);

  return (
    <>
      <div ref={vpRef} className={`map-viewport${dragging ? ' dragging' : ''}`} onPointerDownCapture={onPointerDownCapture} onClickCapture={onClickCapture} onClick={onClick} data-testid="map-viewport">
        <motion.div className="map-world" style={{ x: tx, y: ty, scale: s, originX: 0, originY: 0, width: world.width, height: world.height }}>
          <img className="base" src={asset(world.base)} width={world.width} height={world.height} alt="" draggable={false} />
          {children}
        </motion.div>
      </div>
      {overlay?.({ cx, cy, s, vw, vh, handle })}
    </>
  );
});
