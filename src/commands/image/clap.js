const {
  SlashCommandBuilder,
  MessageFlags,
  TextDisplayBuilder,
  ContainerBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
} = require('discord.js');

module.exports = {
  category: 'Image',
  name: 'clap',
  description: 'Add clap emojis between words',
  slashOnly: false,

  data: new SlashCommandBuilder()
    .setName('clap')
    .setDescription('Add clap emojis between words')
    .addStringOption(option =>
      option
        .setName('text')
        .setDescription('Text to add claps to')
        .setRequired(true)),

  async executePrefix(message, args, client) {
    if (args.length === 0) {
      const errorText = new TextDisplayBuilder()
        .setContent('⚠️ Usage: `!clap <text>`\nExample: `!clap this is great`');

      const container = new ContainerBuilder()
        .addTextDisplayComponents(errorText);

      return message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [container],
      });
    }

    const text = args.join(' ');
    await message.reply(createClapPayload(text));
  },

  async executeSlash(interaction, client) {
    const text = interaction.options.getString('text');
    await interaction.reply(createClapPayload(text));
  }
};

function createClapPayload(text) {
  const clapped = text.split(' ').join(' 👏 ');

  let clapText = `# 👏 Clap Text\n\n`;
  clapText += `**Original:** ${text}\n\n`;
  clapText += `**Clapped:** ${clapped}`;

  const textDisplay = new TextDisplayBuilder().setContent(clapText);

  const separator = new SeparatorBuilder()
    .setDivider(true)
    .setSpacing(SeparatorSpacingSize.Small);

  const container = new ContainerBuilder()
    .addTextDisplayComponents(textDisplay)
    .addSeparatorComponents(separator);

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [container],
  };
}
