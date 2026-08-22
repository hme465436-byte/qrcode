'use server';

/**
 * @fileOverview Server actions for Icon Studio discovery.
 * Handles high-fidelity multi-node searching across global registries.
 */

export interface IconResult {
  id: string;
  name: string;
  prefix: string;
  source: string;
}

export async function searchIconsAction(query: string, provider: string): Promise<{ success: boolean; icons: IconResult[]; activeNode: string; error?: string }> {
  if (!query.trim()) return { success: false, icons: [], activeNode: 'Standby' };

  const prefixes: Record<string, string> = {
    'auto': '',
    'iconify': '',
    'simple-icons': 'simple-icons',
    'openmoji': 'openmoji',
    'material': 'material-symbols,mdi'
  };

  const selectedPrefix = prefixes[provider] || '';
  const searchUrl = new URL('https://api.iconify.design/search');
  searchUrl.searchParams.append('query', query);
  searchUrl.searchParams.append('limit', '48');
  if (selectedPrefix) searchUrl.searchParams.append('prefixes', selectedPrefix);

  try {
    const response = await fetch(searchUrl.toString(), {
      next: { revalidate: 3600 }
    });

    if (!response.ok) throw new Error("Registry node restricted.");

    const data = await response.json();
    const icons: IconResult[] = (data.icons || []).map((iconKey: string) => {
      const [prefix, name] = iconKey.split(':');
      return {
        id: iconKey,
        name: name,
        prefix: prefix,
        source: prefix.replace(/-/g, ' ').toUpperCase()
      };
    });

    return { 
      success: true, 
      icons, 
      activeNode: provider === 'auto' ? 'Iconify Global' : provider.toUpperCase() 
    };
  } catch (error: any) {
    console.error('Icon Discovery Error:', error);
    return { success: false, icons: [], activeNode: 'Fallback', error: error.message };
  }
}
