const { SlashCommandBuilder } = require('discord.js');
const { getOrCreateUser } = require('../../utils/economy');
const { replyError, replyWithCard } = require('../../utils/respond');

function createInventoryCard(username, inventory, commandHint) {
  return {
    title: `${username}'s Inventory`,
    description: `You currently have **${inventory.reduce((count, item) => count + item.quantity, 0)}** total items.`,
    fields: inventory.map((item) => ({
      name: item.name,
      value: `Quantity: **${item.quantity}**\nID: \`${item.itemId}\``,
      inline: false,
    })),
    footer: { text: `Use ${commandHint} to browse the shop for more items.` },
  };
}

async function handleInventory(target, user, commandHint) {
  const userData = await getOrCreateUser(user);

  if (!userData.inventory?.length) {
    return replyError(target, `Your inventory is empty. Use \`${commandHint}\` to buy something first.`);
  }

  return replyWithCard(target, createInventoryCard(user.username, userData.inventory, commandHint));
}

module.exports = {
  category: 'Economy',
  name: 'inventory',
  description: 'View your inventory',
  slashOnly: false,

  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('View your inventory'),

  async executePrefix(message) {
    try {
      await handleInventory(message, message.author, '!shop');
    } catch (error) {
      console.error('Inventory error:', error);
      await replyError(message, 'I could not load your inventory right now.');
    }
  },

  async executeSlash(interaction) {
    try {
      await handleInventory(interaction, interaction.user, '/shop');
    } catch (error) {
      console.error('Inventory error:', error);
      await replyError(interaction, 'I could not load your inventory right now.');
    }
  },
};
