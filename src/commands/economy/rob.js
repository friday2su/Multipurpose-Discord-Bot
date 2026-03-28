const { SlashCommandBuilder } = require('discord.js');
const {
  formatCurrency,
  formatDuration,
  getCooldownRemaining,
  getOrCreateUser,
} = require('../../utils/economy');
const { replyError, replyWithCard } = require('../../utils/respond');

const ROB_COOLDOWN = 30 * 60 * 1000;

async function notifyVictim(victim, robber, amount) {
  try {
    await victim.send(`You were robbed by **${robber.username}** and lost **${formatCurrency(amount)}**.`);
  } catch (error) {}
}

async function handleRob(target, robber, victim, amount) {
  if (robber.id === victim.id) {
    return replyError(target, 'You cannot rob yourself.');
  }

  if (victim.bot) {
    return replyError(target, 'You cannot rob bot accounts.');
  }

  const robberData = await getOrCreateUser(robber);
  const victimData = await getOrCreateUser(victim);
  const cooldownRemaining = getCooldownRemaining(robberData.lastRob, ROB_COOLDOWN);

  if (cooldownRemaining > 0) {
    return replyError(target, `You can rob again in ${formatDuration(cooldownRemaining)}.`);
  }

  if (victimData.balance < 50) {
    return replyError(target, `${victim.username} does not have enough cash to rob.`);
  }

  robberData.lastRob = new Date();

  let successChance = 30;
  if (victimData.balance < 200) successChance = 42;
  else if (victimData.balance < 500) successChance = 36;
  else if (victimData.balance > 5000) successChance = 18;
  else if (victimData.balance > 2000) successChance = 24;

  const success = Math.random() * 100 < successChance;

  if (success) {
    const stolen = Math.max(50, Math.min(amount, Math.floor(victimData.balance * 0.3)));
    victimData.balance -= stolen;
    robberData.balance += stolen;
    await robberData.save();
    await victimData.save();
    await notifyVictim(victim, robber, stolen);

    return replyWithCard(target, {
      title: 'Robbery Successful',
      description: `You stole **${formatCurrency(stolen)}** from **${victim.username}**.`,
      fields: [
        { name: 'Your wallet', value: formatCurrency(robberData.balance), inline: true },
        { name: 'Target wallet', value: formatCurrency(victimData.balance), inline: true },
        { name: 'Success chance', value: `${successChance}%`, inline: true },
      ],
    });
  }

  const penalty = Math.floor(amount * 0.5);
  robberData.balance = Math.max(0, robberData.balance - penalty);
  await robberData.save();

  return replyWithCard(target, {
    title: 'Robbery Failed',
    description: `You were caught trying to rob **${victim.username}**.`,
    fields: [
      { name: 'Fine paid', value: formatCurrency(penalty), inline: true },
      { name: 'Your wallet', value: formatCurrency(robberData.balance), inline: true },
      { name: 'Success chance', value: `${successChance}%`, inline: true },
    ],
    footer: { text: 'Try again later once your cooldown ends.' },
  });
}

module.exports = {
  category: 'Economy',
  name: 'rob',
  description: 'Attempt to rob another user',
  slashOnly: false,

  data: new SlashCommandBuilder()
    .setName('rob')
    .setDescription('Attempt to rob another user')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user to rob')
        .setRequired(true))
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setDescription('Amount to attempt to rob')
        .setMinValue(10)
        .setMaxValue(1000)),

  async executePrefix(message, args) {
    const victim = message.mentions.users.first();
    const amount = Number.parseInt(args[1], 10) || Math.floor(Math.random() * 500) + 100;

    if (!victim) {
      return replyError(message, 'Usage: `!rob <user> [amount]`');
    }

    try {
      await handleRob(message, message.author, victim, amount);
    } catch (error) {
      console.error('Rob error:', error);
      await replyError(message, 'I could not process that robbery right now.');
    }
  },

  async executeSlash(interaction) {
    try {
      await handleRob(
        interaction,
        interaction.user,
        interaction.options.getUser('user'),
        interaction.options.getInteger('amount') || Math.floor(Math.random() * 500) + 100,
      );
    } catch (error) {
      console.error('Rob error:', error);
      await replyError(interaction, 'I could not process that robbery right now.');
    }
  },
};
