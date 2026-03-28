const { SlashCommandBuilder } = require('discord.js');
const {
  formatCurrency,
  getNetWorth,
  getOrCreateUser,
  resolveAmountInput,
} = require('../../utils/economy');
const { replyError, replyWithCard } = require('../../utils/respond');

async function handleWithdraw(target, user, rawInput) {
  const userData = await getOrCreateUser(user);
  const amount = resolveAmountInput(rawInput, userData.bank);

  if (!amount) {
    return replyError(target, 'Enter a valid amount or use `all` / `half`.');
  }

  if (userData.bank < amount) {
    return replyError(target, `You only have ${formatCurrency(userData.bank)} in your bank.`);
  }

  userData.bank -= amount;
  userData.balance += amount;
  await userData.save();

  return replyWithCard(target, {
    title: 'Withdrawal Complete',
    description: `Moved **${formatCurrency(amount)}** back into your wallet.`,
    fields: [
      { name: 'Wallet', value: formatCurrency(userData.balance), inline: true },
      { name: 'Bank', value: formatCurrency(userData.bank), inline: true },
      { name: 'Net worth', value: formatCurrency(getNetWorth(userData)), inline: true },
    ],
    footer: { text: 'Wallet cash is available immediately, but it is less secure.' },
  });
}

module.exports = {
  category: 'Economy',
  name: 'withdraw',
  description: 'Withdraw money from bank to wallet',
  slashOnly: false,

  data: new SlashCommandBuilder()
    .setName('withdraw')
    .setDescription('Withdraw money from bank to wallet')
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setDescription('Amount to withdraw')
        .setMinValue(1))
    .addStringOption((option) =>
      option
        .setName('action')
        .setDescription('Quick withdraw amount')
        .addChoices(
          { name: 'All money', value: 'all' },
          { name: 'Half money', value: 'half' },
        )),

  async executePrefix(message, args) {
    try {
      await handleWithdraw(message, message.author, args[0]);
    } catch (error) {
      console.error('Withdraw error:', error);
      await replyError(message, 'I could not move that money into your wallet.');
    }
  },

  async executeSlash(interaction) {
    try {
      const input = interaction.options.getString('action') || interaction.options.getInteger('amount');
      await handleWithdraw(interaction, interaction.user, input);
    } catch (error) {
      console.error('Withdraw error:', error);
      await replyError(interaction, 'I could not move that money into your wallet.');
    }
  },
};
