const { SlashCommandBuilder } = require('discord.js');
const { getOrCreateUser } = require('../../utils/economy');
const { replyError, replyWithCard } = require('../../utils/respond');

module.exports = {
  category: 'Economy',
  name: 'balance',
  description: 'Check your or someone else\'s balance',
  slashOnly: false,

  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your or someone else\'s balance')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user to check balance of')
        .setRequired(false)),

  async executePrefix(message) {
    const user = message.mentions.users.first() || message.author;

    try {
      const userData = await getOrCreateUser(user);

      await replyWithCard(message, {
        color: 0x00d26a,
        title: `${user.username}'s Balance`,
        description: 'A quick snapshot of wallet, bank, and total funds.',
        thumbnail: { url: user.displayAvatarURL({ dynamic: true }) },
        fields: [
          { name: 'Wallet', value: `$${userData.balance.toLocaleString()}`, inline: true },
          { name: 'Bank', value: `$${userData.bank.toLocaleString()}`, inline: true },
          { name: 'Total', value: `$${(userData.balance + userData.bank).toLocaleString()}`, inline: true },
        ],
        footer: { text: 'Use !work, !daily, and !gamble to earn money.' },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Balance error:', error);
      await replyError(message, 'I could not load that balance right now.');
    }
  },

  async executeSlash(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;

    try {
      const userData = await getOrCreateUser(user);

      await replyWithCard(interaction, {
        color: 0x00d26a,
        title: `${user.username}'s Balance`,
        description: 'A quick snapshot of wallet, bank, and total funds.',
        thumbnail: { url: user.displayAvatarURL({ dynamic: true }) },
        fields: [
          { name: 'Wallet', value: `$${userData.balance.toLocaleString()}`, inline: true },
          { name: 'Bank', value: `$${userData.bank.toLocaleString()}`, inline: true },
          { name: 'Total', value: `$${(userData.balance + userData.bank).toLocaleString()}`, inline: true },
        ],
        footer: { text: 'Use /work, /daily, and /gamble to earn money.' },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Balance error:', error);
      await replyError(interaction, 'I could not load that balance right now.');
    }
  },
};


