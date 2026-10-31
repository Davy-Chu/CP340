import { useEffect } from 'react';

interface SeoOptions {
  title: string;
  description: string;
  noindex?: boolean;
}

export function useSeo({ title, description, noindex = false }: SeoOptions) {
  useEffect(() => {
    document.title = title;
    let meta = document.head.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = description;
  }, [title, description]);

  useEffect(() => {
    if (!noindex) return;
    const existing = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const previousContent = existing?.getAttribute('content') ?? null;
    const meta = existing ?? document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    if (!existing) document.head.appendChild(meta);

    return () => {
      if (!existing) meta.remove();
      else if (previousContent === null) meta.removeAttribute('content');
      else meta.content = previousContent;
    };
  }, [noindex]);
}
