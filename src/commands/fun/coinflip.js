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
  name: 'coinflip',
  description: 'Flip a coin',
  slashOnly: false,

  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Flip a coin'),

  async executePrefix(message, args, client) {
    await message.reply(createCoinFlipPayload());
  },

  async executeSlash(interaction, client) {
    await interaction.reply(createCoinFlipPayload());
  }
};

function createCoinFlipPayload() {
  const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
  const emoji = result === 'Heads' ? '🪙' : '🎰';

  let coinText = `# ${emoji} Coin Flip\n\n`;
  coinText += `**Result:** **${result}**`;

  const textDisplay = new TextDisplayBuilder().setContent(coinText);

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
