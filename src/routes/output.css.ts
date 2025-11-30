import RouteBuilder from '@structures/RouteBuilder';

export default new RouteBuilder().on('get', () => {
  const file = Bun.file('public/output.css');
  return new Response(file, {
    headers: { 
      'Content-Type': 'text/css; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000'
    }
  });
});
