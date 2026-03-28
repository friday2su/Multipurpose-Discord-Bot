# Multipurpose Discord Bot

A multi-category Discord bot built with `discord.js` v14, MongoDB, and Riffy/Lavalink. It supports both prefix commands and slash commands, includes a full economy system, moderation tools, music playback, and components v2-based responses.

## Highlights

- Prefix and slash command support
- Components v2 help menu and rich response cards
- MongoDB-backed economy and moderation storage
- Music playback through Riffy + Lavalink
- Canvas-based now playing image cards
- Moderation, utility, fun, info, economy, and music categories
- Global slash command registration on startup

## Tech Stack

- Node.js
- `discord.js`
- `mongoose`
- `riffy`
- `canvas`
- `dotenv`

## Setup

1. Install dependencies

```bash
npm install
```

2. Create your environment file

Copy `.env.example` to `.env` and fill in your values:

```env
DISCORD_TOKEN=your_discord_bot_token
MONGODB_URI=your_mongodb_url
CLIENT_ID=your_client_id
SUPPORT_SERVER_URL=https://discord.gg/your-server
VOTE_URL=https://top.gg/bot/your_bot_id/vote
```

3. Start the bot

```bash
npm start
```

## Environment Variables

- `DISCORD_TOKEN`: Your bot token
- `MONGODB_URI`: MongoDB connection string
- `CLIENT_ID`: Discord application client ID
- `SUPPORT_SERVER_URL`: Support server link used in the help menu
- `VOTE_URL`: Vote link used in the help menu

## Project Structure

```text
src/
  commands/
    economy/
    fun/
    info/
    moderation/
    music/
    utility/
  events/
  models/
  utils/
  config.js
  index.js
```

## Command Categories

### Utility

- `ping`
- `remind`

### Info

- `avatar`
- `help`
- `serverinfo`
- `userinfo`

### Fun

- `8ball`
- `meme`
- `roll`

### Moderation

- `ban`
- `kick`
- `lock`
- `nickname`
- `purge`
- `roleinfo`
- `slowmode`
- `timeout`
- `unban`
- `unlock`
- `warn`
- `warnings`

### Economy

- `balance`
- `buy`
- `daily`
- `deposit`
- `gamble`
- `inventory`
- `leaderboard`
- `rob`
- `shop`
- `shopmanage`
- `transfer`
- `withdraw`
- `work`

### Music

- `loop`
- `lyrics`
- `nowplaying`
- `play`
- `queue`
- `skip`
- `stop`
- `volume`

## Notable Features

### Help Menu

The help command uses components v2 and includes:

- A category overview panel
- A select menu for switching categories
- Invite, support, and vote link buttons

### Economy System

The economy system includes:

- Wallet and bank balances
- Daily rewards and work payouts
- Shop and inventory support
- Transfers, robbery, and gambling
- Server leaderboard views

### Music System

The music system includes:

- Queue-based playback
- Play, skip, stop, loop, queue, and volume controls
- Canvas now playing cards
- Lavalink-backed playback through Riffy

## Music Requirements

This bot expects a working Lavalink-compatible node for music playback. The current connection is configured in `src/index.js`.

Make sure the bot has permission to:

- Connect to voice channels
- Speak in voice channels
- Send messages in the bound text channel

## Database Models

Current models include:

- `Guild`
- `User`
- `Warning`

## Running Notes

- Slash commands are registered globally on startup
- Global slash command updates can take some time to propagate
- Prefix is currently set to `!`
- Most rich bot responses are rendered through components v2

## Development Notes

To add a new command:

1. Create a file in the correct category inside `src/commands/`
2. Export:
   - `category`
   - `name`
   - `description`
   - `data`
   - `executePrefix(...)`
   - `executeSlash(...)`
3. Restart the bot so commands are loaded and slash commands are refreshed

## License

MIT