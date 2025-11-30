import RouteBuilder from '@structures/RouteBuilder';

const config = {
  age: process.env.AGE || '21',
  songCount: process.env.SONG_COUNT || '218',
  yearsExperience: process.env.YEARS_EXPERIENCE || '7',
  projectsCompleted: process.env.PROJECTS_COMPLETED || '50',
  clientsCount: process.env.CLIENTS_COUNT || '12',
  techStack: (process.env.TECH_STACK || 'Lua,Golang,TypeScript,JavaScript,Python,HTML,CSS').split(','),
  frameworks: (process.env.FRAMEWORKS || 'Bun,Tailwind CSS,HTMX,Smarty').split(','),
  socials: {
    github: process.env.GITHUB_USERNAME || 'username',
    discord: process.env.DISCORD_USERNAME || 'username',
    steam: process.env.STEAM_USERNAME || 'username',
    valorant: process.env.VALORANT_TAG || 'SummerBackshots#imbad',
    twitter: process.env.TWITTER_USERNAME || 'username',
    instagram: process.env.INSTAGRAM_USERNAME || 'username',
    telegram: process.env.TELEGRAM_USERNAME || 'username'
  }
};

export default new RouteBuilder().on('get', async () => {
  return new Response(JSON.stringify(config), {
    headers: { 
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600'
    }
  });
});
