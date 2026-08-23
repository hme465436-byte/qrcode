'use server';

/**
 * @fileOverview Advanced Server Actions for Hashtag Engine.
 * Implements a reach-based bucketing strategy and multi-node failover.
 */

export type TagBucket = 'broad' | 'niche' | 'ultra';

export interface TagResult {
  buckets: {
    broad: string[];
    niche: string[];
    ultra: string[];
  };
  readyMix: string[];
  node: string;
}

export async function fetchHashtagsAction(
  topic: string, 
  caption: string, 
  platform: string, 
  style: string, 
  count: number, 
  serverNode: string,
  includeEmojis: boolean
): Promise<TagResult> {
  // 1. Keyword Extraction from Caption
  let searchTerms = [topic.trim()];
  if (caption.trim()) {
    const extracted = caption
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 4)
      .slice(0, 3);
    searchTerms = [...new Set([...searchTerms, ...extracted])].filter(Boolean);
  }

  const primaryTopic = searchTerms[0] || 'trending';
  const cleanTopic = primaryTopic.toLowerCase().replace(/[^a-z0-9]/g, '');

  const protocolStack = [
    { id: 'rapid-ig', name: 'RapidAPI Instagram' },
    { id: 'datamuse-ml', name: 'Datamuse Meaning' },
    { id: 'datamuse-rel', name: 'Datamuse Relation' },
    { id: 'dictionary', name: 'Dictionary Registry' },
    { id: 'local-a', name: 'Studio Logic A' },
    { id: 'local-b', name: 'Studio Logic B' },
  ];

  let rawResults: string[] = [];
  let activeNodeName = 'Fallback';

  // 2. Multi-Node Execution Loop
  for (const node of protocolStack) {
    if (serverNode !== 'auto' && serverNode !== node.id) continue;

    try {
      let result: string[] = [];

      switch (node.id) {
        case 'rapid-ig':
          const apiKey = process.env.RAPIDAPI_KEY;
          if (!apiKey) break;
          const resIg = await fetch(`https://instagram-hashtags.p.rapidapi.com/hashtags?keyword=${encodeURIComponent(cleanTopic)}`, {
            headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': 'instagram-hashtags.p.rapidapi.com' },
            cache: 'no-store'
          });
          if (resIg.ok) {
            const data = await resIg.json();
            result = data.hashtags || [];
          }
          break;

        case 'datamuse-ml':
          const resDm = await fetch(`https://api.datamuse.com/words?ml=${encodeURIComponent(cleanTopic)}&max=60`);
          if (resDm.ok) {
            const data = await resDm.json();
            result = data.map((w: any) => w.word);
          }
          break;

        case 'datamuse-rel':
          const resRel = await fetch(`https://api.datamuse.com/words?rel_trg=${encodeURIComponent(cleanTopic)}&max=60`);
          if (resRel.ok) {
            const data = await resRel.json();
            result = data.map((w: any) => w.word);
          }
          break;

        case 'dictionary':
          const resDict = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanTopic)}`);
          if (resDict.ok) {
            const data = await resDict.json();
            const synonyms = data[0]?.meanings?.flatMap((m: any) => m.synonyms || []) || [];
            result = synonyms;
          }
          break;

        case 'local-a':
          result = generateLocalA(cleanTopic, style);
          break;

        case 'local-b':
          result = generateLocalB(cleanTopic);
          break;
      }

      if (result.length > 5) {
        rawResults = result;
        activeNodeName = node.name;
        break;
      }
    } catch (e) {
      console.warn(`Node ${node.name} restricted.`);
    }
  }

  // 3. Fallback Generation
  if (rawResults.length < 5) {
    rawResults = generateLocalA(cleanTopic, style);
    activeNodeName = 'Internal Synthesis';
  }

  // 4. Strategic Bucketing
  const buckets = createBuckets(rawResults, primaryTopic, platform);
  
  // 5. Ready Mix Synthesis
  const readyMix = createReadyMix(buckets, platform, includeEmojis);

  return {
    buckets,
    readyMix,
    node: activeNodeName
  };
}

function createBuckets(raw: string[], topic: string, platform: string) {
  const sanitize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const unique = Array.from(new Set(raw.map(sanitize))).filter(s => s.length > 2);
  
  // Professional filters
  const banned = ['follow4follow', 'like4like', 'f4f', 'l4l', 'sub4sub'];
  const clean = unique.filter(t => !banned.includes(t));

  const broad = clean.slice(0, 10).map(t => `#${t}`);
  const niche = clean.slice(10, 25).map(t => `#${t}`);
  const ultra = clean.slice(25, 45).map(t => `#${t}`);

  // Ensure buckets are never empty
  if (broad.length === 0) broad.push(`#${sanitize(topic)}`, '#trending', '#viral');
  if (niche.length === 0) niche.push(`#${sanitize(topic)}life`, `#${sanitize(topic)}world`);
  if (ultra.length === 0) ultra.push(`#${sanitize(topic)}master`, `#${sanitize(topic)}studio`);

  return { broad, niche, ultra };
}

function createReadyMix(buckets: any, platform: string, includeEmojis: boolean) {
  let mix: string[] = [];
  const emojis = ['✨', '🔥', '🚀', '📍', '💎', '💡', '✅'];
  const pickEmoji = () => includeEmojis ? emojis[Math.floor(Math.random() * emojis.length)] : '';

  switch (platform) {
    case 'Instagram':
      mix = [...buckets.broad.slice(0, 10), ...buckets.niche.slice(0, 10), ...buckets.ultra.slice(0, 10)];
      break;
    case 'TikTok':
      mix = [...buckets.broad.slice(0, 2), ...buckets.niche.slice(0, 5), ...buckets.ultra.slice(0, 3)];
      break;
    case 'YouTube':
      mix = [...buckets.broad.slice(0, 5), ...buckets.niche.slice(0, 10)];
      break;
    case 'LinkedIn':
      mix = [...buckets.niche.slice(0, 5)];
      break;
    default:
      mix = [...buckets.broad.slice(0, 5), ...buckets.niche.slice(0, 10)];
  }

  if (includeEmojis) {
    return mix.map(tag => `${tag} ${pickEmoji()}`);
  }
  return mix;
}

function generateLocalA(topic: string, style: string) {
  const suffixes = ['life', 'world', 'goals', 'daily', 'vibes', 'tips', 'guide', 'studio', 'pro', 'hub', 'nation', 'community', 'central'];
  const common = ['trending', 'viral', 'niche', 'growth', 'explore', 'foryou', 'fyp', 'content', 'marketing'];
  const results = [topic];
  suffixes.forEach(s => results.push(`${topic}${s}`));
  common.forEach(c => results.push(c));
  if (style === 'aesthetic') results.push('soft', 'pure', 'minimal', 'cloud', 'serene', 'ethereal');
  return results;
}

function generateLocalB(topic: string) {
  return [topic, `${topic}101`, `the${topic}`, `best${topic}`, 'marketing', 'social', 'community', 'tips', 'strategy'];
}
