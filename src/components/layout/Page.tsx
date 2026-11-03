import { motion, useIsPresent, type HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';

/**
 * Route wrapper for crossfades: while a page is exiting it is lifted out of the
 * document flow (absolute, no pointer events) so the incoming page renders at once.
 */
export const Page = forwardRef<HTMLDivElement, HTMLMotionProps<'div'>>(function Page({ style, ...rest }, ref) {
  const present = useIsPresent();
  return (
    <motion.div
      ref={ref}
      {...rest}
      style={present ? style : { ...style, position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}
      aria-hidden={present ? undefined : true}
    />
  );
});
