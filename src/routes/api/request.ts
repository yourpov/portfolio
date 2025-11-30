import RouteBuilder from '@structures/RouteBuilder';
import { logger } from '@utils/logger';

if (!process.env.DISCORD_WEBHOOK_URL) {
  throw new Error('DISCORD_WEBHOOK_URL is required in environment variables');
}

const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
const ipRateLimit = new Map<string, { count: number; lastReset: number }>();
const cleanupInterval = 60000;

setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of ipRateLimit.entries()) {
    if (now - data.lastReset > 3600000) {
      ipRateLimit.delete(ip);
    }
  }
}, cleanupInterval);

export default new RouteBuilder().on('post', async (req, server) => {
  try {
    const ip = server.requestIP(req)?.address || 'unknown';
    const now = Date.now();
    
    if (!ipRateLimit.has(ip)) {
      ipRateLimit.set(ip, { count: 0, lastReset: now });
    }
    
    const rateData = ipRateLimit.get(ip)!;
    if (now - rateData.lastReset > 3600000) {
      rateData.count = 0;
      rateData.lastReset = now;
    }
    
    if (rateData.count >= 3) {
      return new Response(JSON.stringify({ error: 'too many requests, try again later' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const body = await req.json();
    const { projectType, name, contact, project, budget } = body;
    
    if (!projectType || !name || !contact || !project) {
      return new Response(JSON.stringify({ error: 'missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (name.length > 100 || contact.length > 100 || project.length > 2000) {
      return new Response(JSON.stringify({ error: 'field too long' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const projectTypeLabels: Record<string, string> = {
      'bot': 'discord/telegram bot',
      'backend': 'backend/api',
      'automation': 'automation/tools',
      'roblox': 'roblox system',
      'website': 'website',
      'other': 'something else'
    };
    
    const embed = {
      embeds: [{
        title: 'work request',
        color: 0xff6b6b,
        fields: [
          { name: 'type', value: projectTypeLabels[projectType] || projectType, inline: true },
          { name: 'budget', value: budget || 'not specified', inline: true },
          { name: 'name', value: name, inline: false },
          { name: 'contact', value: contact, inline: false },
          { name: 'details', value: project, inline: false }
        ],
        footer: { text: `${ip} • ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}` },
        timestamp: new Date().toISOString()
      }]
    };
    
    const webhookRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(embed)
    });
    
    if (!webhookRes.ok) {
      return new Response(JSON.stringify({ error: 'failed to send' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    rateData.count++;
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    logger.error(err, 'Failed to process work request');
    return new Response(JSON.stringify({ error: 'failed to process your request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
