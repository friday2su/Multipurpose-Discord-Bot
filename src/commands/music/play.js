const { SlashCommandBuilder } = require('discord.js');
const { formatDuration } = require('../../utils/musicCard');
const { replyError, replyNotice } = require('../../utils/respond');

function createTrackMessage(prefix, track) {
  return `${prefix} | **${track.info.title}** by **${track.info.author || 'Unknown artist'}** • ${formatDuration(track.info.length)}`;
}

function waitForConnection(player) {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();

    const checkPlayer = () => {
      if (player.connected) {
        resolve();
        return;
      }

      if (Date.now() - startedAt > 10000) {
        reject(new Error('Player connection timeout'));
        return;
      }

      setTimeout(checkPlayer, 100);
    };

    checkPlayer();
  });
}

async function resolveQuery(client, requester, query) {
  return client.riffy.resolve({
    query,
    requester,
  });
}

async function handleExistingPlayer(client, target, player, requester, query) {
  const result = await resolveQuery(client, requester, query);
  const { loadType, tracks, playlistInfo } = result;

  if (loadType === 'playlist') {
    for (const track of tracks) {
      track.info.requester = requester;
      player.queue.add(track);
    }

    if (!player.playing && !player.paused) {
      player.play();
    }

    return replyNotice(target, `Added playlist to queue | **${playlistInfo.name}** • ${tracks.length} tracks`);
  }

  if (loadType === 'search' || loadType === 'track') {
    const track = tracks.shift();
    if (!track) {
      return replyError(target, 'No results were found for that query.');
    }

    track.info.requester = requester;
    player.queue.add(track);

    if (!player.playing && !player.paused) {
      player.play();
    }

    return replyNotice(target, createTrackMessage('Added in queue', track));
  }

  return replyError(target, 'No results were found for that query.');
}

async function handleNewPlayer(context) {
  const { client, guild, voiceChannelId, textChannelId, requester, query } = context;
  const result = await resolveQuery(client, requester, query);
  const { loadType, tracks } = result;

  if (loadType !== 'search' && loadType !== 'track') {
    return { error: 'No results were found for that query.' };
  }

  const track = tracks[0];
  if (!track) {
    return { error: 'No results were found for that query.' };
  }

  const player = await client.riffy.createConnection({
    guildId: guild.id,
    voiceChannel: voiceChannelId,
    textChannel: textChannelId,
    deaf: true,
  });

  track.info.requester = requester;

  await waitForConnection(player);
  player.queue.add(track);

  setTimeout(() => {
    try {
      if (!player.playing && !player.paused) {
        player.play();
      }
    } catch (error) {
      console.error('Delayed play error:', error);
    }
  }, 350);

  return {
    track,
  };
}

module.exports = {
  category: 'Music',
  name: 'play',
  description: 'Play a song or add it to the queue',
  slashOnly: false,

  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song or add it to the queue')
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('Song name or URL to play')
        .setRequired(true)),

  async executePrefix(message, args, client) {
    if (!args[0]) {
      return replyError(message, 'Usage: `!play <song name or URL>`');
    }

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return replyError(message, 'You need to be in a voice channel to play music.');
    }

    const permissions = voiceChannel.permissionsFor(message.guild.members.me);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
      return replyError(message, 'I need permission to connect and speak in your voice channel.');
    }

    try {
      const query = args.join(' ');
      const player = client.riffy?.players.get(message.guild.id);

      if (player && player.state !== 'DISCONNECTED') {
        return handleExistingPlayer(client, message, player, message.author, query);
      }

      const result = await handleNewPlayer({
        client,
        guild: message.guild,
        voiceChannelId: voiceChannel.id,
        textChannelId: message.channel.id,
        requester: message.author,
        query,
      });

      if (result.error) {
        return replyError(message, result.error);
      }

      return replyNotice(message, createTrackMessage('Now playing', result.track));
    } catch (error) {
      console.error('Play command error:', error);
      await replyError(message, 'An error occurred while trying to play that song.');
    }
  },

  async executeSlash(interaction, client) {
    const query = interaction.options.getString('query');
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return replyError(interaction, 'You need to be in a voice channel to play music.');
    }

    const permissions = voiceChannel.permissionsFor(interaction.guild.members.me);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
      return replyError(interaction, 'I need permission to connect and speak in your voice channel.');
    }

    try {
      const player = client.riffy?.players.get(interaction.guild.id);

      if (player && player.state !== 'DISCONNECTED') {
        return handleExistingPlayer(client, interaction, player, interaction.user, query);
      }

      const result = await handleNewPlayer({
        client,
        guild: interaction.guild,
        voiceChannelId: voiceChannel.id,
        textChannelId: interaction.channel.id,
        requester: interaction.user,
        query,
      });

      if (result.error) {
        return replyError(interaction, result.error);
      }

      return replyNotice(interaction, createTrackMessage('Now playing', result.track));
    } catch (error) {
      console.error('Play command error:', error);
      await replyError(interaction, 'An error occurred while trying to play that song.');
    }
  },
};
