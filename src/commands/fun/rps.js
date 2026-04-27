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
  name: 'rps',
  description: 'Play rock paper scissors',
  slashOnly: false,

  data: new SlashCommandBuilder()
    .setName('rps')
    .setDescription('Play rock paper scissors')
    .addStringOption(option =>
      option
        .setName('choice')
        .setDescription('Your choice')
        .setRequired(true)
        .addChoices(
          { name: 'Rock', value: 'rock' },
          { name: 'Paper', value: 'paper' },
          { name: 'Scissors', value: 'scissors' }
        )),

  async executePrefix(message, args, client) {
    if (args.length === 0) {
      const errorText = new TextDisplayBuilder()
        .setContent('⚠️ Usage: `!rps <rock|paper|scissors>`\nExample: `!rps rock`');

      const container = new ContainerBuilder()
        .addTextDisplayComponents(errorText);

      return message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [container],
      });
    }

    const choice = args[0].toLowerCase();

    if (!['rock', 'paper', 'scissors'].includes(choice)) {
      const errorText = new TextDisplayBuilder()
        .setContent('⚠️ Invalid choice! Choose: rock, paper, or scissors');

      const container = new ContainerBuilder()
        .addTextDisplayComponents(errorText);

      return message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [container],
      });
    }

    await message.reply(createRPSPayload(choice));
  },

  async executeSlash(interaction, client) {
    const choice = interaction.options.getString('choice');
    await interaction.reply(createRPSPayload(choice));
  }
};

function createRPSPayload(userChoice) {
  const choices = ['rock', 'paper', 'scissors'];
  const botChoice = choices[Math.floor(Math.random() * choices.length)];

  const emojis = {
    rock: '🪨',
    paper: '📄',
    scissors: '✂️'
  };

  let result;
  if (userChoice === botChoice) {
    result = "It's a tie!";
  } else if (
    (userChoice === 'rock' && botChoice === 'scissors') ||
    (userChoice === 'paper' && botChoice === 'rock') ||
    (userChoice === 'scissors' && botChoice === 'paper')
  ) {
    result = 'You win!';
  } else {
    result = 'You lose!';
  }

  let rpsText = `# ${emojis[userChoice]} Rock Paper Scissors\n\n`;
  rpsText += `**Your choice:** ${emojis[userChoice]} ${userChoice}\n`;
  rpsText += `**Bot's choice:** ${emojis[botChoice]} ${botChoice}\n\n`;
  rpsText += `**Result:** **${result}**`;

  const textDisplay = new TextDisplayBuilder().setContent(rpsText);

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
