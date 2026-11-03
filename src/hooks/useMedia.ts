import { useEffect, useState } from 'react';

const query = '(min-width: 768px)';

/** true above 768px – desktop layout (tabs in the header, 560px centre column). */
export function useIsDesktop() {
  const [is, setIs] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setIs(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return is;
}
