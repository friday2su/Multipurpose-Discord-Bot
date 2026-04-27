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
  name: 'mock',
  description: 'Convert text to mocking spongebob case',
  slashOnly: false,

  data: new SlashCommandBuilder()
    .setName('mock')
    .setDescription('Convert text to mocking spongebob case')
    .addStringOption(option =>
      option
        .setName('text')
        .setDescription('Text to mock')
        .setRequired(true)),

  async executePrefix(message, args, client) {
    if (args.length === 0) {
      const errorText = new TextDisplayBuilder()
        .setContent('⚠️ Usage: `!mock <text>`\nExample: `!mock this is a test`');

      const container = new ContainerBuilder()
        .addTextDisplayComponents(errorText);

      return message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [container],
      });
    }

    const text = args.join(' ');
    await message.reply(createMockPayload(text));
  },

  async executeSlash(interaction, client) {
    const text = interaction.options.getString('text');
    await interaction.reply(createMockPayload(text));
  }
};

function createMockPayload(text) {
  const mocked = text
    .split('')
    .map((char, index) => {
      if (char.match(/[a-zA-Z]/)) {
        return index % 2 === 0 ? char.toLowerCase() : char.toUpperCase();
      }
      return char;
    })
    .join('');

  let mockText = `# 🤡 Mocking Text\n\n`;
  mockText += `**Original:** ${text}\n\n`;
  mockText += `**Mocked:** ${mocked}`;

  const textDisplay = new TextDisplayBuilder().setContent(mockText);

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
