import { asset, people, type Person } from '../../data';

interface Props {
  person: Person | string;
  size: number;
  /** ring colour (rank/podium/role highlight); Figma uses 2–2.5px rings */
  ring?: string;
  ringWidth?: number;
}

/** Photo avatar when available, otherwise initials on the Figma gradient (tint → #2a3a50). */
export function Avatar({ person, size, ring, ringWidth = 2.5 }: Props) {
  const p = typeof person === 'string' ? people[person] : person;
  const style: React.CSSProperties = {
    width: size,
    height: size,
    boxShadow: ring ? `0 0 0 ${ringWidth}px ${ring} inset` : undefined,
    background: p.photo ? undefined : `linear-gradient(180deg, ${p.tint ?? '#6b7a8b'}, #2a3a50)`,
    fontSize: size * 0.36,
  };
  return (
    <span className="avatar" style={style} aria-label={p.name} role="img">
      {p.photo ? <img src={asset(p.photo)} alt="" /> : <span>{p.initials}</span>}
      {ring && p.photo && (
        <span style={{ position: 'absolute', inset: 0, borderRadius: 99, boxShadow: `0 0 0 ${ringWidth}px ${ring} inset` }} />
      )}
    </span>
  );
}
