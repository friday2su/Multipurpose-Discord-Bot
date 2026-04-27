# Multipurpose Discord Bot

A feature-rich multi-category Discord bot built with `discord.js` v14, MongoDB, Riffy/Lavalink, and Giphy API. It supports both prefix commands and slash commands, includes a full economy system, moderation tools, music playback, social interactions with GIFs, and components v2-based responses.

## Highlights

- Prefix and slash command support
- Components v2 help menu and rich response cards with media galleries
- MongoDB-backed economy and moderation storage
- Music playback through Riffy + Lavalink
- Canvas-based now playing image cards
- Giphy API integration for social commands with animated GIFs
- 9 command categories: Utility, Info, Fun, Moderation, Economy, Music, Image, Games, Social
- Global slash command registration on startup
- Auto-reload with nodemon for development

## Tech Stack

- Node.js
- `discord.js` v14 with Components V2
- `mongoose`
- `riffy`
- `canvas`
- `axios`
- `dotenv`
- `chalk`

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
GIPHY_API_KEY=your_giphy_api_key
SUPPORT_SERVER_URL=https://discord.gg/your-server
VOTE_URL=https://top.gg/bot/your_bot_id/vote
```

3. Start the bot

```bash
# Production
npm start

# Development (auto-reload)
npm run dev
```

## Environment Variables

- `DISCORD_TOKEN`: Your bot token
- `MONGODB_URI`: MongoDB connection string
- `CLIENT_ID`: Discord application client ID
- `GIPHY_API_KEY`: Giphy API key for GIF integration (get free at https://developers.giphy.com/)
- `SUPPORT_SERVER_URL`: Support server link used in the help menu
- `VOTE_URL`: Vote link used in the help menu

## Project Structure

```text
src/
  commands/
    economy/
    fun/
    games/
    image/
    info/
    moderation/
    music/
    social/
    utility/
  events/
  models/
  utils/
    database.js
    giphy.js
    musicCard.js
    respond.js
  config.js
  index.js
```

## Command Categories

### Utility (11 commands)

- `ping` - Check bot latency
- `remind` - Set a reminder
- `poll` - Create a poll with reactions
- `calculate` - Perform calculations
- `choose` - Choose randomly from options
- `afk` - Set AFK status
- `timestamp` - Generate Discord timestamps
- `uptime` - Check bot uptime
- `randomnumber` - Generate random numbers
- `base64` - Encode/decode base64
- `embed` - Create custom embeds

### Info (4 commands)

- `avatar` - Get user's avatar
- `help` - Show all commands with category selector
- `serverinfo` - Get server information
- `userinfo` - Get user information

### Fun (10 commands)

- `8ball` - Ask the magic 8ball
- `meme` - Get random memes
- `roll` - Roll dice
- `coinflip` - Flip a coin
- `ship` - Ship two users together
- `rps` - Play rock paper scissors
- `rate` - Rate something out of 10
- `joke` - Get random jokes
- `wouldyourather` - Get would you rather questions
- `fact` - Get random fun facts

### Moderation (18 commands)

- `ban` - Ban a member
- `kick` - Kick a member
- `lock` - Lock a channel
- `unlock` - Unlock a channel
- `lockdown` - Lock all channels
- `unlockdown` - Unlock all channels
- `nickname` - Change user nickname
- `purge` - Bulk delete messages
- `roleinfo` - Get role information
- `slowmode` - Set channel slowmode
- `timeout` - Timeout a member
- `unban` - Unban a user
- `warn` - Warn a member
- `warnings` - View user warnings
- `mute` - Mute a member
- `unmute` - Unmute a member
- `addrole` - Add role to member
- `removerole` - Remove role from member

### Economy (13 commands)

- `balance` - Check balance
- `buy` - Buy from shop
- `daily` - Claim daily reward
- `deposit` - Deposit to bank
- `gamble` - Gamble coins
- `inventory` - View inventory
- `leaderboard` - View server leaderboard
- `rob` - Rob another user
- `shop` - View shop items
- `shopmanage` - Manage shop items
- `transfer` - Transfer coins
- `withdraw` - Withdraw from bank
- `work` - Work for coins

### Music (8 commands)

- `loop` - Toggle loop mode
- `lyrics` - Get song lyrics
- `nowplaying` - Show current song
- `play` - Play a song
- `queue` - View music queue
- `skip` - Skip current song
- `stop` - Stop playback
- `volume` - Adjust volume

### Image (9 commands)

- `ascii` - Convert text to ASCII art
- `emojify` - Convert text to emojis
- `mock` - Convert to mocking SpongeBob case
- `clap` - Add clap emojis between words
- `vaporwave` - Convert to vaporwave aesthetic
- `bubble` - Convert to bubble text
- `zalgo` - Convert to zalgo/glitch text
- `reverse` - Reverse text
- `color` - Get color information from hex

### Games (4 commands)

- `tictactoe` - Play tic-tac-toe
- `guess` - Guess a number game
- `trivia` - Answer trivia questions
- `dice` - Roll customizable dice

### Social (11 commands with GIFs)

- `hug` - Hug someone
- `kiss` - Kiss someone
- `pat` - Pat someone
- `slap` - Slap someone
- `highfive` - High five someone
- `poke` - Poke someone
- `wave` - Wave at someone
- `dance` - Dance with someone
- `cry` - Cry
- `laugh` - Laugh

## Notable Features

### Help Menu

The help command uses components v2 and includes:

- A category overview panel with command counts
- A select menu for switching between categories
- Invite, support, and vote link buttons
- Both prefix and slash command support

### Social Commands with GIFs

Social commands integrate with Giphy API to display animated GIFs:

- Fetches random GIFs from Giphy based on action type
- Displays GIFs inline using MediaGallery components v2
- Includes fallback GIFs if API is unavailable
- "View GIF" button for opening in new tab

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
- Canvas now playing cards with track information
- Lavalink-backed playback through Riffy

### Components V2

All commands use Discord's Components V2 for rich interactions:

- `ContainerBuilder` for structured layouts
- `TextDisplayBuilder` for formatted text
- `MediaGalleryBuilder` for image/GIF displays
- `ButtonBuilder` for interactive buttons
- `SeparatorBuilder` for visual spacing

## Music Requirements

This bot expects a working Lavalink-compatible node for music playback. The current connection is configured in `src/index.js`.

Make sure the bot has permission to:

- Connect to voice channels
- Speak in voice channels
- Send messages in the bound text channel

## Database Models

Current models include:

- `Guild` - Server-specific settings
- `User` - User economy data
- `Warning` - Moderation warnings

## Running Notes

- Slash commands are registered globally on startup
- Global slash command updates can take some time to propagate
- Prefix is currently set to `!`
- Most rich bot responses are rendered through components v2
- Nodemon auto-reloads on file changes in development mode
- DNS configured with Google (8.8.8.8, 8.8.4.4) and Cloudflare (1.1.1.1, 1.0.0.1)

## Development Notes

To add a new command:

1. Create a file in the correct category inside `src/commands/`
2. Export:
   - `category`
   - `name`
   - `description`
   - `data` (SlashCommandBuilder)
   - `executePrefix(message, args, client)`
   - `executeSlash(interaction, client)`
3. Use Components V2 for responses (ContainerBuilder, TextDisplayBuilder, etc.)
4. Restart the bot (or use `npm run dev` for auto-reload)

### Adding Social Commands with GIFs

```javascript
const { getGiphyGif } = require('../../utils/giphy');

// In your execute function
const gifUrl = await getGiphyGif('searchTerm');

// Use MediaGalleryBuilder to display
const gallery = new MediaGalleryBuilder().addItems(
  new MediaGalleryItemBuilder().setURL(gifUrl)
);
```

## API Integrations

- **Giphy API**: Used for fetching animated GIFs in social commands
- **Lavalink**: Used for music playback through Riffy
- **MongoDB**: Used for persistent data storage

## License

MIT