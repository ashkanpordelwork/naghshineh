import { useReducedMotion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { hoodNav, schoolNav, soonPages } from '../data';
import { useIsDesktop } from '../hooks/useMedia';
import { Page } from '../components/layout/Page';
import { BottomNav, TopBar, TopNav } from '../components/layout/Nav';
import { icon } from '../components/ui/icons';
import { Item, Stagger } from '../components/ui/Reveal';

/** Placeholder for tabs whose screens are not part of this section ("به‌زودی"). */
export function ComingSoon() {
  const { key = 'profile' } = useParams();
  const desktop = useIsDesktop();
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const page = soonPages[key] ?? soonPages.profile;
  const item = [...hoodNav, ...schoolNav].find((n) => n.key === page.nav) ?? hoodNav[0];
  const home = page.section === 'hood' ? '/' : '/school';
  const back = () => (window.history.state?.idx > 0 ? navigate(-1) : navigate(home, { replace: true }));

  const content = (
    <Stagger className="soon" data-testid="coming-soon" delay={0.1} gap={0.07}>
      <Item><span className="tile" style={{ ['--tile-from' as string]: item.from, ['--tile-to' as string]: item.to, ['--tile-shadow' as string]: item.shadow, width: 72, height: 72, borderRadius: 22 } as React.CSSProperties}>
        <img className="gloss" src={icon('tileGlossBig')} alt="" style={{ width: 50, height: 22, left: 11, top: 3 }} />
        <img className="glyph" src={icon(item.icon)} alt="" style={{ width: 36, height: 36 }} />
      </span></Item>
      <Item><b>{page.title}</b></Item>
      <Item><span className="pill-chip pill-gold">به‌زودی</span></Item>
      <Item><span>{page.text}</span></Item>
      <Item><button className="btn btn-secondary btn-lg" onClick={back} data-testid="soon-back">
        بازگشت
      </button></Item>
    </Stagger>
  );

  return (
    <Page className="page app-bg" initial={{ opacity: 0, y: reduce ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}>
      {desktop ? (
        <>
          <TopNav section={page.section} active={page.nav} />
          <div className="desk-page">
            <div className="desk-col card" style={{ marginTop: 24 }}>{content}</div>
          </div>
        </>
      ) : (
        <>
          <TopBar />
          <div style={{ padding: '24px 16px 120px' }}>
            <div className="card">{content}</div>
          </div>
          <BottomNav section={page.section} active={page.nav} />
        </>
      )}
    </Page>
  );
}
