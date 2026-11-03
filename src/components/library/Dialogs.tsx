import { useEffect, useState } from 'react';
import { badgesByPerson, defaultBadges, fa, library, people, type Member } from '../../data';
import { useApp, useUi } from '../../store';
import { Avatar } from '../ui/Avatar';
import { Overlay } from '../ui/Overlay';
import { icon } from '../ui/icons';

const MIN = 10;

/** Request form for one specific role (the one tapped in «نقش‌های آزاد»). */
export function JoinDialog({ open, onClose, initialRole }: { open: boolean; onClose: () => void; initialRole?: string | null }) {
  const send = useApp((s) => s.sendJoin);
  const toast = useUi((s) => s.toast);
  const [text, setText] = useState('');
  // keep the last role while the sheet animates out
  const [roleName, setRoleName] = useState<string | null>(initialRole ?? null);
  useEffect(() => {
    if (open) {
      setText('');
      setRoleName(initialRole ?? null);
    }
  }, [open, initialRole]);
  const role = library.openRoles.find((r) => r.name === roleName);
  const len = text.trim().length;
  const ok = !!role && len >= MIN;
  return (
    <Overlay open={open} onClose={onClose} title={role ? `درخواست نقش ${role.name}` : 'درخواست نقش'} testId="join-dialog">
      {role && (
        <div className="join-role" style={{ ['--role' as string]: role.color } as React.CSSProperties} data-testid="join-role">
          <div className="t">
            <span className="k">در کتابخانه‌ی {schoolShort}</span>
            <span className="d">{role.desc}</span>
          </div>
          <div className="meta">
            <span className="slot">{fa(role.slots)} جای خالی</span>
            <span className="perk">{role.perks}</span>
          </div>
        </div>
      )}
      <label className="field-label" htmlFor="why">
        چرا می‌خوای {role ? role.name : 'این نقش'} باشی؟
      </label>
      <textarea id="why" className="textarea" value={text} onChange={(e) => setText(e.target.value)} placeholder={role?.id === 'promo' ? 'مثلاً: نقاشی و طراحی پوستر رو دوست دارم' : 'مثلاً: کتاب‌خوندن رو دوست دارم و می‌خوام به بقیه کتاب معرفی کنم'} data-testid="join-reason" maxLength={240} />
      <div className="counter">
        <span className={len >= MIN ? 'ok' : ''}>{len >= MIN ? 'آماده‌ی ارسال' : `حداقل ${fa(MIN)} کاراکتر`}</span>
        <span>
          {fa(len)} / {fa(240)}
        </span>
      </div>
      <p className="join-note">درخواستت برای امیر حسینی، مسئول کتابخانه، فرستاده می‌شه.</p>
      <button
        className="btn btn-primary btn-lg glow"
        disabled={!ok}
        data-testid="join-submit"
        onClick={() => {
          send(role!.name, text.trim());
          onClose();
          toast(`درخواست نقش ${role!.name} برای امیر حسینی فرستاده شد`);
        }}
      >
        ارسال درخواست
      </button>
    </Overlay>
  );
}

const schoolShort = 'مدرسه';

export function CancelDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const cancel = useApp((s) => s.cancelJoin);
  const toast = useUi((s) => s.toast);
  return (
    <Overlay open={open} onClose={onClose} title="لغو درخواست عضویت" modal testId="cancel-dialog">
      <p style={{ fontWeight: 700, fontSize: 13, lineHeight: '24px', color: 'var(--muted-3)' }}>درخواستت برای امیر حسینی پس گرفته می‌شه. بعداً هم می‌تونی دوباره درخواست بدی.</p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          className="btn btn-danger btn-lg"
          style={{ flex: 1 }}
          data-testid="cancel-confirm"
          onClick={() => {
            cancel();
            onClose();
            toast('درخواستت لغو شد', 'info');
          }}
        >
          لغو درخواست
        </button>
        <button className="btn btn-secondary btn-lg" style={{ flex: 1 }} onClick={onClose}>
          نه، بمونه
        </button>
      </div>
    </Overlay>
  );
}

export function MessageDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useUi((s) => s.toast);
  const [text, setText] = useState('');
  useEffect(() => {
    if (open) setText('');
  }, [open]);
  return (
    <Overlay open={open} onClose={onClose} title="پیام به امیر حسینی" testId="message-dialog">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar person="amir" size={40} ring="#e2b54a" ringWidth={2} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <b style={{ fontWeight: 900, fontSize: 14 }}>امیر حسینی</b>
          <span style={{ fontWeight: 700, fontSize: 11, color: 'var(--muted)' }}>مسئول کتابخانه</span>
        </div>
      </div>
      <textarea className="textarea" value={text} onChange={(e) => setText(e.target.value)} placeholder="سلام امیر، …" data-testid="message-text" maxLength={300} />
      <button
        className="btn btn-primary btn-lg glow"
        disabled={!text.trim()}
        data-testid="message-send"
        onClick={() => {
          onClose();
          toast('پیامت فرستاده شد');
        }}
      >
        ارسال پیام
      </button>
    </Overlay>
  );
}

export function ProfileDialog({ member, rank, onClose, yearLabel }: { member: Member | null; rank: number; onClose: () => void; yearLabel: string }) {
  const p = member ? people[member.personId] : null;
  const badges = member ? badgesByPerson[member.personId] ?? defaultBadges : [];
  return (
    <Overlay open={!!member} onClose={onClose} title={p?.name ?? ''} testId="profile-dialog">
      {member && p && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Avatar person={p} size={64} ring={rank === 1 ? '#e2b54a' : rank === 2 ? '#aeb8c4' : rank === 3 ? '#c98a5a' : undefined} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <b style={{ fontWeight: 900, fontSize: 16 }}>{p.name}</b>
              <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--muted)' }}>
                {member.role}، {p.grade}
              </span>
              {member.graduated && (
                <span className="pill-chip pill-grey" style={{ alignSelf: 'flex-start' }}>
                  فارغ‌التحصیل
                </span>
              )}
            </div>
          </div>
          <div className="stats-row">
            <div>
              <span className="v" style={{ color: 'var(--gold-light)' }}>{fa(member.points)}</span>
              <span className="k">امتیاز {yearLabel}</span>
            </div>
            <div>
              <span className="v">{fa(rank)}</span>
              <span className="k">رتبه در کتابخانه</span>
            </div>
          </div>
          <span className="field-label">نشان‌ها</span>
          <div className="badges">
            {badges.map((b, i) => (
              <div key={b}>
                <img src={icon(i === 0 ? 'starGold' : i === 1 ? 'starSilver' : 'starBronze')} width={22} height={22} alt="" />
                {b}
              </div>
            ))}
          </div>
        </>
      )}
    </Overlay>
  );
}
