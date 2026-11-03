import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { asset, hoodNav, schoolNav, user, type NavItem, type NavKey } from '../../data';
import { useUi } from '../../store';
import { icon } from '../ui/icons';

export type Section = 'hood' | 'school';
const itemsFor = (s: Section) => (s === 'hood' ? hoodNav : schoolNav);

const tileVars = (it: NavItem) =>
  ({ '--tile-from': it.from, '--tile-to': it.to, '--tile-shadow': it.shadow }) as React.CSSProperties;

function useGo() {
  const nav = useNavigate();
  return (it: NavItem, active: boolean) => {
    if (active && it.path === window.location.hash.slice(1).split('?')[0]) return;
    nav(it.path);
  };
}

/** Mobile bottom navigation (below 768px). */
export function BottomNav({ section, active }: { section: Section; active: NavKey }) {
  const go = useGo();
  return (
    <nav className="bottom-nav" aria-label="منوی اصلی" data-testid="bottom-nav">
      {itemsFor(section).map((it) => {
        const on = it.key === active;
        return (
          <button key={it.key} className={`nav-item${on ? ' active' : ''}`} style={tileVars(it)} onClick={() => go(it, on)} aria-current={on ? 'page' : undefined} data-testid={`nav-${it.key}`}>
            <span className="tile">
              <img className="gloss" src={icon(on ? 'tileGlossBig' : 'tileGloss')} alt="" />
              <img className="glyph" src={icon(it.icon)} alt="" />
            </span>
            <span className="label">{it.label}</span>
            {on && <motion.span layoutId={`nav-ind-${section}`} className="indicator" />}
          </button>
        );
      })}
    </nav>
  );
}

/** Desktop header with the same tabs (≥768px). */
export function TopNav({ section, active }: { section: Section; active: NavKey }) {
  const go = useGo();
  return (
    <header className="top-nav" data-testid="top-nav">
      <UserBlock />
      <nav className="top-tabs" aria-label="منوی اصلی">
        {itemsFor(section).map((it) => {
          const on = it.key === active;
          return (
            <button key={it.key} className={`top-tab${on ? ' active' : ''}`} style={tileVars(it)} onClick={() => go(it, on)} aria-current={on ? 'page' : undefined} data-testid={`nav-${it.key}`}>
              {on && <motion.span layoutId={`top-ind-${section}`} className="active-bg" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
              <span className="tile">
                <img className="glyph" src={icon(it.icon)} alt="" />
              </span>
              <span>{it.label}</span>
            </button>
          );
        })}
      </nav>
      <Chips />
    </header>
  );
}

export function UserBlock() {
  const nav = useNavigate();
  return (
    <button className="user-block" onClick={() => nav('/soon/profile')} aria-label={`پروفایل ${user.name}`} data-testid="user-block">
      <span className="user-avatar">
        <span className="photo">
          <img src={asset(user.photo)} alt="" />
        </span>
        <span className="level">{user.level.toLocaleString('fa-IR')}</span>
      </span>
      <span className="names">
        <span className="name">{user.name}</span>
        <span className="title">{user.title}</span>
      </span>
    </button>
  );
}

export function Chips() {
  const nav = useNavigate();
  const toast = useUi((s) => s.toast);
  return (
    <div className="chips">
      <button className="chip" onClick={() => toast(`${user.streak.toLocaleString('fa-IR')} روز پیاپی! فردا هم بیا تا زنجیره نشکنه`, 'info')} aria-label="روزهای پیاپی" data-testid="chip-streak">
        <img src={icon('fire')} alt="" />
        {user.streak.toLocaleString('fa-IR')}
      </button>
      <button className="chip" onClick={() => nav('/soon/notifications')} aria-label="اعلان‌ها" data-testid="chip-bell">
        <img src={icon('bell')} alt="" />
        {user.notifications.toLocaleString('fa-IR')}
      </button>
    </div>
  );
}

/** Mobile top bar: user on the right, chips on the left (RTL). */
export function TopBar() {
  return (
    <div className="topbar">
      <UserBlock />
      <Chips />
    </div>
  );
}

export const userPhoto = asset(user.photo);
