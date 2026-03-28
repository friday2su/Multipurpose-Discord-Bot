const { SlashCommandBuilder } = require('discord.js');
const {
  formatCurrency,
  formatDuration,
  getCooldownRemaining,
  getOrCreateUser,
} = require('../../utils/economy');
const { replyError, replyWithCard } = require('../../utils/respond');

const WORK_COOLDOWN = 60 * 60 * 1000;
const JOBS = [
  { name: 'freelance developer', min: 160, max: 420 },
  { name: 'graphic designer', min: 120, max: 320 },
  { name: 'community manager', min: 90, max: 240 },
  { name: 'data analyst', min: 180, max: 450 },
  { name: 'support specialist', min: 80, max: 210 },
  { name: 'project lead', min: 200, max: 500 },
];

function pickJob() {
  const job = JOBS[Math.floor(Math.random() * JOBS.length)];
  const earned = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;
  return { job, earned };
}

async function handleWork(target, user) {
  const userData = await getOrCreateUser(user);
  const cooldownRemaining = getCooldownRemaining(userData.lastWork, WORK_COOLDOWN);

  if (cooldownRemaining > 0) {
    return replyError(target, `You can work again in ${formatDuration(cooldownRemaining)}.`);
  }

  const { job, earned } = pickJob();
  userData.balance += earned;
  userData.lastWork = new Date();
  await userData.save();

  return replyWithCard(target, {
    title: 'Work Complete',
    description: `You worked as a **${job.name}** and earned **${formatCurrency(earned)}**.`,
    fields: [
      { name: 'Wallet', value: formatCurrency(userData.balance), inline: true },
      { name: 'Bank', value: formatCurrency(userData.bank), inline: true },
      { name: 'Next shift', value: 'Available in 1 hour', inline: true },
    ],
    footer: { text: 'Come back later to earn another payout.' },
  });
}

module.exports = {
  category: 'Economy',
  name: 'work',
  description: 'Work to earn money',
  slashOnly: false,

  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('Work to earn money'),

  async executePrefix(message) {
    try {
      await handleWork(message, message.author);
    } catch (error) {
      console.error('Work error:', error);
      await replyError(message, 'I could not complete your work payout right now.');
    }
  },

  async executeSlash(interaction) {
    try {
      await handleWork(interaction, interaction.user);
    } catch (error) {
      console.error('Work error:', error);
      await replyError(interaction, 'I could not complete your work payout right now.');
    }
  },
};
