import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { hood, school, schoolInfo, STAGES, type Place } from '../data';
import { transition, useUi } from '../store';
import { icon } from '../components/ui/icons';
import { Overlay } from '../components/ui/Overlay';
import { MapScreen, type NavState } from './MapScreen';

const notInPrototype = 'این مکان هنوز در نسخه‌ی آزمایشی نیست';
const lotCenter = (p: Place) => ({ x: p.lot.x + p.lot.w / 2, y: p.lot.y + p.lot.h / 2 });

/** Step 1 – neighbourhood map. */
export function NeighborhoodPage() {
  const navigate = useNavigate();
  const toast = useUi((s) => s.toast);
  const schoolPlace = hood.places.find((p) => p.id === 'school')!;

  return (
    <MapScreen
      world={hood}
      section="hood"
      nav="hood"
      topFade={desktop() ? 190 : 200}
      startCam={(base) => {
        if (!transition.fromSchool) return null;
        transition.fromSchool = false;
        return { from: { ...lotCenter(schoolPlace), s: 1.9 }, to: base };
      }}
      header={(desktop, locate) => (
        <div className="hint-card" data-testid="hint-card" style={desktop ? undefined : undefined}>
          <button className="ico" onClick={locate} aria-label="برگشت به مرکز محله">
            <img src={icon('locateHint')} width={22} height={22} alt="" />
          </button>
          <div className="t">
            <b>محله‌ی من</b>
            <span>روی هر مکان بزن تا واردش بشی</span>
          </div>
        </div>
      )}
      onDirectEnter={(p, map) => {
        // tag pops (handled by "pressed"), camera springs onto the school, then crossfade to the school map
        map.flyTo({ ...lotCenter(p), s: 1.9 }, { spring: false, duration: 0.42 }).then(() => {
          transition.toSchool = true;
          navigate('/school', { state: { from: 'hood', depth: 0 } satisfies NavState });
        });
      }}
      onEnter={() => toast(notInPrototype, 'info')}
      onDetails={() => toast(notInPrototype, 'info')}
    />
  );
}

/** Steps 2–3 – school map with place selection + sheet. */
export function SchoolPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useUi((s) => s.toast);
  const [info, setInfo] = useState(false);
  const state = (location.state ?? {}) as NavState;

  const back = () => {
    transition.fromSchool = true;
    if (state.from === 'hood') navigate(-((state.depth ?? 0) + 1));
    else navigate('/', { replace: true });
  };
  const openLibrary = (p: Place) => {
    if (p.id === 'library') navigate('/school/library', { state: { from: 'sheet' } satisfies NavState });
    else toast(notInPrototype, 'info');
  };

  return (
    <>
      <MapScreen
        world={school}
        section="school"
        nav="office"
        topFade={desktop() ? 240 : 250}
        controlsLift={43}
        startCam={(base) => {
          if (!transition.toSchool) return null;
          transition.toSchool = false;
          return { from: { ...base, s: base.s * 0.82 }, to: base };
        }}
        header={() => (
          <div className="school-header" data-testid="school-header">
            <div className="row">
              <div className="tg">
                <button className="icon-btn" onClick={back} aria-label="برگشت به محله" data-testid="school-back">
                  <img src={icon('backHeader')} width={18} height={18} alt="" />
                </button>
                <div className="t">
                  <b>{schoolInfo.name}</b>
                  <span>{schoolInfo.subtitle}</span>
                </div>
              </div>
              <button className="icon-btn" onClick={() => setInfo(true)} aria-label="درباره‌ی مدرسه" data-testid="school-info">
                <img src={icon('infoHeader')} width={18} height={18} alt="" />
              </button>
            </div>
            <div className="stats-row">
              <div>
                <span className="v" style={{ color: '#e2b54a' }}>{schoolInfo.filledRoles}</span>
                <span className="k">نقش پر شده</span>
              </div>
              <div>
                <span className="v" style={{ color: '#4fb86a' }}>{schoolInfo.activePlaces}</span>
                <span className="k">مکان فعال</span>
              </div>
              <div>
                <span className="v" style={{ color: '#e2e6ec' }}>{schoolInfo.students}</span>
                <span className="k">دانش‌آموز</span>
              </div>
            </div>
          </div>
        )}
        footer={
          <div className="legend" data-testid="legend">
            {[...STAGES].reverse().map((s) => (
              <span key={s.id}>
                <i style={{ background: s.color }} />
                {s.label}
              </span>
            ))}
          </div>
        }
        onEnter={openLibrary}
        onDetails={openLibrary}
      />
      <Overlay open={info} onClose={() => setInfo(false)} title={schoolInfo.name} testId="school-info-sheet">
        <p style={{ fontWeight: 700, fontSize: 13, lineHeight: '24px', color: 'var(--muted-3)' }}>
          هر مکان مدرسه با فعالیت دانش‌آموزها رشد می‌کنه. رنگ هر برچسب مرحله‌ی اون مکان رو نشون می‌ده:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {STAGES.map((s) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 13 }}>
              <i style={{ width: 10, height: 10, borderRadius: 99, background: s.color }} />
              {s.label}
            </div>
          ))}
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => setInfo(false)}>
          متوجه شدم
        </button>
      </Overlay>
    </>
  );
}

const desktop = () => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches;
