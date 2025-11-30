import RouteBuilder from '@structures/RouteBuilder';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const VISITORS_FILE = join(process.cwd(), 'data', 'visitors.json');

interface VisitorData {
  count: number;
  lastUpdated: string;
}

function getVisitorCount(): number {
  try {
    if (!existsSync(VISITORS_FILE)) {
      return 0;
    }
    const data = JSON.parse(readFileSync(VISITORS_FILE, 'utf-8')) as VisitorData;
    return data.count || 0;
  } catch {
    return 0;
  }
}

function incrementVisitorCount(): number {
  try {
    const count = getVisitorCount() + 1;
    const data: VisitorData = {
      count,
      lastUpdated: new Date().toISOString()
    };
    writeFileSync(VISITORS_FILE, JSON.stringify(data, null, 2));
    return count;
  } catch {
    return getVisitorCount();
  }
}

export default new RouteBuilder()
  .on('get', async () => {
    const count = getVisitorCount();
    return new Response(JSON.stringify({ count }), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  })
  .on('post', async () => {
    const count = incrementVisitorCount();
    return new Response(JSON.stringify({ count }), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  });
