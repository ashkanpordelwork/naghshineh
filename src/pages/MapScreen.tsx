import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { type Cam, type NavKey, type Place, type World } from '../data';
import { useIsDesktop } from '../hooks/useMedia';
import { MapView, type MapHandle } from '../components/map/MapView';
import { Sprites, Tags } from '../components/map/Places';
import { MapFades, Minimap, ZoomControls } from '../components/map/MapChrome';
import { PlaceSheet } from '../components/map/PlaceSheet';
import { BottomNav, TopBar, TopNav, type Section } from '../components/layout/Nav';
import { Page } from '../components/layout/Page';

export interface NavState {
  from?: 'hood' | 'sheet';
  depth?: number;
}

interface Props {
  world: World;
  section: Section;
  nav: NavKey;
  /** card shown on top of the map (hint card / school header) */
  header: (desktop: boolean, locate: () => void) => ReactNode;
  /** extra pill at the bottom (school legend) */
  footer?: ReactNode;
  /** a place was tapped that should be "entered" straight away (neighbourhood → school) */
  onDirectEnter?: (p: Place, map: MapHandle) => void;
  onEnter: (p: Place) => void;
  onDetails: (p: Place) => void;
  /** start camera override (zoom hand-off from the other map) */
  startCam?: (base: Cam) => { from: Cam; to?: Cam } | null;
  topFade: number;
  controlsLift?: number;
}

export function selectedCam(world: World, p: Place, desktop: boolean): Cam {
  const base = desktop ? world.camera.desktop : world.camera.mobile;
  return { x: p.lot.x + p.lot.w / 2, y: p.lot.y + p.lot.h / 2 + (desktop ? world.selectOffset.desktop : world.selectOffset.mobile), s: base.s };
}

export function MapScreen({ world, section, nav, header, footer, onDirectEnter, onEnter, onDetails, startCam, topFade, controlsLift = 0 }: Props) {
  const desktop = useIsDesktop();
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const selectedId = params.get('place');
  const selected = world.places.find((p) => p.id === selectedId) ?? null;
  const mapRef = useRef<MapHandle>(null);
  const [pressed, setPressed] = useState<string | null>(null);
  const state = (location.state ?? {}) as NavState;

  const baseCam = desktop ? world.camera.desktop : world.camera.mobile;
  // initial camera: selected place (after refresh / coming back from the library) or the Figma camera
  const initial = useMemo<Cam>(() => {
    const hand = startCam?.(baseCam);
    if (hand) return hand.from;
    return selected ? selectedCam(world, selected, desktop) : baseCam;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const hand = startCam?.(baseCam);
    if (hand?.to) {
      const id = window.setTimeout(() => mapRef.current?.flyTo(hand.to!), 60);
      return () => window.clearTimeout(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep the camera on the selection when switching between mobile and desktop
  const firstLayout = useRef(true);
  useEffect(() => {
    if (firstLayout.current) {
      firstLayout.current = false;
      return;
    }
    mapRef.current?.flyTo(selected ? selectedCam(world, selected, desktop) : desktop ? world.camera.desktop : world.camera.mobile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desktop]);

  // follow the URL: back/forward or a pasted link moves the camera to the selected place
  const lastSel = useRef(selectedId);
  useEffect(() => {
    if (lastSel.current === selectedId) return;
    lastSel.current = selectedId;
    if (selected) mapRef.current?.flyTo(selectedCam(world, selected, desktop));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const select = useCallback(
    (p: Place) => {
      if (onDirectEnter && p.enterable && !p.stage && p.id === 'school') {
        setPressed(p.id);
        onDirectEnter(p, mapRef.current!);
        return;
      }
      setPressed(p.id);
      window.setTimeout(() => setPressed(null), 180);
      mapRef.current?.flyTo(selectedCam(world, p, desktop));
      if (selectedId === p.id) return;
      if (selectedId) navigate(`?place=${p.id}`, { replace: true, state });
      else navigate(`?place=${p.id}`, { state: { ...state, depth: (state.depth ?? 0) + 1 } });
    },
    [desktop, navigate, onDirectEnter, selectedId, state, world],
  );

  const close = useCallback(() => {
    if (!selectedId) return;
    if ((state.depth ?? 0) > 0) navigate(-1);
    else navigate(location.pathname, { replace: true, state });
  }, [location.pathname, navigate, selectedId, state]);

  const locate = () => mapRef.current?.flyTo(selected ? selectedCam(world, selected, desktop) : baseCam);

  const sheetStyle: React.CSSProperties = desktop ? { left: 16, right: 16, bottom: 16 } : { left: 8, right: 8, bottom: 'calc(110px + var(--safe-b))' };
  const ctrlBottom = desktop ? 20 : 100 + controlsLift;

  const mapUi = (
    <>
      {!desktop && <div className="map-glow" style={{ left: -36, width: 432, top: 120, height: 480 }} />}
      <MapView
        ref={mapRef}
        world={world}
        initial={initial}
        onBackgroundTap={close}
        overlay={(api) => (
          <>
            <MapFades top={topFade} bottom={desktop ? 180 : 220} desktop={desktop} />
            <AnimatePresence>
              {!selected && (
                <motion.div key="ctrls" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <ZoomControls api={api} onLocate={locate} style={{ left: 16, bottom: `calc(${ctrlBottom}px + ${desktop ? '0px' : 'var(--safe-b)'})` }} />
                  <div style={{ position: 'absolute', right: 16, bottom: `calc(${ctrlBottom}px + ${desktop ? '0px' : 'var(--safe-b)'})` }}>
                    <Minimap world={world} api={api} onLocateCenter={locate} />
                  </div>
                  {footer && (
                    <div style={{ position: 'absolute', left: 0, right: 0, display: 'flex', justifyContent: 'center', bottom: desktop ? 76 : 'calc(98px + var(--safe-b))', pointerEvents: 'none' }}>
                      <div style={{ pointerEvents: 'auto' }}>{footer}</div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            <div style={{ position: 'absolute', left: 16, right: 16, top: desktop ? (section === 'hood' ? 20 : 16) : section === 'hood' ? 72 : 64, zIndex: 5 }}>{header(desktop, locate)}</div>
            <PlaceSheet place={selected} onClose={close} onEnter={onEnter} onDetails={onDetails} style={sheetStyle} />
          </>
        )}
      >
        <Sprites world={world} selected={selectedId} pressed={pressed} onSelect={select} />
        <Tags world={world} selected={selectedId} pressed={pressed} onSelect={select} />
      </MapView>
    </>
  );

  return (
    <Page
      className="map-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0.12 : 0.3, ease: 'easeOut' }}
      data-testid={`screen-${world.id}`}
    >
      {desktop ? (
        <>
          <div className="map-glow" style={{ left: -144, width: 1728, top: 135, height: 540 }} />
          <TopNav section={section} active={nav} />
          <div className="desk-map-col">{mapUi}</div>
        </>
      ) : (
        <>
          {mapUi}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
            <TopBar />
          </div>
          <BottomNav section={section} active={nav} />
        </>
      )}
    </Page>
  );
}
