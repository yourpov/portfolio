import RouteBuilder from '@structures/RouteBuilder';

export default new RouteBuilder().on('get', () => {
  const file = Bun.file('public/bundle.js');
  return new Response(file, {
    headers: { 
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000'
    }
  });
});
