'use server';

/**
 * @fileOverview Server actions for PNG Finder Studio.
 * Handles high-fidelity discovery across global open-source registries.
 */

export interface PngResult {
  id: string;
  title: string;
  url: string;
  previewUrl: string;
  source: string;
  license?: string;
  author?: string;
  isIcon?: boolean;
}

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36';

async function fetchOpenverse(query: string): Promise<{ success: boolean; results: PngResult[] }> {
  try {
    const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&extension=png&page_size=24`;
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      next: { revalidate: 3600 }
    });

    if (!response.ok) return { success: false, results: [] };
    const data = await response.json();

    const results = (data.results || []).map((img: any) => ({
      id: `ov-${img.id}`,
      title: img.title || 'Untitled PNG',
      url: img.url,
      previewUrl: img.thumbnail || img.url,
      source: 'Openverse',
      license: img.license,
      author: img.creator
    }));

    return { success: true, results };
  } catch (e) {
    return { success: false, results: [] };
  }
}

async function fetchWikimedia(query: string): Promise<{ success: boolean; results: PngResult[] }> {
  try {
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}+filetype:png&gsrnamespace=6&gsrlimit=24&prop=imageinfo&iiprop=url|size|mime|extmetadata&format=json&origin=*`;
    const response = await fetch(searchUrl, {
      headers: { 'User-Agent': USER_AGENT },
      next: { revalidate: 3600 }
    });

    if (!response.ok) return { success: false, results: [] };
    const data = await response.json();

    if (!data.query || !data.query.pages) return { success: false, results: [] };

    const results = Object.values(data.query.pages).map((page: any) => {
      const info = page.imageinfo?.[0] || {};
      const metadata = info.extmetadata || {};
      return {
        id: `wm-${page.pageid}`,
        title: page.title.replace('File:', '').replace('.png', ''),
        url: info.url,
        previewUrl: info.url,
        source: 'Wikimedia Commons',
        license: metadata.UsageTerms?.value || 'Public Domain',
        author: metadata.Artist?.value || 'Wikimedia Contributor'
      };
    }).filter(r => r.url && r.url.toLowerCase().endsWith('.png'));

    return { success: true, results };
  } catch (e) {
    return { success: false, results: [] };
  }
}

async function fetchIconify(query: string): Promise<{ success: boolean; results: PngResult[] }> {
  try {
    const url = `https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=32`;
    const response = await fetch(url, { next: { revalidate: 3600 } });

    if (!response.ok) return { success: false, results: [] };
    const data = await response.json();

    const results = (data.icons || []).map((iconKey: string) => {
      const [prefix, name] = iconKey.split(':');
      const iconUrl = `https://api.iconify.design/${prefix}/${name}.svg`;
      return {
        id: `ic-${iconKey}`,
        title: `${name} (${prefix})`,
        url: iconUrl,
        previewUrl: iconUrl,
        source: 'Iconify',
        license: 'Open Source',
        isIcon: true
      };
    });

    return { success: true, results };
  } catch (e) {
    return { success: false, results: [] };
  }
}

export async function searchPngAction(query: string, provider: string): Promise<{ success: boolean; results: PngResult[]; activeNode?: string; error?: string }> {
  if (!query.trim()) return { success: false, results: [] };

  if (provider === 'auto') {
    // Phase 1: Openverse
    const ov = await fetchOpenverse(query);
    if (ov.success && ov.results.length > 0) return { ...ov, activeNode: 'Openverse PNG' };

    // Phase 2: Wikimedia
    const wm = await fetchWikimedia(query);
    if (wm.success && wm.results.length > 0) return { ...wm, activeNode: 'Wikimedia Commons' };

    // Phase 3: Iconify
    const ic = await fetchIconify(query);
    if (ic.success && ic.results.length > 0) return { ...ic, activeNode: 'Iconify Engine' };
    
    return { success: false, results: [], error: 'Zero Signal: No results found across all nodes.' };
  }

  if (provider === 'openverse') return { ...(await fetchOpenverse(query)), activeNode: 'Openverse PNG' };
  if (provider === 'wikimedia') return { ...(await fetchWikimedia(query)), activeNode: 'Wikimedia Commons' };
  if (provider === 'iconify') return { ...(await fetchIconify(query)), activeNode: 'Iconify Engine' };

  return { success: false, results: [], error: 'Protocol Identifier Mismatch' };
}
