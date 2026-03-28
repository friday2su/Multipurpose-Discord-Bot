const { SlashCommandBuilder } = require('discord.js');
const {
  formatCurrency,
  formatDuration,
  getCooldownRemaining,
  getOrCreateUser,
} = require('../../utils/economy');
const { replyError, replyWithCard } = require('../../utils/respond');

const DAILY_COOLDOWN = 24 * 60 * 60 * 1000;
const DAILY_STREAK_RESET = 48 * 60 * 60 * 1000;

async function handleDaily(target, user) {
  const userData = await getOrCreateUser(user);
  const cooldownRemaining = getCooldownRemaining(userData.lastDaily, DAILY_COOLDOWN);

  if (cooldownRemaining > 0) {
    return replyError(target, `Your next daily reward is ready in ${formatDuration(cooldownRemaining)}.`);
  }

  if (userData.lastDaily && Date.now() - new Date(userData.lastDaily).getTime() > DAILY_STREAK_RESET) {
    userData.dailyStreak = 0;
  }

  const nextStreak = (userData.dailyStreak || 0) + 1;
  const baseReward = 500;
  const streakBonus = Math.min(nextStreak * 75, 750);
  const totalReward = baseReward + streakBonus;

  userData.balance += totalReward;
  userData.lastDaily = new Date();
  userData.dailyStreak = nextStreak;
  await userData.save();

  return replyWithCard(target, {
    title: 'Daily Reward Claimed',
    description: `You picked up **${formatCurrency(totalReward)}** from today’s reward.`,
    fields: [
      { name: 'Base reward', value: formatCurrency(baseReward), inline: true },
      { name: 'Streak bonus', value: `${formatCurrency(streakBonus)} • ${nextStreak} day streak`, inline: true },
      { name: 'Wallet', value: formatCurrency(userData.balance), inline: true },
    ],
    footer: { text: 'Come back tomorrow to keep the streak going.' },
  });
}

module.exports = {
  category: 'Economy',
  name: 'daily',
  description: 'Claim your daily reward',
  slashOnly: false,

  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Claim your daily reward'),

  async executePrefix(message) {
    try {
      await handleDaily(message, message.author);
    } catch (error) {
      console.error('Daily error:', error);
      await replyError(message, 'I could not claim your daily reward right now.');
    }
  },

  async executeSlash(interaction) {
    try {
      await handleDaily(interaction, interaction.user);
    } catch (error) {
      console.error('Daily error:', error);
      await replyError(interaction, 'I could not claim your daily reward right now.');
    }
  },
};
