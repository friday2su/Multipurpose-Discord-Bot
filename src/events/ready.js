const { loadCommands } = require('../utils/handler');
const { REST, Routes } = require('discord.js');
const chalk = require('chalk');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(chalk.blue.bold(`✓ Logged in as ${client.user.tag}`));
    console.log(chalk.blue.bold(`✓ Ready to serve in ${client.guilds.cache.size} servers`));

    client.config = require('../config');
    client.commands = new Map();
    client.slashCommands = new Map();
    client.riffy.init(client.user.id);

    loadCommands(client);

    const slashCommands = [];
    client.slashCommands.forEach(command => {
      slashCommands.push(command.data.toJSON());
    });

    const rest = new REST({ version: '10' }).setToken(client.config.token);

    try {
      console.log('⏳ Refreshing global application (/) commands...');

      await rest.put(
        Routes.applicationCommands(client.config.clientId),
        { body: slashCommands }
      );

      console.log(chalk.green.bold('✓ Successfully reloaded global application (/) commands'));
      console.log(chalk.yellow('Slash commands were refreshed. Global propagation can still take some time.'));
    } catch (error) {
      console.error(chalk.red.bold('✗ Error reloading global application (/) commands:'), error);
    }

    client.user.setActivity(`${client.config.prefix}help | /help`, { type: 'WATCHING' });
  }
};



