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
  name: 'emojify',
  description: 'Convert text to emojis',
  slashOnly: false,

  data: new SlashCommandBuilder()
    .setName('emojify')
    .setDescription('Convert text to emojis')
    .addStringOption(option =>
      option
        .setName('text')
        .setDescription('Text to emojify')
        .setRequired(true)),

  async executePrefix(message, args, client) {
    if (args.length === 0) {
      const errorText = new TextDisplayBuilder()
        .setContent('⚠️ Usage: `!emojify <text>`\nExample: `!emojify hello`');

      const container = new ContainerBuilder()
        .addTextDisplayComponents(errorText);

      return message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [container],
      });
    }

    const text = args.join(' ');
    await message.reply(createEmojifyPayload(text));
  },

  async executeSlash(interaction, client) {
    const text = interaction.options.getString('text');
    await interaction.reply(createEmojifyPayload(text));
  }
};

function createEmojifyPayload(text) {
  const emojified = text
    .toLowerCase()
    .split('')
    .map(char => {
      if (char >= 'a' && char <= 'z') {
        return `:regional_indicator_${char}:`;
      } else if (char >= '0' && char <= '9') {
        const numbers = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
        return `:${numbers[parseInt(char)]}:`;
      } else if (char === ' ') {
        return '   ';
      } else {
        return char;
      }
    })
    .join('');

  let emojifyText = `# 😀 Emojified Text\n\n`;
  emojifyText += `**Original:** ${text}\n\n`;
  emojifyText += `**Emojified:**\n${emojified}`;

  const textDisplay = new TextDisplayBuilder().setContent(emojifyText);

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
