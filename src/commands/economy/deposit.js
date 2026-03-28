const { SlashCommandBuilder } = require('discord.js');
const {
  formatCurrency,
  getNetWorth,
  getOrCreateUser,
  resolveAmountInput,
} = require('../../utils/economy');
const { replyError, replyWithCard } = require('../../utils/respond');

async function handleDeposit(target, user, rawInput) {
  const userData = await getOrCreateUser(user);
  const amount = resolveAmountInput(rawInput, userData.balance);

  if (!amount) {
    return replyError(target, 'Enter a valid amount or use `all` / `half`.');
  }

  if (userData.balance < amount) {
    return replyError(target, `You only have ${formatCurrency(userData.balance)} in your wallet.`);
  }

  userData.balance -= amount;
  userData.bank += amount;
  await userData.save();

  return replyWithCard(target, {
    title: 'Deposit Complete',
    description: `Moved **${formatCurrency(amount)}** into your bank.`,
    fields: [
      { name: 'Wallet', value: formatCurrency(userData.balance), inline: true },
      { name: 'Bank', value: formatCurrency(userData.bank), inline: true },
      { name: 'Net worth', value: formatCurrency(getNetWorth(userData)), inline: true },
    ],
    footer: { text: 'Banked money is safer than wallet cash.' },
  });
}

module.exports = {
  category: 'Economy',
  name: 'deposit',
  description: 'Deposit money from wallet to bank',
  slashOnly: false,

  data: new SlashCommandBuilder()
    .setName('deposit')
    .setDescription('Deposit money from wallet to bank')
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setDescription('Amount to deposit')
        .setMinValue(1))
    .addStringOption((option) =>
      option
        .setName('action')
        .setDescription('Quick deposit amount')
        .addChoices(
          { name: 'All money', value: 'all' },
          { name: 'Half money', value: 'half' },
        )),

  async executePrefix(message, args) {
    try {
      await handleDeposit(message, message.author, args[0]);
    } catch (error) {
      console.error('Deposit error:', error);
      await replyError(message, 'I could not move that money into your bank.');
    }
  },

  async executeSlash(interaction) {
    try {
      const input = interaction.options.getString('action') || interaction.options.getInteger('amount');
      await handleDeposit(interaction, interaction.user, input);
    } catch (error) {
      console.error('Deposit error:', error);
      await replyError(interaction, 'I could not move that money into your bank.');
    }
  },
};
