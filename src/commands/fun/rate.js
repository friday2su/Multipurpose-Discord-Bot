const {
  SlashCommandBuilder,
  MessageFlags,
  TextDisplayBuilder,
  ContainerBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
} = require('discord.js');

module.exports = {
  category: 'Fun',
  name: 'rate',
  description: 'Rate something out of 10',
  slashOnly: false,

  data: new SlashCommandBuilder()
    .setName('rate')
    .setDescription('Rate something out of 10')
    .addStringOption(option =>
      option
        .setName('thing')
        .setDescription('What to rate')
        .setRequired(true)),

  async executePrefix(message, args, client) {
    if (args.length === 0) {
      const errorText = new TextDisplayBuilder()
        .setContent('⚠️ Usage: `!rate <thing>`\nExample: `!rate pizza`');

      const container = new ContainerBuilder()
        .addTextDisplayComponents(errorText);

      return message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [container],
      });
    }

    const thing = args.join(' ');
    await message.reply(createRatePayload(thing));
  },

  async executeSlash(interaction, client) {
    const thing = interaction.options.getString('thing');
    await interaction.reply(createRatePayload(thing));
  }
};

function createRatePayload(thing) {
  const rating = Math.floor(Math.random() * 11);
  const stars = '⭐'.repeat(rating);

  let rateText = `# 📊 Rating\n\n`;
  rateText += `**Item:** ${thing}\n`;
  rateText += `**Rating:** ${rating}/10\n`;
  if (stars) rateText += `${stars}`;

  const textDisplay = new TextDisplayBuilder().setContent(rateText);

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
