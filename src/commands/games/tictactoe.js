const {
  SlashCommandBuilder,
  MessageFlags,
  TextDisplayBuilder,
  ContainerBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
} = require('discord.js');

module.exports = {
  category: 'Games',
  name: 'tictactoe',
  description: 'Play tic-tac-toe',
  slashOnly: false,

  data: new SlashCommandBuilder()
    .setName('tictactoe')
    .setDescription('Play tic-tac-toe')
    .addUserOption(option =>
      option
        .setName('opponent')
        .setDescription('User to play against')
        .setRequired(true)),

  async executePrefix(message, args, client) {
    const opponent = message.mentions.users.first();

    if (!opponent) {
      const errorText = new TextDisplayBuilder()
        .setContent('⚠️ Usage: `!tictactoe @user`\nExample: `!tictactoe @John`');

      const container = new ContainerBuilder()
        .addTextDisplayComponents(errorText);

      return message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [container],
      });
    }

    if (opponent.id === message.author.id) {
      const errorText = new TextDisplayBuilder()
        .setContent('⚠️ You cannot play against yourself!');

      const container = new ContainerBuilder()
        .addTextDisplayComponents(errorText);

      return message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [container],
      });
    }

    await message.reply(createTicTacToePayload(message.author, opponent));
  },

  async executeSlash(interaction, client) {
    const opponent = interaction.options.getUser('opponent');

    if (opponent.id === interaction.user.id) {
      const errorText = new TextDisplayBuilder()
        .setContent('⚠️ You cannot play against yourself!');

      const container = new ContainerBuilder()
        .addTextDisplayComponents(errorText);

      return interaction.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [container],
      });
    }

    await interaction.reply(createTicTacToePayload(interaction.user, opponent));
  }
};

function createTicTacToePayload(player1, player2) {
  const board = [
    ['1️⃣', '2️⃣', '3️⃣'],
    ['4️⃣', '5️⃣', '6️⃣'],
    ['7️⃣', '8️⃣', '9️⃣']
  ];

  let tttText = `# ⭕ Tic-Tac-Toe\n\n`;
  tttText += `**${player1.username}** (❌) vs **${player2.username}** (⭕)\n\n`;
  board.forEach(row => {
    tttText += row.join(' ') + '\n';
  });
  tttText += `\n*Game started! Use reactions 1-9 to make your move.*`;

  const textDisplay = new TextDisplayBuilder().setContent(tttText);

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
