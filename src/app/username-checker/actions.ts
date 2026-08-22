'use server';

/**
 * @fileOverview Server actions for Username OSINT Checker.
 * Handles high-fidelity discovery across global social registries to bypass CORS.
 */

type PlatformResult = {
  platform: string;
  status: 'taken' | 'available' | 'unknown';
  url: string;
};

async function fetchStatus(url: string) {
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
      },
      next: { revalidate: 3600 }
    });
    return res.status;
  } catch (e) {
    return 500;
  }
}

export async function checkUsernameAction(username: string): Promise<PlatformResult[]> {
  if (!username || username.length < 2) return [];

  const platforms = [
    { name: 'GitHub', url: `https://github.com/${username}`, api: `https://api.github.com/users/${username}`, type: 'status' },
    { name: 'GitLab', url: `https://gitlab.com/${username}`, api: `https://gitlab.com/api/v4/users?username=${username}`, type: 'json-array' },
    { name: 'Reddit', url: `https://www.reddit.com/user/${username}`, api: `https://www.reddit.com/user/${username}/about.json`, type: 'status' },
    { name: 'YouTube', url: `https://www.youtube.com/@${username}`, api: `https://www.youtube.com/oembed?url=https://www.youtube.com/@${username}&format=json`, type: 'status' },
    { name: 'Twitter / X', url: `https://twitter.com/${username}`, api: `https://publish.twitter.com/oembed?url=https://twitter.com/${username}`, type: 'status' },
    { name: 'TikTok', url: `https://www.tiktok.com/@${username}`, api: `https://www.tiktok.com/@${username}`, type: 'status' },
    { name: 'Instagram', url: `https://www.instagram.com/${username}/`, api: `https://www.instagram.com/${username}/`, type: 'status' },
    { name: 'Telegram', url: `https://t.me/${username}`, api: `https://t.me/${username}`, type: 'status' },
    { name: 'Twitch', url: `https://www.twitch.tv/${username}`, api: `https://www.twitch.tv/${username}`, type: 'status' },
    { name: 'Steam', url: `https://steamcommunity.com/id/${username}`, api: `https://steamcommunity.com/id/${username}`, type: 'status' },
    { name: 'Minecraft', url: `https://api.ashcon.app/mojang/v2/user/${username}`, api: `https://api.ashcon.app/mojang/v2/user/${username}`, type: 'status' },
    { name: 'Chess.com', url: `https://www.chess.com/member/${username}`, api: `https://api.chess.com/pub/player/${username}`, type: 'status' },
    { name: 'Lichess', url: `https://lichess.org/@/${username}`, api: `https://lichess.org/api/user/${username}`, type: 'status' },
    { name: 'Scratch', url: `https://scratch.mit.edu/users/${username}`, api: `https://api.scratch.mit.edu/users/${username}`, type: 'status' },
    { name: 'Medium', url: `https://medium.com/@${username}`, api: `https://medium.com/@${username}`, type: 'status' },
    { name: 'Dev.to', url: `https://dev.to/${username}`, api: `https://dev.to/${username}`, type: 'status' },
    { name: 'Pinterest', url: `https://www.pinterest.com/${username}/`, api: `https://www.pinterest.com/${username}/`, type: 'status' },
    { name: 'Snapchat', url: `https://www.snapchat.com/add/${username}`, api: `https://www.snapchat.com/add/${username}`, type: 'status' },
    { name: 'Roblox', url: `https://www.roblox.com/user.aspx?username=${username}`, api: `https://www.roblox.com/user.aspx?username=${username}`, type: 'status' },
  ];

  const results = await Promise.all(platforms.map(async (p) => {
    let status: 'taken' | 'available' | 'unknown' = 'unknown';

    if (p.type === 'status') {
      const code = await fetchStatus(p.api);
      if (code === 200) status = 'taken';
      else if (code === 404) status = 'available';
      else status = 'unknown';
    } else if (p.type === 'json-array') {
      try {
        const res = await fetch(p.api);
        const data = await res.json();
        status = Array.isArray(data) && data.length > 0 ? 'taken' : 'available';
      } catch (e) {
        status = 'unknown';
      }
    }

    return {
      platform: p.name,
      status,
      url: p.url
    };
  }));

  return results;
}
