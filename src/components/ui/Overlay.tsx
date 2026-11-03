import { AnimatePresence, motion, useDragControls, useReducedMotion, type PanInfo } from 'framer-motion';
import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useIsDesktop } from '../../hooks/useMedia';
import { icon } from './icons';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** force centred modal even on mobile */
  modal?: boolean;
  testId?: string;
}

/** Bottom sheet on mobile, centred modal on desktop. Esc, scrim click and drag-down close it. */
export function Overlay({ open, onClose, title, children, modal, testId }: Props) {
  const desktop = useIsDesktop();
  const reduce = useReducedMotion();
  const asModal = modal || desktop;
  const controls = useDragControls();

  // lock the page behind while open (iOS needs position:fixed, overflow alone is ignored)
  useEffect(() => {
    if (!open) return;
    return lockScroll();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 90 || info.velocity.y > 600) onClose();
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            className="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          {asModal ? (
            <motion.div
              key="modal"
              role="dialog"
              aria-modal="true"
              aria-label={title}
              data-testid={testId}
              className="overlay-modal"
              initial={reduce ? { opacity: 0, x: '-50%', y: '-50%' } : { opacity: 0, scale: 0.94, x: '-50%', y: '-46%' }}
              animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
              exit={reduce ? { opacity: 0, x: '-50%', y: '-50%' } : { opacity: 0, scale: 0.96, x: '-50%', y: '-48%' }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <Head title={title} onClose={onClose} />
              <div className="ov-body">{children}</div>
            </motion.div>
          ) : (
            <motion.div
              key="sheet"
              role="dialog"
              aria-modal="true"
              aria-label={title}
              data-testid={testId}
              className="overlay-sheet"
              initial={{ y: reduce ? 0 : '100%', opacity: reduce ? 0 : 1 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: reduce ? 0 : '100%', opacity: reduce ? 0 : 1 }}
              transition={reduce ? { duration: 0.15 } : { type: 'spring', stiffness: 420, damping: 40 }}
              drag="y"
              dragControls={controls}
              dragListener={false}
              onPointerDown={(e) => {
                if (!(e.target as HTMLElement).closest('textarea,input,button,a')) controls.start(e);
              }}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={onDragEnd}
            >
              <span className="grab" />
              <Head title={title} onClose={onClose} />
              <div className="ov-body">{children}</div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function Head({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="ov-head">
      <b>{title}</b>
      <button className="icon-btn" style={{ borderRadius: 99, width: 32, height: 32 }} onClick={onClose} aria-label="بستن">
        <img src={icon('close')} width={16} height={16} alt="" />
      </button>
    </div>
  );
}

let locks = 0;
let savedY = 0;
/** Freeze page scroll; nested overlays share one lock. Returns the unlock function. */
function lockScroll() {
  const b = document.body;
  if (locks++ === 0) {
    savedY = window.scrollY;
    Object.assign(b.style, { position: 'fixed', top: `-${savedY}px`, left: '0', right: '0', width: '100%', overflow: 'hidden' });
  }
  return () => {
    if (--locks === 0) {
      Object.assign(b.style, { position: '', top: '', left: '', right: '', width: '', overflow: '' });
      window.scrollTo(0, savedY);
    }
  };
}
