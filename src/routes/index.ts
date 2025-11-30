import RouteBuilder from '@structures/RouteBuilder';

export default new RouteBuilder().on('get', async () => {
  const file = Bun.file('public/index.html');
  let html = await file.text();
  
  html = html.replace('<%= Bun.env.DISCORD_USER_ID %>', process.env.DISCORD_USER_ID || '');
  
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    }
  });
});
