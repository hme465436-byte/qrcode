'use server';

/**
 * @fileOverview Server actions for Link Safety Checker.
 * Handles recursive redirect following and multi-node safety lookups.
 */

interface RedirectHop {
  url: string;
  status: number;
}

/**
 * Protocol 1: Direct Recursive Follower
 * Cap: 8 Hops, Timeout: 8s
 */
async function followRedirects(url: string): Promise<{ success: boolean; chain: RedirectHop[]; finalUrl: string; error?: string }> {
  let currentUrl = url;
  const chain: RedirectHop[] = [];
  const maxHops = 8;
  const visited = new Set<string>();

  try {
    for (let i = 0; i < maxHops; i++) {
      if (visited.has(currentUrl)) throw new Error("Circular redirection matrix detected.");
      visited.add(currentUrl);

      const controller = new AbortTimeout(8000);
      const res = await fetch(currentUrl, {
        method: 'HEAD',
        redirect: 'manual',
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      }).catch(async () => {
        // Fallback to GET if HEAD is restricted
        return await fetch(currentUrl, {
          method: 'GET',
          redirect: 'manual',
          signal: controller.signal,
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
      });

      chain.push({ url: currentUrl, status: res.status });

      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get('location');
        if (location) {
          currentUrl = new URL(location, currentUrl).href;
        } else {
          break;
        }
      } else {
        break;
      }
    }
    return { success: true, chain, finalUrl: currentUrl };
  } catch (err: any) {
    return { success: false, chain, finalUrl: currentUrl, error: err.message };
  }
}

class AbortTimeout {
  signal: AbortSignal;
  constructor(ms: number) {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), ms);
    this.signal = controller.signal;
  }
}

/**
 * Protocol 2: Unshorten.me Fallback
 */
async function expandViaRegistry(url: string) {
  try {
    const res = await fetch(`https://unshorten.me/json/${encodeURIComponent(url)}`, { cache: 'no-store' });
    const data = await res.json();
    if (data.success && data.resolved_url) {
      return { success: true, finalUrl: data.resolved_url };
    }
  } catch (e) {}
  return { success: false };
}

/**
 * Protocol 3: is.gd Fallback
 */
async function expandViaIsGd(url: string) {
  try {
    const res = await fetch(`https://is.gd/forward.php?format=json&shorturl=${encodeURIComponent(url)}`, { cache: 'no-store' });
    const data = await res.json();
    if (data.url) return { success: true, finalUrl: data.url };
  } catch (e) {}
  return { success: false };
}

export async function expandUrlAction(inputUrl: string) {
  let url = inputUrl.trim();
  if (!url.startsWith('http')) url = 'https://' + url;

  // 1. Direct Pass
  const direct = await followRedirects(url);
  if (direct.success && direct.chain.length > 1) return direct;

  // 2. Unshorten.me Pass
  const registry = await expandViaRegistry(url);
  if (registry.success) return { success: true, chain: [{ url, status: 200 }, { url: registry.finalUrl, status: 200 }], finalUrl: registry.finalUrl };

  // 3. Is.gd Pass
  const isgd = await expandViaIsGd(url);
  if (isgd.success) return { success: true, chain: [{ url, status: 200 }, { url: isgd.finalUrl, status: 200 }], finalUrl: isgd.finalUrl };

  // 4. Final attempt: direct return if not a shortener or all fail
  return direct;
}

/**
 * Safety Audit Matrix
 */
export async function checkSafetyAction(finalUrl: string) {
  const domain = new URL(finalUrl).hostname;
  const reasons: string[] = [];
  let score = 100;

  // 1. Local Heuristic Engine
  const lowUrl = finalUrl.toLowerCase();
  if (/(\d{1,3}\.){3}\d{1,3}/.test(domain)) {
    score -= 40;
    reasons.push("IP-Based Hosting: Bypassing standard DNS registration.");
  }
  if (lowUrl.includes('@')) {
    score -= 50;
    reasons.push("Userinfo Credential: Common credential-harvesting pattern.");
  }
  if (domain.includes('xn--')) {
    score -= 30;
    reasons.push("Punycode Node: Potential homograph/lookalike attack.");
  }
  if ((domain.match(/-/g) || []).length > 3) {
    score -= 10;
    reasons.push("Excessive Hyphens: Characteristic of phishing subdomains.");
  }
  
  const riskyKeywords = ['login', 'verify', 'wallet', 'seed', 'password', 'secure', 'account-update', 'unusual-activity'];
  if (riskyKeywords.some(k => lowUrl.includes(k))) {
    score -= 20;
    reasons.push("High-Risk Keyword: URL structure matches credential-harvesting patterns.");
  }

  const riskyTlds = ['.top', '.xyz', '.loan', '.bit', '.work', '.click', '.zip'];
  if (riskyTlds.some(tld => domain.endsWith(tld))) {
    score -= 5;
    reasons.push("Low-Trust TLD: High association with malicious activity.");
  }

  const brandMismatches = [
    { target: 'facebook', bad: ['faceb00k', 'facbook', 'fbook'] },
    { target: 'instagram', bad: ['instagrarn', 'instagran', 'insta-gram'] },
    { target: 'google', bad: ['gooogle', 'g00gle'] },
    { target: 'microsoft', bad: ['mircosoft', 'micro-soft'] }
  ];
  brandMismatches.forEach(b => {
    if (b.bad.some(bad => domain.includes(bad)) && !domain.includes(b.target)) {
      score -= 60;
      reasons.push(`Brand Typo: Suspected ${b.target.toUpperCase()} lookalike.`);
    }
  });

  // 2. PhishClean Node Check
  try {
    const pcRes = await fetch('https://www.phishclean.com/api/v1/check-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: finalUrl }),
      cache: 'no-store'
    });
    const pcData = await pcRes.json();
    if (pcData.is_malicious) {
      score = 0;
      reasons.push("Malware Registry: Flagged as malicious by PhishClean.");
    }
  } catch (e) {}

  // 3. GACS Domain Check
  try {
    const gacsRes = await fetch(`https://gacs.app/api/public/check-domain?host=${domain}`, { cache: 'no-store' });
    const gacsData = await gacsRes.json();
    if (gacsData.risk === 'high' || gacsData.malicious) {
      score = Math.min(score, 20);
      reasons.push("GACS Alert: High-risk domain reputation.");
    }
  } catch (e) {}

  return {
    score: Math.max(0, score),
    reasons: reasons.length > 0 ? reasons : ["Clean Signal: No malicious identifiers identified in active registries."],
    domain
  };
}
