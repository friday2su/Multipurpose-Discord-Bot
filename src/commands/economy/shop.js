const { SlashCommandBuilder } = require('discord.js');
const { getShopItems } = require('../../utils/economy');
const { replyWithCard } = require('../../utils/respond');

function createShopCard(prefixLabel) {
  const shopItems = getShopItems();

  return {
    color: 0x00d26a,
    title: 'Server Shop',
    description: `Use \`${prefixLabel}buy <item>\` to purchase items.`,
    thumbnail: { url: 'https://cdn-icons-png.flaticon.com/512/3081/3081081.png' },
    fields: shopItems.map((item) => ({
      name: `${item.emoji} ${item.name}`,
      value: `Price: $${item.price}\n\`ID: ${item.id}\``,
      inline: true,
    })),
    footer: { text: `Use ${prefixLabel}buy <item_id> to purchase.` },
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  category: 'Economy',
  name: 'shop',
  description: 'View the server shop',
  slashOnly: false,

  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('View the server shop'),

  async executePrefix(message) {
    await replyWithCard(message, createShopCard('!'));
  },

  async executeSlash(interaction) {
    await replyWithCard(interaction, createShopCard('/'));
  },
};


