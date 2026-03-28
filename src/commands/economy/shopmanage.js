const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getShopItems } = require('../../utils/economy');
const { replyError, replyWithCard } = require('../../utils/respond');

function createCatalogCard(title) {
  return {
    color: 0x00d26a,
    title,
    fields: getShopItems().map((item) => ({
      name: `${item.emoji} ${item.name}`,
      value: `ID: ${item.id}\nPrice: $${item.price}`,
      inline: true,
    })),
    timestamp: new Date().toISOString(),
  };
}

function createPreviewCard(title, description, itemId, price) {
  return {
    color: 0x00d26a,
    title,
    description,
    fields: [
      { name: 'Item ID', value: itemId, inline: true },
      { name: 'Price', value: `$${price}`, inline: true },
    ],
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  category: 'Economy',
  name: 'shopmanage',
  description: 'Manage shop items (Admin only)',
  slashOnly: false,

  data: new SlashCommandBuilder()
    .setName('shopmanage')
    .setDescription('Manage shop items (Admin only)')
    .addStringOption((option) =>
      option
        .setName('action')
        .setDescription('Action to perform')
        .addChoices(
          { name: 'Add item', value: 'add' },
          { name: 'Remove item', value: 'remove' },
          { name: 'List items', value: 'list' },
        ))
    .addStringOption((option) =>
      option
        .setName('itemid')
        .setDescription('Item ID for remove action')
        .setRequired(false))
    .addStringOption((option) =>
      option
        .setName('itemname')
        .setDescription('Item name for add action')
        .setRequired(false))
    .addIntegerOption((option) =>
      option
        .setName('price')
        .setDescription('Item price for add action')
        .setMinValue(0)
        .setRequired(false))
    .addStringOption((option) =>
      option
        .setName('emoji')
        .setDescription('Item emoji for add action')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async executePrefix(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return replyError(message, 'You do not have permission to manage the shop.');
    }

    const action = args[0]?.toLowerCase();

    try {
      if (action === 'list') {
        return replyWithCard(message, createCatalogCard('Shop Catalog'));
      }

      if (action === 'add' && args.length >= 4) {
        const itemId = args[1];
        const itemName = args[2];
        const price = parseInt(args[3], 10);
        const emoji = args[4] || '📦';

        if (Number.isNaN(price) || price < 0) {
          return replyError(message, 'Please provide a valid non-negative price.');
        }

        return replyWithCard(
          message,
          createPreviewCard('Item Ready To Add', `${emoji} ${itemName}`, itemId, price),
        );
      }

      if (action === 'remove' && args[1]) {
        return replyWithCard(
          message,
          createPreviewCard('Item Ready To Remove', `Item with ID **${args[1]}** has been removed from the shop.`, args[1], 0),
        );
      }

      return replyError(message, 'Usage: `!shopmanage <add|remove|list> [itemid] [itemname] [price] [emoji]`');
    } catch (error) {
      console.error('Shopmanage error:', error);
      await replyError(message, 'I could not manage the shop right now.');
    }
  },

  async executeSlash(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return replyError(interaction, 'You do not have permission to manage the shop.');
    }

    const action = interaction.options.getString('action');

    try {
      if (action === 'list') {
        return replyWithCard(interaction, createCatalogCard('Shop Catalog'));
      }

      if (action === 'add') {
        const itemId = interaction.options.getString('itemid');
        const itemName = interaction.options.getString('itemname');
        const price = interaction.options.getInteger('price');
        const emoji = interaction.options.getString('emoji') || '📦';

        if (!itemId || !itemName || price === null) {
          return replyError(interaction, 'Please provide the item ID, name, and price.');
        }

        return replyWithCard(
          interaction,
          createPreviewCard('Item Ready To Add', `${emoji} ${itemName}`, itemId, price),
        );
      }

      if (action === 'remove') {
        const itemId = interaction.options.getString('itemid');
        if (!itemId) {
          return replyError(interaction, 'Please provide an item ID to remove.');
        }

        return replyWithCard(
          interaction,
          createPreviewCard('Item Ready To Remove', `Item with ID **${itemId}** has been removed from the shop.`, itemId, 0),
        );
      }

      return replyError(interaction, 'Please choose a valid shop action.');
    } catch (error) {
      console.error('Shopmanage error:', error);
      await replyError(interaction, 'I could not manage the shop right now.');
    }
  },
};


