const { SlashCommandBuilder } = require('discord.js');
const User = require('../../models/User');
const { formatCurrency } = require('../../utils/economy');
const { replyError, replyWithCard } = require('../../utils/respond');

function getLeaderboardValue(user, type) {
  if (type === 'wallet') return user.balance;
  if (type === 'bank') return user.bank;
  return user.balance + user.bank;
}

async function buildLeaderboard(guild, type, top) {
  const memberIds = guild.members.cache.map((member) => member.id);
  const users = await User.find({ userId: { $in: memberIds } }).lean();

  return users
    .sort((a, b) => getLeaderboardValue(b, type) - getLeaderboardValue(a, type))
    .slice(0, top);
}

module.exports = {
  category: 'Economy',
  name: 'leaderboard',
  description: 'Show the richest users on the server',
  slashOnly: false,

  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Show the richest users on the server')
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription('Type of leaderboard')
        .addChoices(
          { name: 'Total Balance', value: 'total' },
          { name: 'Wallet Balance', value: 'wallet' },
          { name: 'Bank Balance', value: 'bank' },
        ))
    .addIntegerOption((option) =>
      option
        .setName('top')
        .setDescription('Number of users to show (1-20)')
        .setMinValue(1)
        .setMaxValue(20)),

  async executePrefix(message, args) {
    const type = args[0]?.toLowerCase() || 'total';
    const top = Math.min(Number.parseInt(args[1], 10) || 10, 20);

    try {
      const users = await buildLeaderboard(message.guild, type, top);
      if (!users.length) {
        return replyError(message, 'No ranked users were found in this server yet.');
      }

      await replyWithCard(message, {
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Leaderboard`,
        description: `Top **${users.length}** users in **${message.guild.name}**.`,
        fields: users.map((user, index) => ({
          name: `#${index + 1} ${user.username}`,
          value: formatCurrency(getLeaderboardValue(user, type)),
          inline: false,
        })),
      });
    } catch (error) {
      console.error('Leaderboard error:', error);
      await replyError(message, 'I could not load the leaderboard right now.');
    }
  },

  async executeSlash(interaction) {
    const type = interaction.options.getString('type') || 'total';
    const top = Math.min(interaction.options.getInteger('top') || 10, 20);

    try {
      const users = await buildLeaderboard(interaction.guild, type, top);
      if (!users.length) {
        return replyError(interaction, 'No ranked users were found in this server yet.');
      }

      await replyWithCard(interaction, {
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Leaderboard`,
        description: `Top **${users.length}** users in **${interaction.guild.name}**.`,
        fields: users.map((user, index) => ({
          name: `#${index + 1} ${user.username}`,
          value: formatCurrency(getLeaderboardValue(user, type)),
          inline: false,
        })),
      });
    } catch (error) {
      console.error('Leaderboard error:', error);
      await replyError(interaction, 'I could not load the leaderboard right now.');
    }
  },
};
