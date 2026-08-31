import { useState, useEffect } from 'react';
import { SiteContent, DEFAULT_CONTENT } from '@/lib/content';
import { loadAllContent } from '@/lib/api';

export function useSiteContent() {
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await loadAllContent();
        if (cancelled || data.length === 0) {
          setLoaded(true);
          return;
        }
        const merged: SiteContent = { ...DEFAULT_CONTENT };
        for (const row of data) {
          const key = row.key as keyof SiteContent;
          if (key in merged) {
            merged[key] = { ...merged[key], ...row.value } as never;
          }
        }
        if (!cancelled) {
          setContent(merged);
          setLoaded(true);
        }
      } catch {
        setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { content, loaded };
}
