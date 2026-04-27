const {
  SlashCommandBuilder,
  MessageFlags,
  TextDisplayBuilder,
  ContainerBuilder,
  ButtonBuilder,
  ButtonStyle,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
} = require('discord.js');
const { getGiphyGif } = require('../../utils/giphy');

module.exports = {
  category: 'Social',
  name: 'wave',
  description: 'Wave at someone',
  slashOnly: false,

  data: new SlashCommandBuilder()
    .setName('wave')
    .setDescription('Wave at someone')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('User to wave at')
        .setRequired(true)),

  async executePrefix(message, args, client) {
    const user = message.mentions.users.first();

    if (!user) {
      const errorText = new TextDisplayBuilder()
        .setContent('⚠️ Usage: `!wave @user`\nExample: `!wave @John`');

      const container = new ContainerBuilder()
        .addTextDisplayComponents(errorText);

      return message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [container],
      });
    }

    const gifUrl = await getGiphyGif('wave');
    await message.reply(createWavePayload(message.author, user, gifUrl));
  },

  async executeSlash(interaction, client) {
    const user = interaction.options.getUser('user');
    const gifUrl = await getGiphyGif('wave');
    await interaction.reply(createWavePayload(interaction.user, user, gifUrl));
  }
};

function createWavePayload(author, target, gifUrl) {
  let waveText = `# 👋 Wave\n\n**${author.username}** waves at **${target.username}**!\n\n*Hello there! 😊*`;

  const textDisplay = new TextDisplayBuilder().setContent(waveText);

  const separator = new SeparatorBuilder()
    .setDivider(true)
    .setSpacing(SeparatorSpacingSize.Small);

  const gifButton = new ButtonBuilder()
    .setLabel('View GIF')
    .setStyle(ButtonStyle.Link)
    .setURL(gifUrl);

  const gallery = new MediaGalleryBuilder().addItems(
    new MediaGalleryItemBuilder().setURL(gifUrl)
  );

  const container = new ContainerBuilder()
    .addTextDisplayComponents(textDisplay)
    .addSeparatorComponents(separator)
    .addMediaGalleryComponents(gallery)
    .addActionRowComponents(actionRow =>
      actionRow.setComponents(gifButton)
    );

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [container],
  };
}
