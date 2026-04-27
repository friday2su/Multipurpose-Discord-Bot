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
  name: 'wouldyourather',
  description: 'Get a would you rather question',
  slashOnly: false,

  data: new SlashCommandBuilder()
    .setName('wouldyourather')
    .setDescription('Get a would you rather question'),

  async executePrefix(message, args, client) {
    await message.reply(createWouldYouRatherPayload());
  },

  async executeSlash(interaction, client) {
    await interaction.reply(createWouldYouRatherPayload());
  }
};

const questions = [
  { option1: "Have the ability to fly", option2: "Have the ability to become invisible" },
  { option1: "Live without music", option2: "Live without movies" },
  { option1: "Be able to speak all languages", option2: "Be able to talk to animals" },
  { option1: "Have unlimited money", option2: "Have unlimited time" },
  { option1: "Always be 10 minutes late", option2: "Always be 20 minutes early" },
  { option1: "Fight 100 duck-sized horses", option2: "Fight 1 horse-sized duck" },
  { option1: "Never use social media again", option2: "Never watch another movie or TV show" },
  { option1: "Be able to teleport anywhere", option2: "Be able to read minds" },
  { option1: "Live in the past", option2: "Live in the future" },
  { option1: "Have a rewind button for your life", option2: "Have a pause button for your life" },
  { option1: "Be famous but poor", option2: "Be rich but unknown" },
  { option1: "Never eat your favorite food again", option2: "Only eat your favorite food" },
  { option1: "Have super strength", option2: "Have super speed" },
  { option1: "Live without the internet", option2: "Live without air conditioning/heating" },
  { option1: "Always say what you think", option2: "Never speak again" }
];

function createWouldYouRatherPayload() {
  const question = questions[Math.floor(Math.random() * questions.length)];

  let wyrText = `# 🤔 Would You Rather?\n\n`;
  wyrText += `**Option A:** ${question.option1}\n\n`;
  wyrText += `**Option B:** ${question.option2}\n\n`;
  wyrText += `*React with 🅰️ or 🅱️ to vote!*`;

  const textDisplay = new TextDisplayBuilder().setContent(wyrText);

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
