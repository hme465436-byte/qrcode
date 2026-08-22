'use server';

/**
 * @fileOverview Advanced Server Actions for Username OSINT.
 * Handles high-fidelity multi-node discovery across global registries.
 */

export type PlatformStatus = 'taken' | 'available' | 'unknown' | 'checking';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface PlatformResult {
  platform: string;
  status: PlatformStatus;
  url: string;
  category: 'social' | 'gaming' | 'dev' | 'media' | 'finance' | 'other';
  confidence: ConfidenceLevel;
  displayName?: string;
  avatar?: string;
  reason?: string;
}

// Internal registry configuration
const REGISTRY = [
  { name: 'GitHub', cat: 'dev', url: 'https://github.com/{u}', api: 'https://api.github.com/users/{u}', type: 'json' },
  { name: 'GitLab', cat: 'dev', url: 'https://gitlab.com/{u}', api: 'https://gitlab.com/api/v4/users?username={u}', type: 'json' },
  { name: 'Reddit', cat: 'social', url: 'https://www.reddit.com/user/{u}', api: 'https://www.reddit.com/user/{u}/about.json', type: 'json' },
  { name: 'YouTube', cat: 'media', url: 'https://www.youtube.com/@{u}', api: 'https://www.youtube.com/oembed?url=https://www.youtube.com/@{u}&format=json', type: 'status' },
  { name: 'Twitter / X', cat: 'social', url: 'https://twitter.com/{u}', api: 'https://publish.twitter.com/oembed?url=https://twitter.com/{u}', type: 'status' },
  { name: 'TikTok', cat: 'social', url: 'https://www.tiktok.com/@{u}', api: 'https://www.tiktok.com/@{u}', type: 'status' },
  { name: 'Instagram', cat: 'social', url: 'https://www.instagram.com/{u}/', api: 'https://www.instagram.com/{u}/', type: 'status' },
  { name: 'Facebook', cat: 'social', url: 'https://www.facebook.com/{u}', api: 'https://www.facebook.com/{u}', type: 'status' },
  { name: 'Threads', cat: 'social', url: 'https://www.threads.net/@{u}', api: 'https://www.threads.net/@{u}', type: 'status' },
  { name: 'Bluesky', cat: 'social', url: 'https://bsky.app/profile/{u}.bsky.social', api: 'https://bsky.app/profile/{u}.bsky.social', type: 'status' },
  { name: 'LinkedIn', cat: 'social', url: 'https://www.linkedin.com/in/{u}', api: 'https://www.linkedin.com/in/{u}', type: 'status' },
  { name: 'Telegram', cat: 'social', url: 'https://t.me/{u}', api: 'https://t.me/{u}', type: 'status' },
  { name: 'Twitch', cat: 'gaming', url: 'https://www.twitch.tv/{u}', api: 'https://www.twitch.tv/{u}', type: 'status' },
  { name: 'Steam', cat: 'gaming', url: 'https://steamcommunity.com/id/{u}', api: 'https://steamcommunity.com/id/{u}', type: 'status' },
  { name: 'Roblox', cat: 'gaming', url: 'https://www.roblox.com/user.aspx?username={u}', api: 'https://www.roblox.com/user.aspx?username={u}', type: 'status' },
  { name: 'Snapchat', cat: 'social', url: 'https://www.snapchat.com/add/{u}', api: 'https://www.snapchat.com/add/{u}', type: 'status' },
  { name: 'Pinterest', cat: 'media', url: 'https://www.pinterest.com/{u}/', api: 'https://www.pinterest.com/{u}/', type: 'status' },
  { name: 'Spotify', cat: 'media', url: 'https://open.spotify.com/user/{u}', api: 'https://open.spotify.com/user/{u}', type: 'status' },
  { name: 'SoundCloud', cat: 'media', url: 'https://soundcloud.com/{u}', api: 'https://soundcloud.com/{u}', type: 'status' },
  { name: 'DeviantArt', cat: 'media', url: 'https://{u}.deviantart.com', api: 'https://{u}.deviantart.com', type: 'status' },
  { name: 'Behance', cat: 'media', url: 'https://www.behance.net/{u}', api: 'https://www.behance.net/{u}', type: 'status' },
  { name: 'Dribbble', cat: 'media', url: 'https://dribbble.com/{u}', api: 'https://dribbble.com/{u}', type: 'status' },
  { name: 'Flickr', cat: 'media', url: 'https://www.flickr.com/people/{u}', api: 'https://www.flickr.com/people/{u}', type: 'status' },
  { name: 'Medium', cat: 'media', url: 'https://medium.com/@{u}', api: 'https://medium.com/@{u}', type: 'status' },
  { name: 'Dev.to', cat: 'dev', url: 'https://dev.to/{u}', api: 'https://dev.to/{u}', type: 'status' },
  { name: 'HackerNews', cat: 'dev', url: 'https://news.ycombinator.com/user?id={u}', api: 'https://hacker-news.firebaseio.com/v0/user/{u}.json', type: 'json' },
  { name: 'ProductHunt', cat: 'dev', url: 'https://www.producthunt.com/@{u}', api: 'https://www.producthunt.com/@{u}', type: 'status' },
  { name: 'Keybase', cat: 'dev', url: 'https://keybase.io/{u}', api: 'https://keybase.io/{u}', type: 'status' },
  { name: 'Linktree', cat: 'social', url: 'https://linktr.ee/{u}', api: 'https://linktr.ee/{u}', type: 'status' },
  { name: 'PayPal.me', cat: 'finance', url: 'https://www.paypal.me/{u}', api: 'https://www.paypal.me/{u}', type: 'status' },
  { name: 'CashApp', cat: 'finance', url: 'https://cash.app/${u}', api: 'https://cash.app/${u}', type: 'status' },
  { name: 'Chess.com', cat: 'gaming', url: 'https://www.chess.com/member/{u}', api: 'https://api.chess.com/pub/player/{u}', type: 'json' },
  { name: 'Lichess', cat: 'gaming', url: 'https://lichess.org/@/{u}', api: 'https://lichess.org/api/user/{u}', type: 'json' },
  { name: 'Minecraft', cat: 'gaming', url: 'https://namemc.com/profile/{u}', api: 'https://api.ashcon.app/mojang/v2/user/{u}', type: 'json' },
  { name: 'Scratch', cat: 'dev', url: 'https://scratch.mit.edu/users/{u}', api: 'https://api.scratch.mit.edu/users/{u}', type: 'json' },
  { name: 'VK', cat: 'social', url: 'https://vk.com/{u}', api: 'https://vk.com/{u}', type: 'status' },
  { name: 'About.me', cat: 'social', url: 'https://about.me/{u}', api: 'https://about.me/{u}', type: 'status' },
] as const;

export async function checkSinglePlatform(username: string, platformName: string): Promise<PlatformResult> {
  const config = REGISTRY.find(r => r.name === platformName);
  if (!config) throw new Error("Platform identifier mismatch.");

  const url = config.url.replace('{u}', username);
  const api = config.api.replace('{u}', username);
  
  const result: PlatformResult = {
    platform: config.name,
    category: config.cat as any,
    status: 'unknown',
    url: url,
    confidence: 'low'
  };

  try {
    const res = await fetch(api, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/html'
      },
      next: { revalidate: 3600 }
    });

    // Node blocking detection
    if (res.status === 403 || res.status === 429) {
      result.status = 'unknown';
      result.confidence = 'low';
      result.reason = "Security Protocol: Node blocked automated discovery. Manual verification required.";
      return result;
    }

    if (config.type === 'json') {
      if (res.status === 200) {
        const data = await res.json();
        // Handle variations in JSON responses (arrays vs objects)
        const isFound = Array.isArray(data) ? data.length > 0 : (data && !data.error);
        if (isFound) {
          result.status = 'taken';
          result.confidence = 'high';
          // Extract metadata if available
          result.displayName = data.name || data.username || data.login || data.display_name;
          result.avatar = data.avatar_url || data.profile_image_url || (data.sprites ? data.sprites.front_default : undefined);
        } else {
          result.status = 'available';
          result.confidence = 'high';
        }
      } else if (res.status === 404) {
        result.status = 'available';
        result.confidence = 'high';
      }
    } else {
      // Status Code Logic
      if (res.status === 200) {
        result.status = 'taken';
        result.confidence = 'medium';
      } else if (res.status === 404) {
        result.status = 'available';
        result.confidence = 'high';
      }
    }
  } catch (e) {
    result.status = 'unknown';
    result.confidence = 'low';
    result.reason = "Handshake Error: Link connection timed out.";
  }

  return result;
}

export async function getPlatformList() {
  return REGISTRY.map(r => r.name);
}
