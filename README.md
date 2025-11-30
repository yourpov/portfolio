# yourpov.dev

giving out my portfolio src - lets people hit me up for projects

built with bun and typescript

## what you get

- discord status integration
- github repos
- contact form that sends to discord webhook
- visitor counter
- crypto donation addresses

## tech

- **runtime**: bun
- **language**: typescript
- **styling**: tailwind css v4
- **backend**: custom bun http server
- **apis**: discord (lanyard), github

## setup

```bash
# instal 
bun install

cp .env.example .env

# add your stuff to .env
# needs: discord webhook url, discord user id (must be in the lanyard discord server), github username

# dev mode
bun run dev

# build for prod
bun run build

# run prod
bun run start
```

## env vars

check `.env.example` for all the variables you need. main ones:

- `DISCORD_WEBHOOK_URL` - where form submissions go
- `DISCORD_USER_ID` - for the live status card
- `GITHUB_USERNAME` - pulls your repos
- social usernames for links

## license

MIT
