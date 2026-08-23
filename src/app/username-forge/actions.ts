'use server';

/**
 * @fileOverview Server actions for Username Forge discovery.
 * Handles high-fidelity availability checks across global registries.
 */

export type AvailabilityStatus = 'taken' | 'available' | 'unknown' | 'checking';

export interface ForgeResult {
  platform: string;
  status: AvailabilityStatus;
  url: string;
  reason?: string;
}

const REGISTRY = [
  { id: 'instagram', name: 'Instagram', url: 'https://www.instagram.com/{u}/', api: 'https://www.instagram.com/{u}/' },
  { id: 'tiktok', name: 'TikTok', url: 'https://www.tiktok.com/@{u}', api: 'https://www.tiktok.com/@{u}' },
  { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com/@{u}', api: 'https://www.youtube.com/oembed?url=https://www.youtube.com/@{u}&format=json' },
  { id: 'twitter', name: 'Twitter / X', url: 'https://twitter.com/{u}', api: 'https://publish.twitter.com/oembed?url=https://twitter.com/{u}' },
  { id: 'facebook', name: 'Facebook', url: 'https://www.facebook.com/{u}', api: 'https://www.facebook.com/{u}' },
  { id: 'github', name: 'GitHub', url: 'https://github.com/{u}', api: 'https://api.github.com/users/{u}' },
  { id: 'reddit', name: 'Reddit', url: 'https://www.reddit.com/user/{u}', api: 'https://www.reddit.com/user/{u}/about.json' },
  { id: 'twitch', name: 'Twitch', url: 'https://www.twitch.tv/{u}', api: 'https://www.twitch.tv/{u}' },
  { id: 'pinterest', name: 'Pinterest', url: 'https://www.pinterest.com/{u}/', api: 'https://www.pinterest.com/{u}/' },
  { id: 'linkedin', name: 'LinkedIn', url: 'https://www.linkedin.com/in/{u}', api: 'https://www.linkedin.com/in/{u}' },
];

export async function checkUsernameAction(username: string, platformId: string): Promise<ForgeResult> {
  const config = REGISTRY.find(r => r.id === platformId);
  if (!config) throw new Error("Node Identifier Mismatch");

  const url = config.url.replace('{u}', username);
  const api = config.api.replace('{u}', username);

  const result: ForgeResult = {
    platform: config.name,
    status: 'unknown',
    url: url
  };

  try {
    const res = await fetch(api, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
      },
      next: { revalidate: 3600 }
    });

    if (res.status === 200) {
      result.status = 'taken';
    } else if (res.status === 404) {
      result.status = 'available';
    } else if (res.status === 403 || res.status === 429) {
      result.status = 'unknown';
      result.reason = "Node restricted automated probe.";
    }
  } catch (e) {
    result.status = 'unknown';
    result.reason = "Uplink handshake failed.";
  }

  return result;
}
