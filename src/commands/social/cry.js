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
  name: 'cry',
  description: 'Cry',
  slashOnly: false,

  data: new SlashCommandBuilder()
    .setName('cry')
    .setDescription('Cry'),

  async executePrefix(message, args, client) {
    const gifUrl = await getGiphyGif('cry');
    await message.reply(createCryPayload(message.author, gifUrl));
  },

  async executeSlash(interaction, client) {
    const gifUrl = await getGiphyGif('cry');
    await interaction.reply(createCryPayload(interaction.user, gifUrl));
  }
};

function createCryPayload(author, gifUrl) {
  let cryText = `# 😢 Cry\n\n**${author.username}** is crying!\n\n*Don't cry! 💔*`;

  const textDisplay = new TextDisplayBuilder().setContent(cryText);

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
