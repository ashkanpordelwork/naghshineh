import { motion, useTransform } from 'framer-motion';
import { useRef } from 'react';
import type { World } from '../../data';
import { icon } from '../ui/icons';
import type { MapApi as Api } from './MapView';

const MM_W = 68;
const MM_H = 40;

/** Minimap: ground diamond + live viewport rectangle; click/drag to move the camera. */
export function Minimap({ world, api, onLocateCenter }: { world: World; api: Api; onLocateCenter?: () => void }) {
  const g = world.ground;
  const kx = MM_W / g.w;
  const ky = MM_H / g.h;
  const rw = useTransform([api.s, api.vw], ([sc, w]: number[]) => (w / sc) * kx);
  const rh = useTransform([api.s, api.vh], ([sc, h]: number[]) => (h / sc) * ky);
  const rx = useTransform([api.cx, api.s, api.vw], ([x, sc, w]: number[]) => (x - g.x) * kx - ((w / sc) * kx) / 2);
  const ry = useTransform([api.cy, api.s, api.vh], ([y, sc, h]: number[]) => (y - g.y) * ky - ((h / sc) * ky) / 2);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const moveTo = (e: React.PointerEvent, smooth: boolean) => {
    const r = svgRef.current!.getBoundingClientRect();
    const x = g.x + ((e.clientX - r.left) / MM_W) * g.w;
    const y = g.y + ((e.clientY - r.top) / MM_H) * g.h;
    if (smooth) api.handle.flyTo({ x, y });
    else api.handle.jumpTo({ x: Math.min(g.x + g.w, Math.max(g.x, x)), y: Math.min(g.y + g.h, Math.max(g.y, y)), s: api.s.get() });
  };

  return (
    <div
      className="minimap"
      role="button"
      tabIndex={0}
      aria-label="نقشه‌ی کوچک؛ برای جابه‌جایی بزن"
      data-testid="minimap"
      onKeyDown={(e) => e.key === 'Enter' && onLocateCenter?.()}
      onPointerDown={(e) => {
        dragging.current = true;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        moveTo(e, true);
      }}
      onPointerMove={(e) => dragging.current && e.buttons && moveTo(e, false)}
      onPointerUp={() => (dragging.current = false)}
    >
      <svg ref={svgRef} width={MM_W} height={MM_H} viewBox={`0 0 ${MM_W} ${MM_H}`}>
        <polygon points={`${MM_W / 2},0 ${MM_W},${MM_H / 2} ${MM_W / 2},${MM_H} 0,${MM_H / 2}`} fill="#4a5058" stroke="#8aae68" strokeOpacity={0.6} />
        <motion.rect x={rx} y={ry} width={rw} height={rh} rx={4} fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.8)" data-testid="minimap-rect" />
      </svg>
    </div>
  );
}

export function ZoomControls({ api, onLocate, style }: { api: Api; onLocate: () => void; style?: React.CSSProperties }) {
  return (
    <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', gap: 8, ...style }}>
      <button className="map-ctrl" onClick={() => api.handle.zoomBy(1.25)} aria-label="بزرگ‌نمایی" data-testid="zoom-in">
        <img src={icon('add')} alt="" />
      </button>
      <button className="map-ctrl" onClick={() => api.handle.zoomBy(0.8)} aria-label="کوچک‌نمایی" data-testid="zoom-out">
        <img src={icon('remove')} alt="" />
      </button>
      <button className="map-ctrl" onClick={onLocate} aria-label="برگشت به مرکز" data-testid="locate">
        <img src={icon('locate')} alt="" />
      </button>
    </div>
  );
}

/** Top/bottom (and desktop side) fades over the map, as in Figma. */
export function MapFades({ top, bottom, desktop }: { top: number; bottom: number; desktop: boolean }) {
  return (
    <>
      <div className="fade" style={{ top: 0, height: top, background: 'linear-gradient(180deg, rgba(58,74,102,0.95), rgba(58,74,102,0))' }} />
      <div className="fade" style={{ bottom: 0, height: bottom, background: 'linear-gradient(180deg, rgba(27,35,51,0), rgba(27,35,51,0.95))' }} />
      {desktop && (
        <>
          <div className="edge-fade" style={{ left: 0, background: 'linear-gradient(90deg, rgba(31,40,56,0.95), rgba(31,40,56,0))' }} />
          <div className="edge-fade" style={{ right: 0, background: 'linear-gradient(90deg, rgba(31,40,56,0), rgba(31,40,56,0.95))' }} />
        </>
      )}
    </>
  );
}
