import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { asset, fa, library, people, schoolInfo, user, type Member } from '../data';
import { useApp } from '../store';
import { useIsDesktop } from '../hooks/useMedia';
import { Page } from '../components/layout/Page';
import { BottomNav, TopBar, TopNav } from '../components/layout/Nav';
import { Avatar } from '../components/ui/Avatar';
import { Item, Stagger } from '../components/ui/Reveal';
import { icon } from '../components/ui/icons';
import { Leaderboard } from '../components/library/Leaderboard';
import { CancelDialog, JoinDialog, MessageDialog, ProfileDialog } from '../components/library/Dialogs';
import type { NavState } from './MapScreen';

type Tab = 'members' | 'history';
const scrollMemo: Record<Tab, number> = { members: 0, history: 0 };

export function LibraryPage() {
  const desktop = useIsDesktop();
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const storedTab = useApp((s) => s.libraryTab);
  const setStoredTab = useApp((s) => s.setLibraryTab);
  const tab: Tab = (params.get('tab') as Tab) ?? storedTab;
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [msg, setMsg] = useState(false);
  const [join, setJoin] = useState(false);
  const [cancel, setCancel] = useState(false);
  const [pick, setPick] = useState<{ m: Member; r: number; year: string } | null>(null);
  const state = (location.state ?? {}) as NavState;

  // simulated slow connection → skeleton for ~400ms
  useEffect(() => {
    const id = window.setTimeout(() => setLoading(false), reduce ? 150 : 400);
    return () => window.clearTimeout(id);
  }, [reduce]);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 4);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  const backToMap = () => {
    if (state.from === 'sheet') navigate(-1);
    else navigate('/school?place=library', { replace: true });
  };

  const switchTab = (t: Tab) => {
    if (t === tab) return;
    scrollMemo[tab] = window.scrollY;
    setStoredTab(t);
    setParams(t === 'members' ? {} : { tab: t }, { replace: true, state: location.state });
  };
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    scrollMemo.members = 0;
    scrollMemo.history = 0;
  }, []);

  const body = (
    <Stagger className="lib-body" delay={0.08} gap={0.07}>
      <Item>
        <button className="back-pill" onClick={backToMap} data-testid="back-pill">
          <img src={icon('mapPill')} width={16} height={16} alt="" />
          <span className="school">{schoolInfo.name}</span>
          <span className="sep" />
          <span className="back">بازگشت به نقشه</span>
          <img src={icon('backPill')} width={14} height={14} alt="" style={{ transform: 'scaleX(-1)' }} />
        </button>
      </Item>

      <Item className="lib-header">
        <button className="icon-btn" onClick={backToMap} aria-label="بازگشت" data-testid="lib-back">
          <img src={icon('backHeader')} width={18} height={18} alt="" />
        </button>
        <div className="t">
          <b>{library.name}</b>
          <span>{library.subtitle}</span>
        </div>
      </Item>

      <Item className="hero">
        <motion.img className="shadow" src={icon('heroShadow')} alt="" initial={{ opacity: 0, scaleX: 0.6 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ duration: 0.6, delay: 0.25 }} />
        <motion.img
          className="cell"
          src={asset('assets/map/library-hero@3x.png')}
          alt="ساختمان کتابخانه"
          initial={reduce ? false : { y: 22, opacity: 0, scale: 0.92 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 20, delay: 0.2 }}
        />
      </Item>

      <AnimatePresence mode="wait" initial={false}>
        {loading ? (
          <motion.div key="sk" exit={{ opacity: 0, transition: { duration: 0.18 } }}>
            <Skeleton />
          </motion.div>
        ) : (
          <Stagger key="content" gap={0.08} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Item>
              <StageCard />
            </Item>
            <Item>
              <ManagerCard onMessage={() => setMsg(true)} />
            </Item>
            <Item className="tabs" role="tablist" data-testid="tabs">
              {(['members', 'history'] as Tab[]).map((t) => (
                <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => switchTab(t)} data-testid={`tab-${t}`}>
                  {tab === t && <motion.span layoutId="lib-tab" className="ind" transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 38 }} />}
                  <span>{t === 'members' ? 'اعضای امسال' : 'سوابق'}</span>
                </button>
              ))}
            </Item>
            <Item>
              <AnimatePresence mode="wait" initial={false}>
                <Stagger key={tab} gap={0.07} style={{ display: 'flex', flexDirection: 'column', gap: 16 }} exit={{ opacity: 0, transition: { duration: 0.15 } }}>
                  <ScrollRestore tab={tab} />
                  {tab === 'members' ? (
                    <MembersTab onPick={(m, r) => setPick({ m, r, year: library.currentYear })} onJoin={() => setJoin(true)} onCancel={() => setCancel(true)} />
                  ) : (
                    <HistoryTab onPick={(m, r, year) => setPick({ m, r, year })} />
                  )}
                </Stagger>
              </AnimatePresence>
            </Item>
          </Stagger>
        )}
      </AnimatePresence>
    </Stagger>
  );

  return (
    <Page
      className="page app-bg"
      data-testid="screen-library"
      initial={{ opacity: 0, x: reduce ? 0 : -28 }}
      animate={{ opacity: 1, x: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } }}
      exit={{ opacity: 0, x: reduce ? 0 : 20, transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } }}
    >
      {desktop ? (
        <>
          <TopNav section="school" active="office" />
          <div className="desk-page">
            <div className="desk-col">{body}</div>
          </div>
        </>
      ) : (
        <>
          <div className={`page-mobile-top${scrolled ? ' scrolled' : ''}`}>
            <TopBar />
          </div>
          {body}
          <BottomNav section="school" active="office" />
        </>
      )}
      <MessageDialog open={msg} onClose={() => setMsg(false)} />
      <JoinDialog open={join} onClose={() => setJoin(false)} />
      <CancelDialog open={cancel} onClose={() => setCancel(false)} />
      <ProfileDialog member={pick?.m ?? null} rank={pick?.r ?? 0} yearLabel={pick?.year ?? ''} onClose={() => setPick(null)} />
    </Page>
  );
}

/** restores the scroll position a tab had, once its content is mounted */
function ScrollRestore({ tab }: { tab: Tab }) {
  const mounted = useRef(false);
  useLayoutEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    if (scrollMemo[tab]) window.scrollTo(0, scrollMemo[tab]);
  }, [tab]);
  return null;
}

function Segments({ filled = 4 }: { filled?: number }) {
  const reduce = useReducedMotion();
  return (
    <div className="segments">
      {[0, 1, 2, 3].map((i) => (
        <span key={i}>
          {i < filled && (
            <motion.i initial={reduce ? false : { scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.4, delay: 0.1 + i * 0.12, ease: [0.22, 1, 0.36, 1] }} />
          )}
        </span>
      ))}
    </div>
  );
}

function StageCard() {
  return (
    <div className="card stage-card" data-testid="stage-card">
      <div className="head">
        <div className="a">
          <b>سطح کتابخانه</b>
          <span className="pill-chip pill-gold">شکوفا</span>
        </div>
        <span className="pts">{library.totalPoints}</span>
      </div>
      <Segments />
    </div>
  );
}

function ManagerCard({ onMessage }: { onMessage: () => void }) {
  const head = people[library.head];
  return (
    <div className="card manager-card" data-testid="manager-card">
      <div className="top">
        <Avatar person={head} size={52} ring="#e2b54a" />
        <div className="t">
          <span className="k">مسئول کتابخانه</span>
          <b>{head.name}</b>
          <span className="k">{library.headSince}</span>
        </div>
        <button className="btn btn-secondary" style={{ fontSize: 13, padding: '9px 16px' }} onClick={onMessage} data-testid="message-btn">
          پیام
        </button>
      </div>
      <div className="stats-row">
        <div>
          <span className="v" style={{ color: '#eef2f6' }}>{library.stats.members}</span>
          <span className="k">عضو فعال</span>
        </div>
        <div>
          <span className="v" style={{ color: '#9af5c3' }}>{library.stats.openRoles}</span>
          <span className="k">نقش خالی</span>
        </div>
        <div>
          <span className="v" style={{ color: '#d2b3ff' }}>{library.stats.years}</span>
          <span className="k">سال فعالیت</span>
        </div>
      </div>
      <p className="desc">{library.description}</p>
    </div>
  );
}

function SectionTitle({ title, meta, bar }: { title: string; meta?: string; bar: string }) {
  return (
    <div className="section-title">
      <div className="t">
        <i style={{ background: bar }} />
        <b>{title}</b>
      </div>
      {meta && <span className="meta">{meta}</span>}
    </div>
  );
}

function MembersTab({ onPick, onJoin, onCancel }: { onPick: (m: Member, r: number) => void; onJoin: () => void; onCancel: () => void }) {
  const join = useApp((s) => s.join);
  return (
    <>
      <Item>
        <SectionTitle title={`جدول امتیاز ${library.currentYear}`} meta={library.updated} bar="#f5c451" />
      </Item>
      <Item>
        <Leaderboard members={library.members} onPick={onPick} animKey="current" />
      </Item>
      <Item>
      <AnimatePresence mode="wait" initial={false}>
        {join.status === 'none' ? (
          <motion.div key="join" className="card join-card" data-testid="join-card" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
            <div className="top">
              <Avatar person="ali" size={40} ring="#3ddcff" ringWidth={2} />
              <div className="t">
                <b>تو هنوز عضو کتابخانه نیستی</b>
                <span>{fa(library.openRoles.length)} نقش خالی داره؛ با عضویت اسمت وارد جدول می‌شه</span>
              </div>
            </div>
            <div className="actions">
              <button className="btn btn-primary" onClick={onJoin} data-testid="join-btn">
                درخواست عضویت
              </button>
              <span className="roles">{library.openRoles.join('، ')}</span>
            </div>
          </motion.div>
        ) : (
          <motion.div key="pending" className="card join-card pending" data-testid="join-pending" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
            <div className="top">
              <span className="clock" aria-hidden>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="7.5" stroke="#ffe08a" strokeWidth="1.8" />
                  <path d="M10 6v4.3l2.8 1.7" stroke="#ffe08a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div className="t">
                <b>درخواست در انتظار تایید امیر حسینی</b>
                <span>نقش درخواستی: {join.role}</span>
              </div>
            </div>
            <div className="actions">
              <button className="btn btn-secondary" onClick={onCancel} data-testid="cancel-btn">
                لغو درخواست
              </button>
              <span className="roles" style={{ color: 'var(--gold-light)' }}>
                {user.name}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </Item>
      <Item>
        <SectionTitle title="فعالیت‌های اخیر" bar="#4da3ff" />
      </Item>
      <Item>
        <Stagger className="card activity" data-testid="activity" gap={0.08} delay={0.1}>
          {library.activity.map((a) => (
            <Item className="row" key={a.text}>
              <b>{a.text}</b>
              <span style={{ color: a.tone === 'gold' ? '#ffe08a' : '#9af5c3' }}>{a.meta}</span>
            </Item>
          ))}
        </Stagger>
      </Item>
    </>
  );
}

function HistoryTab({ onPick }: { onPick: (m: Member, r: number, year: string) => void }) {
  const yearId = useApp((s) => s.recordsYear);
  const setYear = useApp((s) => s.setRecordsYear);
  const reduce = useReducedMotion();
  const rec = library.records.find((r) => r.id === yearId) ?? library.records[0];
  const head = rec.head ? people[rec.head] : null;
  return (
    <>
      <Item className="years" role="tablist" aria-label="سال تحصیلی" data-testid="years">
        {library.records.map((r) => (
          <button key={r.id} role="tab" aria-selected={r.id === rec.id} className={`year${r.id === rec.id ? ' on' : ''}`} onClick={() => setYear(r.id)} data-testid={`year-${r.id}`}>
            {r.id === rec.id && <motion.span layoutId="year-ind" className="ind" transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 38 }} />}
            <span>{r.label}</span>
          </button>
        ))}
      </Item>
      <Item>
      <AnimatePresence mode="wait" initial={false}>
        <Stagger key={rec.id} gap={0.07} style={{ display: 'flex', flexDirection: 'column', gap: 16 }} exit={{ opacity: 0, transition: { duration: 0.15 } }}>
          {rec.members.length === 0 ? (
            <Item className="card empty" data-testid="records-empty">
              <img src={icon('infoNote')} width={24} height={24} alt="" />
              <b>برای این سال سابقه‌ای ثبت نشده</b>
              <span>کتابخانه از سال تحصیلی ۱۴۰۲ تا ۱۴۰۳ شروع به کار کرده.</span>
            </Item>
          ) : (
            <>
              <Item className="card year-summary" data-testid="year-summary">
                <div className="top">
                  {head && <Avatar person={head} size={44} />}
                  <div className="t">
                    <b>سال تحصیلی {rec.label}</b>
                    <span>
                      مسئول: {head?.name}، {fa(rec.members.length)} عضو
                    </span>
                  </div>
                </div>
                <div className="stats-row">
                  <div>
                    <span className="v">{rec.totalPoints}</span>
                    <span className="k">امتیاز کل</span>
                  </div>
                  <div>
                    <span className="v">{rec.approvedReports}</span>
                    <span className="k">گزارش تاییدشده</span>
                  </div>
                  <div>
                    <span className="v">{rec.groupBadges}</span>
                    <span className="k">نشان گروهی</span>
                  </div>
                </div>
              </Item>
              <Item>
                <SectionTitle title={`جدول امتیاز ${rec.label}`} meta={`${fa(rec.members.length)} عضو`} bar="#b07cff" />
              </Item>
              <Item>
                <Leaderboard members={rec.members} meId={user.id} onPick={(m, r) => onPick(m, r, rec.label)} animKey={rec.id} />
              </Item>
            </>
          )}
          <Item className="note">
            <img src={icon('infoNote')} width={16} height={16} alt="" />
            سوابق بعد از پایان هر سال تحصیلی ثابت می‌مونه
          </Item>
        </Stagger>
      </AnimatePresence>
      </Item>
    </>
  );
}

function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} data-testid="skeleton" aria-busy="true">
      <div className="skeleton" style={{ height: 71 }} />
      <div className="skeleton" style={{ height: 222 }} />
      <div className="skeleton" style={{ height: 48, borderRadius: 14 }} />
      <div className="skeleton" style={{ height: 390 }} />
    </div>
  );
}
