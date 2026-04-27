const {
  SlashCommandBuilder,
  MessageFlags,
  TextDisplayBuilder,
  ContainerBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
} = require('discord.js');

module.exports = {
  category: 'Fun',
  name: 'fact',
  description: 'Get a random fun fact',
  slashOnly: false,

  data: new SlashCommandBuilder()
    .setName('fact')
    .setDescription('Get a random fun fact'),

  async executePrefix(message, args, client) {
    await message.reply(createFactPayload());
  },

  async executeSlash(interaction, client) {
    await interaction.reply(createFactPayload());
  }
};

const facts = [
  "Honey never spoils. Archaeologists have found 3000-year-old honey in Egyptian tombs that was still edible!",
  "A group of flamingos is called a 'flamboyance'.",
  "Octopuses have three hearts and blue blood.",
  "Bananas are berries, but strawberries aren't.",
  "The shortest war in history lasted only 38 minutes between Britain and Zanzibar in 1896.",
  "A day on Venus is longer than a year on Venus.",
  "Sharks have been around longer than trees.",
  "The unicorn is the national animal of Scotland.",
  "Wombat poop is cube-shaped.",
  "A single cloud can weigh more than 1 million pounds.",
  "The inventor of the Pringles can is now buried in one.",
  "Sea otters hold hands when they sleep to keep from drifting apart.",
  "The heart of a shrimp is located in its head.",
  "A snail can sleep for three years.",
  "The longest English word is 189,819 letters long and takes over 3 hours to pronounce.",
  "Cows have best friends and get stressed when separated.",
  "The world's oldest known recipe is for beer.",
  "Penguins propose to their mates with a pebble.",
  "A bolt of lightning is five times hotter than the surface of the sun.",
  "The fingerprints of koalas are so similar to humans that they have confused crime scenes."
];

function createFactPayload() {
  const fact = facts[Math.floor(Math.random() * facts.length)];

  let factText = `# 🧠 Fun Fact\n\n`;
  factText += `${fact}`;

  const textDisplay = new TextDisplayBuilder().setContent(factText);

  const separator = new SeparatorBuilder()
    .setDivider(true)
    .setSpacing(SeparatorSpacingSize.Small);

  const container = new ContainerBuilder()
    .addTextDisplayComponents(textDisplay)
    .addSeparatorComponents(separator);

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [container],
  };
}
