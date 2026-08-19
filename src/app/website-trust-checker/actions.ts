'use server';

/**
 * @fileOverview Server actions for the Website Trust Checker to bypass CORS restrictions.
 */

export async function checkUrlhaus(url: string) {
  try {
    const response = await fetch('https://urlhaus-api.abuse.ch/v1/url/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `url=${encodeURIComponent(url)}`,
    });

    if (!response.ok) return { status: 'error', message: 'Uplink Restricted' };
    const data = await response.json();
    return data;
  } catch (error) {
    return { status: 'error', message: 'Connection Timeout' };
  }
}

export async function getDomainInfo(domain: string) {
  try {
    // Using ipwho.is as it supports HTTPS in free tier more reliably than ip-api.com for browser requests
    const response = await fetch(`https://ipwho.is/${encodeURIComponent(domain)}`);
    if (!response.ok) return { success: false };
    const data = await response.json();
    return data;
  } catch (error) {
    return { success: false };
  }
}

export async function getDnsInfo(domain: string) {
  try {
    const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`);
    if (!response.ok) return { Status: -1 };
    const data = await response.json();
    return data;
  } catch (error) {
    return { Status: -1 };
  }
}
