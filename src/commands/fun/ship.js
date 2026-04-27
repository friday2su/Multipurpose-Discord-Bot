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
  name: 'ship',
  description: 'Ship two users together',
  slashOnly: false,

  data: new SlashCommandBuilder()
    .setName('ship')
    .setDescription('Ship two users together')
    .addUserOption(option =>
      option
        .setName('user1')
        .setDescription('First user')
        .setRequired(true))
    .addUserOption(option =>
      option
        .setName('user2')
        .setDescription('Second user')
        .setRequired(true)),

  async executePrefix(message, args, client) {
    const mentions = message.mentions.users;

    if (mentions.size < 2) {
      const errorText = new TextDisplayBuilder()
        .setContent('⚠️ Usage: `!ship @user1 @user2`\nExample: `!ship @John @Jane`');

      const container = new ContainerBuilder()
        .addTextDisplayComponents(errorText);

      return message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [container],
      });
    }

    const users = Array.from(mentions.values());
    await message.reply(createShipPayload(users[0], users[1]));
  },

  async executeSlash(interaction, client) {
    const user1 = interaction.options.getUser('user1');
    const user2 = interaction.options.getUser('user2');

    await interaction.reply(createShipPayload(user1, user2));
  }
};

function createShipPayload(user1, user2) {
  const percentage = Math.floor(Math.random() * 101);
  const hearts = Math.floor(percentage / 10);
  const heartBar = '❤️'.repeat(hearts) + '🖤'.repeat(10 - hearts);

  let message;
  if (percentage < 30) {
    message = "Not meant to be... 💔";
  } else if (percentage < 60) {
    message = "There's potential! 💕";
  } else if (percentage < 80) {
    message = "Great match! 💖";
  } else {
    message = "Perfect couple! 💞";
  }

  let shipText = `# 💘 Love Calculator\n\n`;
  shipText += `**${user1.username}** 💕 **${user2.username}**\n\n`;
  shipText += `**Compatibility:** ${percentage}%\n`;
  shipText += `${heartBar}\n\n`;
  shipText += `*${message}*`;

  const textDisplay = new TextDisplayBuilder().setContent(shipText);

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
