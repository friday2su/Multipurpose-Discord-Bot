const { SlashCommandBuilder } = require('discord.js');
const { createNowPlayingCard } = require('../../utils/musicCard');
const { replyError } = require('../../utils/respond');

async function sendNowPlaying(target, player) {
  const attachment = await createNowPlayingCard(player.current, player.position || 0);
  return target.reply({ files: [attachment] });
}

module.exports = {
  category: 'Music',
  name: 'nowplaying',
  description: 'Show currently playing song information',
  slashOnly: false,

  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Show currently playing song information'),

  async executePrefix(message, args, client) {
    const player = client.riffy?.players.get(message.guild.id);

    if (!player || !player.current) {
      return replyError(message, 'There is no song playing right now.');
    }

    try {
      await sendNowPlaying(message, player);
    } catch (error) {
      console.error('Nowplaying error:', error);
      await replyError(message, 'I could not generate the now playing card.');
    }
  },

  async executeSlash(interaction, client) {
    const player = client.riffy?.players.get(interaction.guild.id);

    if (!player || !player.current) {
      return replyError(interaction, 'There is no song playing right now.');
    }

    try {
      const attachment = await createNowPlayingCard(player.current, player.position || 0);
      await interaction.reply({ files: [attachment] });
    } catch (error) {
      console.error('Nowplaying error:', error);
      await replyError(interaction, 'I could not generate the now playing card.');
    }
  },
};
