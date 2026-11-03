import { AnimatePresence, motion, useDragControls, useReducedMotion, type PanInfo } from 'framer-motion';
import { asset, people, STAGES, stageInfo, fa, type Place } from '../../data';
import { Avatar } from '../ui/Avatar';
import { icon } from '../ui/icons';

interface Props {
  place: Place | null;
  onClose: () => void;
  onEnter: (p: Place) => void;
  style: React.CSSProperties;
}

const stageOrder = [...STAGES].reverse(); // RTL: «آماده‌ی ساخت» on the right … «شکوفا» on the left
const filledCount = (p: Place) => (p.stage ? 4 - STAGES.findIndex((s) => s.id === p.stage) : 0);

/** Bottom sheet for a selected map place (inside the 560 column on desktop). */
export function PlaceSheet({ place, onClose, onEnter, style }: Props) {
  const reduce = useReducedMotion();
  const controls = useDragControls();
  const onDragEnd = (_: unknown, i: PanInfo) => {
    if (i.offset.y > 80 || i.velocity.y > 500) onClose();
  };
  return (
    <AnimatePresence>
      {place && (
        <motion.section
          key="place-sheet"
          className="place-sheet"
          role="dialog"
          aria-label={place.name}
          data-testid="place-sheet"
          style={{ position: 'absolute', zIndex: 20, ...style }}
          initial={{ y: reduce ? 0 : 320, opacity: reduce ? 0 : 1 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: reduce ? 0 : 340, opacity: reduce ? 0 : 1 }}
          transition={reduce ? { duration: 0.15 } : { type: 'spring', stiffness: 380, damping: 36 }}
          drag="y"
          dragControls={controls}
          dragListener={false}
          onPointerDown={(e) => !(e.target as HTMLElement).closest('button') && controls.start(e)}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0.05, bottom: 0.7 }}
          onDragEnd={onDragEnd}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="grab" />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={place.id}
              style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
              initial={{ opacity: 0, x: reduce ? 0 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: reduce ? 0 : 10 }}
              transition={{ duration: 0.16 }}
            >
              <SheetBody place={place} onClose={onClose} onEnter={onEnter} />
            </motion.div>
          </AnimatePresence>
        </motion.section>
      )}
    </AnimatePresence>
  );
}

function SheetBody({ place, onClose, onEnter }: Omit<Props, 'style' | 'place'> & { place: Place }) {
  const st = place.stage ? stageInfo(place.stage) : null;
  const filled = filledCount(place);
  const isLib = place.id === 'library';
  const headPerson = isLib ? people.amir : place.head ? Object.values(people).find((x) => x.name === place.head) ?? { id: place.id, name: place.head, initials: place.head.split(' ').map((w) => w[0]).join(' ').slice(0, 3), tint: place.dot } : null;
  const stack = isLib ? ['sina', 'mohammad', 'reza'] : ['parsa', 'kian', 'arash'];
  return (
    <>
      <div className="top">
        <div className="title">
          <span className="place-icon" style={isLib ? undefined : { background: `linear-gradient(180deg, ${place.dot}, color-mix(in srgb, ${place.dot} 60%, #1b2230))`, boxShadow: `0 3px 0 color-mix(in srgb, ${place.dot} 50%, #000), inset 0 1.5px 0 rgba(255,255,255,.45)` }}>
            {isLib ? <img src={icon('menuBook')} width={26} height={26} alt="" /> : <img className="thumb" src={asset(place.sprite)} alt="" />}
          </span>
          <div className="txt">
            <div className="name-row">
              <b data-testid="sheet-title">{place.name}</b>
              {st && (
                <span className="pill-chip" style={{ background: `${st.color}29`, border: `1px solid ${st.color}99`, color: place.stage === 'blooming' ? 'var(--gold-text)' : st.color, padding: '3px 8px' }}>
                  {st.label}
                </span>
              )}
            </div>
            <span className="sub">
              {place.domain}، {fa(place.rolesFilled)} از {fa(place.rolesTotal)} نقش پر شده
            </span>
          </div>
        </div>
        <button className="close" onClick={onClose} aria-label="بستن" data-testid="sheet-close">
          <img src={icon('close')} width={16} height={16} alt="" />
        </button>
      </div>

      {st && (
        <div>
          <div className="segments" aria-label={`مرحله: ${st.label}`}>
            {stageOrder.map((s, i) => (
              <span key={s.id}>
                {i < filled && (
                  <motion.i
                    style={{ background: place.stage === 'blooming' ? undefined : `linear-gradient(180deg, color-mix(in srgb, ${st.color} 70%, #fff), ${st.color})` }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.35, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
              </span>
            ))}
          </div>
          <div className="stage-labels">
            {stageOrder.map((s) => (
              <span key={s.id} className={s.id === place.stage ? 'on' : ''} style={s.id === place.stage && s.id !== 'blooming' ? { color: s.color } : undefined}>
                {s.label}
              </span>
            ))}
          </div>
        </div>
      )}
      {!st && <p className="sub" style={{ fontWeight: 700, fontSize: 12, color: 'var(--muted-3)', lineHeight: '21px' }}>{place.description}</p>}

      <div className="sheet-head">
        {headPerson ? (
          <div className="hi">
            <Avatar person={headPerson} size={38} ring={isLib ? '#e2b54a' : undefined} ringWidth={2} />
            <div className="t">
              <b>{headPerson.name}</b>
              <span>{place.headRole}</span>
            </div>
          </div>
        ) : (
          <div className="hi">
            <div className="t">
              <b>هنوز مسئولی نداره</b>
              <span>{fa(place.rolesTotal)} نقش آماده‌ی پر شدن</span>
            </div>
          </div>
        )}
        <div className="stack" aria-label="اعضا">
          {stack.map((id) => (
            <Avatar key={id} person={id} size={26} ring="#1b2230" ringWidth={2} />
          ))}
        </div>
      </div>

      <div className="sheet-actions">
        <motion.button className="btn btn-primary btn-lg glow" onClick={() => onEnter(place)} data-testid="sheet-enter">
          ورود به {place.name}
        </motion.button>
      </div>
    </>
  );
}
