
'use server';

/**
 * @fileOverview Server actions for Hashtag Engine.
 * Implements an 8-node recursive failover protocol for high-fidelity discovery.
 */

interface TagResult {
  tags: string[];
  node: string;
}

export async function fetchHashtagsAction(topic: string, platform: string, style: string, count: number, serverNode: string): Promise<TagResult> {
  const cleanTopic = topic.trim().toLowerCase();
  if (!cleanTopic) return { tags: [], node: 'Standby' };

  // 1. Define Protocol Stack
  const protocolStack = [
    { id: 'rapid-ig', name: 'RapidAPI Instagram' },
    { id: 'datamuse-ml', name: 'Datamuse Meaning' },
    { id: 'datamuse-rel', name: 'Datamuse Relation' },
    { id: 'dictionary', name: 'Dictionary Registry' },
    { id: 'local-a', name: 'Studio Logic A' },
    { id: 'local-b', name: 'Studio Logic B' },
  ];

  // 2. Execution Loop
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
          const resDm = await fetch(`https://api.datamuse.com/words?ml=${encodeURIComponent(cleanTopic)}&max=50`);
          if (resDm.ok) {
            const data = await resDm.json();
            result = data.map((w: any) => w.word);
          }
          break;

        case 'datamuse-rel':
          const resRel = await fetch(`https://api.datamuse.com/words?rel_trg=${encodeURIComponent(cleanTopic)}&max=50`);
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

      if (result.length > 0) {
        return { 
          tags: processTags(result, platform, count), 
          node: node.name 
        };
      }
    } catch (e) {
      console.warn(`Node ${node.name} restricted. Failover active.`);
    }
  }

  // Final Hard Fallback
  return { tags: processTags(generateLocalB(cleanTopic), platform, count), node: 'Studio Logic B' };
}

/**
 * Sanitizes and formats tags based on platform specific protocols.
 */
function processTags(raw: string[], platform: string, limit: number): string[] {
  let processed = raw
    .map(t => t.toLowerCase().replace(/[^a-z0-9]/g, ''))
    .filter(t => t.length > 1);

  // Platform specific limits
  let finalLimit = limit;
  if (platform === 'TikTok') finalLimit = 10;
  if (platform === 'LinkedIn') finalLimit = 8;
  if (platform === 'YouTube') finalLimit = 15;

  const unique = Array.from(new Set(processed));
  return unique.slice(0, finalLimit).map(t => `#${t}`);
}

function generateLocalA(topic: string, style: string) {
  const suffixes = ['life', 'world', 'goals', 'daily', 'vibes', 'tips', 'guide', 'studio', 'pro', 'hub', 'nation'];
  const common = ['trending', 'viral', 'niche', 'growth', 'explore', 'foryou'];
  
  const results = [topic];
  suffixes.forEach(s => results.push(`${topic}${s}`));
  common.forEach(c => results.push(c));
  
  if (style === 'aesthetic') results.push('soft', 'pure', 'minimal', 'cloud');
  return results;
}

function generateLocalB(topic: string) {
  return [topic, `${topic}101`, `the${topic}`, `best${topic}`, 'marketing', 'social', 'community'];
}
