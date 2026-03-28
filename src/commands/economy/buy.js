const { SlashCommandBuilder } = require('discord.js');
const { getOrCreateUser, getShopItemMap } = require('../../utils/economy');
const { replyError, replyWithCard } = require('../../utils/respond');

async function handlePurchase(targetUser, itemId, quantity) {
  const userData = await getOrCreateUser(targetUser);
  const item = getShopItemMap()[itemId.toLowerCase()];

  if (!item) {
    return { error: 'That item is not in the shop right now.' };
  }

  const totalPrice = item.price * quantity;

  if (userData.balance < totalPrice) {
    return { error: `You need $${totalPrice} for that purchase, but you only have $${userData.balance}.` };
  }

  if (!userData.inventory) {
    userData.inventory = [];
  }

  const existingItem = userData.inventory.find((entry) => entry.itemId === item.id);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    userData.inventory.push({
      itemId: item.id,
      name: item.displayName,
      quantity,
    });
  }

  userData.balance -= totalPrice;
  await userData.save();

  return {
    item,
    quantity,
    totalPrice,
    remainingBalance: userData.balance,
  };
}

function createPurchaseCard(result, inventoryCommand) {
  return {
    color: 0x00d26a,
    title: 'Purchase Complete',
    description: `Added **${result.quantity}x ${result.item.displayName}** to your inventory.`,
    fields: [
      { name: 'Total cost', value: `$${result.totalPrice}`, inline: true },
      { name: 'New balance', value: `$${result.remainingBalance.toLocaleString()}`, inline: true },
      { name: 'Quantity', value: `${result.quantity}`, inline: true },
    ],
    footer: { text: `Use ${inventoryCommand} to review your inventory.` },
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  category: 'Economy',
  name: 'buy',
  description: 'Buy an item from the shop',
  slashOnly: false,

  data: new SlashCommandBuilder()
    .setName('buy')
    .setDescription('Buy an item from the shop')
    .addStringOption((option) =>
      option
        .setName('item')
        .setDescription('The item ID to buy')
        .setRequired(true))
    .addIntegerOption((option) =>
      option
        .setName('quantity')
        .setDescription('Quantity to buy (default: 1)')
        .setMinValue(1)
        .setMaxValue(10)),

  async executePrefix(message, args) {
    if (!args[0]) {
      return replyError(message, 'Choose an item to buy first. Use `!shop` to browse the catalog.');
    }

    try {
      const result = await handlePurchase(message.author, args[0], parseInt(args[1], 10) || 1);

      if (result.error) {
        return replyError(message, result.error);
      }

      await replyWithCard(message, createPurchaseCard(result, '!inventory'));
    } catch (error) {
      console.error('Buy error:', error);
      await replyError(message, 'I could not finish that purchase right now.');
    }
  },

  async executeSlash(interaction) {
    try {
      const result = await handlePurchase(
        interaction.user,
        interaction.options.getString('item'),
        interaction.options.getInteger('quantity') || 1,
      );

      if (result.error) {
        return replyError(interaction, result.error);
      }

      await replyWithCard(interaction, createPurchaseCard(result, '/inventory'));
    } catch (error) {
      console.error('Buy error:', error);
      await replyError(interaction, 'I could not finish that purchase right now.');
    }
  },
};


