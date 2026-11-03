import { AnimatePresence, MotionConfig } from 'framer-motion';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { NeighborhoodPage, SchoolPage } from './pages/MapPages';
import { LibraryPage } from './pages/LibraryPage';
import { ComingSoon } from './pages/ComingSoon';
import { Toasts } from './components/ui/Toasts';

function AnimatedRoutes() {
  const location = useLocation();
  // key by pathname only: ?place=… changes must not remount the map
  return (
    <AnimatePresence initial={true}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<NeighborhoodPage />} />
        <Route path="/school" element={<SchoolPage />} />
        <Route path="/school/library" element={<LibraryPage />} />
        <Route path="/soon/:key" element={<ComingSoon />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <HashRouter>
        <AnimatedRoutes />
        <Toasts />
      </HashRouter>
    </MotionConfig>
  );
}
