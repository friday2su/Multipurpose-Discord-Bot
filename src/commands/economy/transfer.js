const { SlashCommandBuilder } = require('discord.js');
const { formatCurrency, getOrCreateUser } = require('../../utils/economy');
const { replyError, replyWithCard } = require('../../utils/respond');

async function transferFunds(sender, receiver, amount) {
  const senderData = await getOrCreateUser(sender);
  const receiverData = await getOrCreateUser(receiver);

  if (sender.id === receiver.id) {
    return { error: 'You cannot transfer money to yourself.' };
  }

  if (amount < 1) {
    return { error: 'Enter a valid amount greater than 0.' };
  }

  if (senderData.balance < amount) {
    return { error: `You only have ${formatCurrency(senderData.balance)} available in your wallet.` };
  }

  senderData.balance -= amount;
  receiverData.balance += amount;
  await senderData.save();
  await receiverData.save();

  return {
    senderData,
    receiverData,
  };
}

async function notifyReceiver(receiver, sender, amount) {
  try {
    await receiver.send(`You received **${formatCurrency(amount)}** from **${sender.username}**.`);
  } catch (error) {}
}

module.exports = {
  category: 'Economy',
  name: 'transfer',
  description: 'Transfer money to another user',
  slashOnly: false,

  data: new SlashCommandBuilder()
    .setName('transfer')
    .setDescription('Transfer money to another user')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user to transfer money to')
        .setRequired(true))
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setDescription('Amount to transfer')
        .setRequired(true)
        .setMinValue(1)),

  async executePrefix(message, args) {
    const receiver = message.mentions.users.first();
    const amount = Number.parseInt(args[1], 10);

    if (!receiver || Number.isNaN(amount)) {
      return replyError(message, 'Usage: `!transfer <user> <amount>`');
    }

    try {
      const result = await transferFunds(message.author, receiver, amount);
      if (result.error) {
        return replyError(message, result.error);
      }

      await notifyReceiver(receiver, message.author, amount);
      await replyWithCard(message, {
        title: 'Transfer Complete',
        description: `You sent **${formatCurrency(amount)}** to **${receiver.username}**.`,
        fields: [
          { name: 'Your wallet', value: formatCurrency(result.senderData.balance), inline: true },
          { name: `${receiver.username}'s wallet`, value: formatCurrency(result.receiverData.balance), inline: true },
        ],
      });
    } catch (error) {
      console.error('Transfer error:', error);
      await replyError(message, 'I could not complete that transfer right now.');
    }
  },

  async executeSlash(interaction) {
    const receiver = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    try {
      const result = await transferFunds(interaction.user, receiver, amount);
      if (result.error) {
        return replyError(interaction, result.error);
      }

      await notifyReceiver(receiver, interaction.user, amount);
      await replyWithCard(interaction, {
        title: 'Transfer Complete',
        description: `You sent **${formatCurrency(amount)}** to **${receiver.username}**.`,
        fields: [
          { name: 'Your wallet', value: formatCurrency(result.senderData.balance), inline: true },
          { name: `${receiver.username}'s wallet`, value: formatCurrency(result.receiverData.balance), inline: true },
        ],
      });
    } catch (error) {
      console.error('Transfer error:', error);
      await replyError(interaction, 'I could not complete that transfer right now.');
    }
  },
};
