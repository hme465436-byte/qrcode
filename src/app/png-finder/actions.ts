'use server';

/**
 * @fileOverview Advanced Server Actions for PNG Finder Studio.
 * Handles high-fidelity discovery, filtering, and pagination across global registries.
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
  width?: number;
  height?: number;
}

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36';

async function fetchOpenverse(query: string, options: any): Promise<{ success: boolean; results: PngResult[] }> {
  try {
    const { page = 1, color, size } = options;
    const url = new URL('https://api.openverse.org/v1/images/');
    url.searchParams.append('q', query);
    url.searchParams.append('extension', 'png');
    url.searchParams.append('page', String(page));
    url.searchParams.append('page_size', '30');
    if (color && color !== 'all') url.searchParams.append('color', color);
    if (size && size !== 'all') url.searchParams.append('size', size);

    const response = await fetch(url.toString(), {
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
      author: img.creator,
      width: img.width,
      height: img.height
    }));

    return { success: true, results };
  } catch (e) {
    return { success: false, results: [] };
  }
}

async function fetchWikimedia(query: string, options: any): Promise<{ success: boolean; results: PngResult[] }> {
  try {
    const { page = 1 } = options;
    const limit = 30;
    const offset = (page - 1) * limit;
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}+filetype:png&gsrnamespace=6&gsrlimit=${limit}&gsroffset=${offset}&prop=imageinfo&iiprop=url|size|mime|extmetadata&format=json&origin=*`;
    
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
        author: metadata.Artist?.value || 'Wikimedia Contributor',
        width: info.width,
        height: info.height
      };
    }).filter(r => r.url && r.url.toLowerCase().endsWith('.png'));

    return { success: true, results };
  } catch (e) {
    return { success: false, results: [] };
  }
}

async function fetchIconify(query: string): Promise<{ success: boolean; results: PngResult[] }> {
  try {
    const url = `https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=50`;
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
        isIcon: true,
        width: 512,
        height: 512
      };
    });

    return { success: true, results };
  } catch (e) {
    return { success: false, results: [] };
  }
}

export async function getSuggestionsAction(query: string) {
  if (!query || query.length < 3) return [];
  try {
    const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&page_size=5`;
    const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!response.ok) return [];
    const data = await response.json();
    return (data.results || []).map((img: any) => img.title).filter(Boolean).slice(0, 5);
  } catch (e) {
    return [];
  }
}

export async function searchPngAction(query: string, provider: string, options: any = {}): Promise<{ success: boolean; results: PngResult[]; activeNode?: string; error?: string }> {
  if (!query.trim()) return { success: false, results: [] };

  if (provider === 'auto') {
    // For auto, we try to blend or fallback
    const ov = await fetchOpenverse(query, options);
    if (ov.success && ov.results.length > 0) return { ...ov, activeNode: 'Openverse PNG' };

    const wm = await fetchWikimedia(query, options);
    if (wm.success && wm.results.length > 0) return { ...wm, activeNode: 'Wikimedia Commons' };

    const ic = await fetchIconify(query);
    if (ic.success && ic.results.length > 0) return { ...ic, activeNode: 'Iconify Engine' };
    
    return { success: false, results: [], error: 'Zero Signal: No results found.' };
  }

  if (provider === 'openverse') return { ...(await fetchOpenverse(query, options)), activeNode: 'Openverse PNG' };
  if (provider === 'wikimedia') return { ...(await fetchWikimedia(query, options)), activeNode: 'Wikimedia Commons' };
  if (provider === 'iconify') return { ...(await fetchIconify(query)), activeNode: 'Iconify Engine' };

  return { success: false, results: [], error: 'Protocol Mismatch' };
}
