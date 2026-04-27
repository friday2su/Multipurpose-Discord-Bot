const {
  SlashCommandBuilder,
  MessageFlags,
  TextDisplayBuilder,
  ContainerBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
} = require('discord.js');

module.exports = {
  category: 'Utility',
  name: 'afk',
  description: 'Set yourself as AFK',
  slashOnly: false,

  data: new SlashCommandBuilder()
    .setName('afk')
    .setDescription('Set yourself as AFK')
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('Reason for being AFK')
        .setRequired(false)),

  async executePrefix(message, args, client) {
    const reason = args.join(' ') || 'No reason provided';

    if (!client.afkUsers) client.afkUsers = new Map();

    client.afkUsers.set(message.author.id, {
      reason,
      timestamp: Date.now()
    });

    await message.reply(createAFKPayload(message.author.username, reason, true));
  },

  async executeSlash(interaction, client) {
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!client.afkUsers) client.afkUsers = new Map();

    client.afkUsers.set(interaction.user.id, {
      reason,
      timestamp: Date.now()
    });

    await interaction.reply(createAFKPayload(interaction.user.username, reason, true));
  }
};

function createAFKPayload(username, reason, isSet) {
  let afkText = isSet
    ? `# 💤 AFK Status Set\n\n**${username}** is now AFK\n**Reason:** ${reason}`
    : `# 👋 Welcome Back\n\n**${username}** is no longer AFK`;

  const textDisplay = new TextDisplayBuilder().setContent(afkText);

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
