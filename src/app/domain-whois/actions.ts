
'use server';

/**
 * @fileOverview Server actions for Domain Whois / Age Studio.
 * Handles high-fidelity multi-node registry discovery and DNS lookups.
 */

export interface WhoisResult {
  domain: string;
  status: string[];
  createdDate?: string;
  expiryDate?: string;
  updatedDate?: string;
  registrar?: string;
  nameservers: string[];
  raw?: any;
  source: string;
  exists: boolean;
}

function cleanDomain(input: string): string {
  return input.trim()
    .toLowerCase()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .split('/')[0]
    .split('?')[0];
}

function parseRdapDates(events: any[]) {
  if (!events) return {};
  const dates: { created?: string; expiry?: string; updated?: string } = {};
  
  events.forEach(e => {
    const action = e.eventAction?.toLowerCase() || '';
    const date = e.eventDate;
    if (action.includes('registration')) dates.created = date;
    if (action.includes('expiration')) dates.expiry = date;
    if (action.includes('last changed')) dates.updated = date;
  });
  
  return dates;
}

export async function fetchWhoisData(input: string): Promise<WhoisResult> {
  const domain = cleanDomain(input);
  if (!domain) throw new Error("Invalid domain identifier.");

  const nodes = [
    { url: `https://rdap.org/domain/${domain}`, name: 'RDAP Standard' },
    { url: `https://rdap.cloud/api/v1/${domain}`, name: 'RDAP Cloud' },
    { url: `https://who-dat.as93.net/${domain}`, name: 'WhoDat Matrix' },
    { url: `https://rdap.verisign.com/com/v1/domain/${domain}`, name: 'Verisign Node' }
  ];

  // Try RDAP Nodes first
  for (const node of nodes) {
    try {
      const response = await fetch(node.url, { 
        cache: 'no-store',
        headers: { 'Accept': 'application/rdap+json, application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        const dates = parseRdapDates(data.events || []);
        
        return {
          domain: data.ldhName || domain,
          status: data.status || [],
          createdDate: dates.created,
          expiryDate: dates.expiry,
          updatedDate: dates.updated,
          registrar: data.entities?.[0]?.vcardArray?.[1]?.find((x: any) => x[0] === 'fn')?.[3] || 'Registry Direct',
          nameservers: data.nameservers?.map((ns: any) => ns.ldhName) || [],
          source: node.name,
          exists: true,
          raw: data
        };
      }
    } catch (e) {
      console.warn(`Node ${node.name} restricted.`);
    }
  }

  // DNS Fallback (Checks if domain exists at all)
  try {
    const dnsRes = await fetch(`https://cloudflare-dns.com/dns-query?name=${domain}&type=NS`, {
      headers: { 'Accept': 'application/dns-json' },
      cache: 'no-store'
    });
    const dnsData = await dnsRes.json();
    
    if (dnsData.Status === 0 && dnsData.Answer) {
      return {
        domain,
        status: ['Active (DNS Verified)'],
        nameservers: dnsData.Answer.map((a: any) => a.data),
        source: 'Cloudflare DNS Protocol',
        exists: true
      };
    }
  } catch (e) {}

  return {
    domain,
    status: ['Not Found / Unregistered'],
    nameservers: [],
    source: 'Global Registry Scan',
    exists: false
  };
}
