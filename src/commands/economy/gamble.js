const { SlashCommandBuilder } = require('discord.js');
const { formatCurrency, getOrCreateUser } = require('../../utils/economy');
const { replyError, replyWithCard } = require('../../utils/respond');

function runGame(type, guess) {
  switch (type) {
    case 'coin': {
      const coin = Math.random() < 0.5 ? 'heads' : 'tails';
      return {
        won: coin === 'heads',
        multiplier: 2,
        summary: `Coin flip: **${coin.toUpperCase()}**`,
      };
    }
    case 'slots': {
      const symbols = ['🍒', '🍋', '🍊', '🍇', '💎', '7'];
      const rolls = Array.from({ length: 3 }, () => symbols[Math.floor(Math.random() * symbols.length)]);
      const won = rolls[0] === rolls[1] && rolls[1] === rolls[2];
      const multiplier = won ? (rolls[0] === '💎' ? 10 : rolls[0] === '7' ? 20 : 5) : 0;
      return {
        won,
        multiplier,
        summary: `Slots: **${rolls.join(' | ')}**`,
      };
    }
    case 'number': {
      if (!guess || guess < 1 || guess > 10) {
        return { error: 'Choose a guess from 1 to 10 for the number game.' };
      }

      const winningNumber = Math.floor(Math.random() * 10) + 1;
      return {
        won: winningNumber === guess,
        multiplier: 5,
        summary: `Your guess: **${guess}** • Winning number: **${winningNumber}**`,
      };
    }
    case 'dice':
    default: {
      const roll = Math.floor(Math.random() * 6) + 1;
      return {
        won: roll >= 4,
        multiplier: 2,
        summary: `Dice roll: **${roll}**`,
      };
    }
  }
}

async function handleGamble(target, user, amount, type, guess) {
  const userData = await getOrCreateUser(user);
  if (userData.balance < amount) {
    return replyError(target, `You need ${formatCurrency(amount)}, but you only have ${formatCurrency(userData.balance)}.`);
  }

  const result = runGame(type, guess);
  if (result.error) {
    return replyError(target, result.error);
  }

  userData.balance -= amount;
  if (result.won) {
    userData.balance += amount * result.multiplier;
  }
  await userData.save();

  return replyWithCard(target, {
    title: result.won ? 'You Won' : 'You Lost',
    description: result.summary,
    fields: [
      { name: 'Wager', value: formatCurrency(amount), inline: true },
      { name: 'Payout', value: result.won ? formatCurrency(amount * result.multiplier) : formatCurrency(0), inline: true },
      { name: 'Wallet', value: formatCurrency(userData.balance), inline: true },
    ],
    footer: { text: result.won ? `${type} paid out successfully.` : 'Better luck on the next round.' },
  });
}

module.exports = {
  category: 'Economy',
  name: 'gamble',
  description: 'Gamble your money for a chance to win more',
  slashOnly: false,

  data: new SlashCommandBuilder()
    .setName('gamble')
    .setDescription('Gamble your money for a chance to win more')
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setDescription('Amount to gamble')
        .setRequired(true)
        .setMinValue(10)
        .setMaxValue(10000))
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription('Type of gambling game')
        .addChoices(
          { name: 'Dice Roll', value: 'dice' },
          { name: 'Coin Flip', value: 'coin' },
          { name: 'Slot Machine', value: 'slots' },
          { name: 'Number Guess', value: 'number' },
        ))
    .addIntegerOption((option) =>
      option
        .setName('number')
        .setDescription('Your guess (1-10, number game only)')
        .setMinValue(1)
        .setMaxValue(10)),

  async executePrefix(message, args) {
    const amount = Number.parseInt(args[0], 10);
    const type = args[1]?.toLowerCase() || 'dice';
    const guess = Number.parseInt(args[2], 10);

    if (Number.isNaN(amount)) {
      return replyError(message, 'Usage: `!gamble <amount> [dice|coin|slots|number] [guess]`');
    }

    try {
      await handleGamble(message, message.author, amount, type, guess);
    } catch (error) {
      console.error('Gamble error:', error);
      await replyError(message, 'I could not finish that gamble right now.');
    }
  },

  async executeSlash(interaction) {
    try {
      await handleGamble(
        interaction,
        interaction.user,
        interaction.options.getInteger('amount'),
        interaction.options.getString('type') || 'dice',
        interaction.options.getInteger('number'),
      );
    } catch (error) {
      console.error('Gamble error:', error);
      await replyError(interaction, 'I could not finish that gamble right now.');
    }
  },
};
