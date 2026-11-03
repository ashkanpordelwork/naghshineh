import { motion, useReducedMotion } from 'framer-motion';
import { fa, people, type Member } from '../../data';
import { Avatar } from '../ui/Avatar';
import { icon } from '../ui/icons';

const RANK = {
  1: { ring: '#e2b54a', badge: ['#ffe08a', '#e2b54a'], badgeText: '#8a6514', points: '#ffe08a', star: 'starGold', ped: '226,181,74', pedH: 64, size: 68 },
  2: { ring: '#aeb8c4', badge: ['#e9eef4', '#aeb8c4'], badgeText: '#5e6b7e', points: '#e9eef4', star: 'starSilver', ped: '174,184,196', pedH: 44, size: 56 },
  3: { ring: '#c98a5a', badge: ['#f2c09a', '#c98a5a'], badgeText: '#6e4426', points: '#f2c09a', star: 'starBronze', ped: '201,138,90', pedH: 32, size: 56 },
} as const;

interface Props {
  members: Member[];
  meId?: string;
  onPick: (m: Member, rank: number) => void;
  /** changing this replays the entrance animation */
  animKey: string;
}

export function Leaderboard({ members, meId, onPick, animKey }: Props) {
  const reduce = useReducedMotion();
  const sorted = [...members].sort((a, b) => b.points - a.points);
  const top = sorted.slice(0, 3);
  const rest = sorted.slice(3);
  // podium visual order in RTL: 2nd (right) · 1st (centre) · 3rd (left)
  const podium = [top[1] && { m: top[1], r: 2 as const }, top[0] && { m: top[0], r: 1 as const }, top[2] && { m: top[2], r: 3 as const }].filter(Boolean) as { m: Member; r: 1 | 2 | 3 }[];

  return (
    <div className="card leaderboard" data-testid="leaderboard" key={animKey}>
      <div className="podium">
        {podium.map(({ m, r }) => {
          const c = RANK[r];
          const p = people[m.personId];
          const order = r === 1 ? 2 : r === 2 ? 1 : 0; // pedestal rise order: 3rd, 2nd, 1st
          return (
            <button key={m.personId} className="col" onClick={() => onPick(m, r)} data-testid={`podium-${r}`} aria-label={`${p.name}، رتبه‌ی ${fa(r)}`}>
              <motion.div
                className="who"
                style={{ width: c.size, height: c.size + 10 }}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: reduce ? 0 : 0.35 + order * 0.08, type: reduce ? 'tween' : 'spring', stiffness: 380, damping: 22 }}
              >
                <Avatar person={p} size={c.size} ring={c.ring} />
                <span className="badge" style={{ background: `linear-gradient(180deg, ${c.badge[0]}, ${c.badge[1]})`, color: c.badgeText, top: c.size - 12, bottom: 'auto' }}>
                  {fa(r)}
                </span>
                {r === 1 && <img className="crown" src={icon('crown')} alt="" />}
              </motion.div>
              <motion.span className="nm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduce ? 0 : 0.45 + order * 0.08 }}>
                {p.name}
              </motion.span>
              <motion.span className="rl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduce ? 0 : 0.5 + order * 0.08 }}>
                {m.role}
              </motion.span>
              <motion.span className="points" style={{ color: c.points }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduce ? 0 : 0.5 + order * 0.08 }}>
                <img src={icon(c.star)} alt="" />
                {fa(m.points)}
              </motion.span>
              <motion.span
                className="pedestal"
                style={{
                  height: c.pedH,
                  background: `linear-gradient(180deg, rgba(${c.ped},0.45), rgba(${c.ped},0.05))`,
                  border: `1px solid rgba(${c.ped},0.4)`,
                  originY: 1,
                }}
                initial={reduce ? { opacity: 0 } : { scaleY: 0 }}
                animate={reduce ? { opacity: 1 } : { scaleY: 1 }}
                transition={{ delay: reduce ? 0 : order * 0.1, duration: reduce ? 0.15 : 0.45, ease: [0.22, 1, 0.36, 1] }}
              />
            </button>
          );
        })}
      </div>
      {rest.map((m, i) => {
        const p = people[m.personId];
        const me = m.personId === meId;
        return (
          <motion.button
            key={m.personId}
            className={`lb-row${me ? ' me' : ''}`}
            onClick={() => onPick(m, i + 4)}
            data-testid={`row-${i + 4}`}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: reduce ? 0 : 0.55 + i * 0.07, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="rank">{fa(i + 4)}</span>
            <Avatar person={p} size={36} />
            <span className="t">
              <span className="n">
                <b>{p.name}</b>
                {m.graduated && (
                  <span className="pill-chip pill-grey" data-testid="graduated">
                    فارغ‌التحصیل
                  </span>
                )}
              </span>
              <span className="r">{m.role}</span>
            </span>
            <span className="points" style={{ color: 'var(--gold-light)' }}>
              <img src={icon('starGold')} alt="" />
              {fa(m.points)}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
