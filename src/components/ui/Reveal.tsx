import { motion, type HTMLMotionProps, type Variants } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1] as const;

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.985 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: EASE } },
};

/** Container that reveals its <Item> children one after another. */
export function Stagger({ delay = 0, gap = 0.06, ...rest }: HTMLMotionProps<'div'> & { delay?: number; gap?: number }) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap, delayChildren: delay } } }}
      {...rest}
    />
  );
}

/** One revealed item (fade + short rise). Respects reduced motion via MotionConfig. */
export function Item(props: HTMLMotionProps<'div'>) {
  return <motion.div variants={itemVariants} {...props} />;
}

/** Stand-alone entrance for elements outside a Stagger (map overlays etc.). */
export function Appear({ delay = 0, from = 'up', ...rest }: HTMLMotionProps<'div'> & { delay?: number; from?: 'up' | 'down' | 'left' | 'right' | 'fade' }) {
  const off = { up: { y: 14 }, down: { y: -14 }, left: { x: -14 }, right: { x: 14 }, fade: {} }[from];
  return (
    <motion.div
      initial={{ opacity: 0, ...off }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.45, delay, ease: EASE }}
      {...rest}
    />
  );
}
