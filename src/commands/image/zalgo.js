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
  name: 'zalgo',
  description: 'Convert text to zalgo/glitch text',
  slashOnly: false,

  data: new SlashCommandBuilder()
    .setName('zalgo')
    .setDescription('Convert text to zalgo/glitch text')
    .addStringOption(option =>
      option
        .setName('text')
        .setDescription('Text to convert')
        .setRequired(true)),

  async executePrefix(message, args, client) {
    if (args.length === 0) {
      const errorText = new TextDisplayBuilder()
        .setContent('⚠️ Usage: `!zalgo <text>`\nExample: `!zalgo hello`');

      const container = new ContainerBuilder()
        .addTextDisplayComponents(errorText);

      return message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [container],
      });
    }

    const text = args.join(' ');
    await message.reply(createZalgoPayload(text));
  },

  async executeSlash(interaction, client) {
    const text = interaction.options.getString('text');
    await interaction.reply(createZalgoPayload(text));
  }
};

function createZalgoPayload(text) {
  const zalgoChars = [
    '̀', '́', '̂', '̃', '̄', '̅', '̆', '̇',
    '̈', '̉', '̊', '̋', '̌', '̍', '̎', '̏',
    '̐', '̑', '̒', '̓', '̔', '̕', '̖', '̗',
    '̘', '̙', '̚', '̛', '̜', '̝', '̞', '̟',
    '̠', '̡', '̢', '̣', '̤', '̥', '̦', '̧'
  ];

  const zalgo = text
    .split('')
    .map(char => {
      if (char === ' ') return char;
      let result = char;
      const numMarks = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numMarks; i++) {
        result += zalgoChars[Math.floor(Math.random() * zalgoChars.length)];
      }
      return result;
    })
    .join('');

  let zalgoText = `# 👻 Zalgo Text\n\n`;
  zalgoText += `**Original:** ${text}\n\n`;
  zalgoText += `**Zalgo:** ${zalgo}`;

  const textDisplay = new TextDisplayBuilder().setContent(zalgoText);

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
