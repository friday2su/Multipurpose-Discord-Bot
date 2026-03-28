const { replyError } = require('../utils/respond');

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot) return;
    if (!message.guild) return;

    const config = client.config || require('../config');
    const prefix = config.prefix;

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);

    if (!command || command.slashOnly) return;

    try {
      await command.executePrefix(message, args, client);
    } catch (error) {
      console.error('Error executing prefix command:', error);
      await replyError(message, 'Something went wrong while running that command. Please try again in a moment.');
    }
  }
};


