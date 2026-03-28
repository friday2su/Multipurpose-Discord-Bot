const { replyError } = require('../utils/respond');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (interaction.isStringSelectMenu() && interaction.customId.startsWith('help-category:')) {
      const helpCommand = client.slashCommands.get('help') || client.commands.get('help');

      if (!helpCommand?.handleCategorySelect) return;

      try {
        await helpCommand.handleCategorySelect(interaction, client);
      } catch (error) {
        console.error('Error handling help menu selection:', error);
        await replyError(interaction, 'I could not update the help menu right now.');
      }

      return;
    }

    if (!interaction.isChatInputCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.executeSlash(interaction, client);
    } catch (error) {
      console.error('Error executing slash command:', error);
      await replyError(interaction, 'Something went wrong while running that command. Please try again in a moment.');
    }
  }
};


