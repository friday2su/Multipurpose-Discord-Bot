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
  name: 'vaporwave',
  description: 'Convert text to vaporwave aesthetic',
  slashOnly: false,

  data: new SlashCommandBuilder()
    .setName('vaporwave')
    .setDescription('Convert text to vaporwave aesthetic')
    .addStringOption(option =>
      option
        .setName('text')
        .setDescription('Text to convert')
        .setRequired(true)),

  async executePrefix(message, args, client) {
    if (args.length === 0) {
      const errorText = new TextDisplayBuilder()
        .setContent('⚠️ Usage: `!vaporwave <text>`\nExample: `!vaporwave hello world`');

      const container = new ContainerBuilder()
        .addTextDisplayComponents(errorText);

      return message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [container],
      });
    }

    const text = args.join(' ');
    await message.reply(createVaporwavePayload(text));
  },

  async executeSlash(interaction, client) {
    const text = interaction.options.getString('text');
    await interaction.reply(createVaporwavePayload(text));
  }
};

function createVaporwavePayload(text) {
  const vaporwave = text
    .split('')
    .map(char => {
      const code = char.charCodeAt(0);
      if (code >= 33 && code <= 126) {
        return String.fromCharCode(code + 65248);
      }
      return char;
    })
    .join('');

  let vaporwaveText = `# 🌸 Vaporwave\n\n`;
  vaporwaveText += `**Original:** ${text}\n\n`;
  vaporwaveText += `**Vaporwave:** ${vaporwave}`;

  const textDisplay = new TextDisplayBuilder().setContent(vaporwaveText);

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
