import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

/** true for the first ~1.2s after mount: used to stagger the entrance only once */
function useEntering() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const id = window.setTimeout(() => setOn(false), 1200);
    return () => window.clearTimeout(id);
  }, []);
  return on;
}
import { asset, stageInfo, type Place, type World } from '../../data';

interface Props {
  world: World;
  selected?: string | null;
  pressed?: string | null;
  onSelect: (p: Place) => void;
}

/** Building sprites (one PNG per place) + dashed selection outline. Painter order = data order. */
export function Sprites({ world, selected, pressed, onSelect }: Props) {
  const reduce = useReducedMotion();
  const entering = useEntering();
  const sel = world.places.find((p) => p.id === selected);
  return (
    <>
      <AnimatePresence>{sel && <SelectionOutline key={sel.id} place={sel} />}</AnimatePresence>
      {[...world.places]
        .sort((a, b) => a.lot.y - b.lot.y || a.lot.x - b.lot.x)
        .map((p, i) => (
          <motion.div
            key={p.id}
            className="sprite"
            data-place={p.id}
            style={{ left: p.box.x, top: p.box.y, width: p.box.w, height: p.box.h }}
            initial={reduce ? false : { opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0, scale: reduce ? 1 : pressed === p.id ? 1.06 : selected === p.id ? 1.03 : 1 }}
            whileHover={reduce ? undefined : { scale: selected === p.id ? 1.04 : 1.025 }}
            whileTap={reduce ? undefined : { scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 26, delay: entering ? 0.1 + i * 0.05 : 0 }}
          >
            <img src={asset(p.sprite)} alt="" draggable={false} />
            <button className="sprite-hit" aria-label={p.name} data-testid={`sprite-${p.id}`} onClick={() => onSelect(p)} />
          </motion.div>
        ))}
    </>
  );
}

/** HTML name tags, positioned exactly like the Figma "Name Tags" frame. */
export function Tags({ world, selected, pressed, onSelect }: Props) {
  const reduce = useReducedMotion();
  const entering = useEntering();
  const k = world.tagScale;
  return (
    <>
      {world.places.map((p, i) => {
        const isSel = selected === p.id;
        const dim = selected && !isSel;
        const progress = p.progress !== undefined;
        const st = p.stage ? stageInfo(p.stage) : null;
        return (
          <motion.div
            key={p.id}
            className="tag-wrap"
            data-place={p.id}
            style={{ left: p.tag.x, top: p.tag.y, width: p.tag.w, height: p.pointer.y + p.pointer.h - p.tag.y, zIndex: isSel ? 3 : 2 }}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6, y: 8 }}
            animate={{ opacity: dim ? 0.45 : 1, y: 0, scale: reduce ? 1 : pressed === p.id ? 1.12 : isSel ? 1.06 : 1 }}
            whileHover={reduce ? undefined : { scale: isSel ? 1.08 : 1.05 }}
            whileTap={reduce ? undefined : { scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 420, damping: 24, delay: entering ? 0.35 + i * 0.06 : 0, opacity: { duration: 0.25, delay: entering ? 0.35 + i * 0.06 : 0 } }}
          >
            <button
              className={`tag${progress ? ' with-progress' : ''}${isSel ? ' selected' : ''}`}
              data-testid={`tag-${p.id}`}
              aria-pressed={isSel}
              aria-label={p.name}
              onClick={() => onSelect(p)}
              style={{
                left: 0, top: 0, width: p.tag.w, height: p.tag.h,
                ...(k !== 1 && { padding: `${5 * k}px ${7.35}px ${5 * k}px ${10.5}px`, fontSize: 12.6, gap: 6.3, borderWidth: 1.05 }),
              }}
            >
              {progress && (
                <span className="bar">
                  <motion.i
                    style={{ background: `linear-gradient(90deg, ${st!.color}bf, ${st!.color})`, width: `${(p.progress ?? 0) * 100}%`, originX: 1 }}
                    initial={reduce ? false : { scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="tag-fill"
                  />
                </span>
              )}
              <span className="row">
                <span className="dot" style={{ background: p.dot, width: 10 * k, height: 10 * k }} />
                <span>{p.name}</span>
                {p.caption && <span className="caption">{p.caption}</span>}
              </span>
            </button>
            <svg className="tag-pointer" style={{ left: p.pointer.x - p.tag.x, top: p.pointer.y - p.tag.y }} width={p.pointer.w} height={p.pointer.h} viewBox="0 0 10 6">
              <path d="M0 0H10L5 6Z" fill="rgba(27,34,48,0.92)" />
            </svg>
          </motion.div>
        );
      })}
      {world.labels?.map((l) => (
        <span key={l.text} className="map-label" style={{ left: l.rect.x, top: l.rect.y, height: l.rect.h }}>
          {l.text}
        </span>
      ))}
    </>
  );
}

function SelectionOutline({ place }: { place: Place }) {
  const reduce = useReducedMotion();
  const pad = 7;
  const { x, y, w, h } = place.lot;
  const W = w + pad * 2;
  const H = h + pad * 2 * (h / w);
  const pts = `${W / 2},1 ${W - 1},${H / 2} ${W / 2},${H - 1} 1,${H / 2}`;
  return (
    <motion.svg
      className="sel-outline"
      style={{ left: x - pad, top: y - pad * (h / w), zIndex: 0 }}
      width={W}
      height={H}
      initial={{ opacity: 0, scale: reduce ? 1 : 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      data-testid="selection-outline"
    >
      <polygon points={pts} fill="rgba(61,220,255,0.10)" stroke="#3ddcff" strokeWidth={2} strokeDasharray="7 6" strokeLinejoin="round">
        {!reduce && <animate attributeName="stroke-dashoffset" from="0" to="-26" dur="1.2s" repeatCount="indefinite" />}
      </polygon>
    </motion.svg>
  );
}
