const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
} = require('discord.js');
const { createCardMessage, replyError } = require('../../utils/respond');

const CATEGORY_ORDER = ['utility', 'info', 'moderation', 'fun', 'economy', 'music'];
const CATEGORY_META = {
  utility: { label: 'Utility', summary: 'Useful everyday tools' },
  info: { label: 'Info', summary: 'Server and user details' },
  moderation: { label: 'Moderation', summary: 'Admin and staff controls' },
  fun: { label: 'Fun', summary: 'Games and light commands' },
  economy: { label: 'Economy', summary: 'Balance, work, and shop' },
  music: { label: 'Music', summary: 'Playback and queue controls' },
};

function getInviteUrl(client) {
  return `https://discord.com/oauth2/authorize?client_id=${client.config.clientId}&scope=bot%20applications.commands&permissions=8`;
}

function getSupportUrl() {
  return process.env.SUPPORT_SERVER_URL || process.env.SUPPORT_URL || 'https://discord.gg/your-server';
}

function getVoteUrl(client) {
  return process.env.VOTE_URL || `https://top.gg/bot/${client.config.clientId}/vote`;
}

function getCommandsByMode(client, mode) {
  const commands = Array.from(client.commands.values());
  if (mode === 'prefix') {
    return commands.filter((command) => !command.slashOnly);
  }

  return commands.filter((command) => command.data);
}

function groupCommands(commands) {
  const grouped = {};

  for (const command of commands) {
    const key = String(command.category || 'other').toLowerCase();
    if (!grouped[key]) {
      grouped[key] = [];
    }

    grouped[key].push(command);
  }

  return grouped;
}

function formatCommandLine(command, mode, prefix) {
  const trigger = mode === 'prefix' ? `${prefix}${command.name}` : `/${command.data.name}`;
  return `\`${trigger}\` - ${command.description}`;
}

function createOverviewFields(groupedCommands) {
  const totalCommands = CATEGORY_ORDER.reduce(
    (count, key) => count + (groupedCommands[key]?.length || 0),
    0,
  );
  const activeCategories = CATEGORY_ORDER.filter((key) => groupedCommands[key]?.length);
  const categoryPreview = CATEGORY_ORDER
    .filter((key) => groupedCommands[key]?.length)
    .map((key) => `• **${CATEGORY_META[key].label}**: ${groupedCommands[key].length} commands`)
    .join('\n');

  return [
    {
      name: 'Overview',
      value: `• **${totalCommands} commands** ready to use\n• **${activeCategories.length} categories** to explore\n• Pick a category from the selector below to open the full command list\n\n${categoryPreview}`,
      inline: false,
    },
  ];
}

function createCommandField(commands, mode, prefix, categoryKey) {
  return {
    name: `${CATEGORY_META[categoryKey].label} Commands`,
    value: commands.map((command) => formatCommandLine(command, mode, prefix)).join('\n'),
    inline: false,
  };
}

function createSelectRow(groupedCommands, mode, userId, selectedCategory) {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`help-category:${mode}:${userId}`)
      .setPlaceholder('Choose a category')
      .addOptions([
        {
          label: 'Overview',
          description: 'See the category summary panel',
          value: 'overview',
          default: !selectedCategory,
        },
        ...CATEGORY_ORDER.filter((key) => groupedCommands[key]?.length).map((key) => ({
          label: CATEGORY_META[key].label,
          description: CATEGORY_META[key].summary,
          value: key,
          default: selectedCategory === key,
        })),
      ]),
  ).toJSON();
}

function createLinkRow(client) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('Invite')
      .setStyle(ButtonStyle.Link)
      .setURL(getInviteUrl(client)),
    new ButtonBuilder()
      .setLabel('Support Server')
      .setStyle(ButtonStyle.Link)
      .setURL(getSupportUrl()),
    new ButtonBuilder()
      .setLabel('Vote')
      .setStyle(ButtonStyle.Link)
      .setURL(getVoteUrl(client)),
  ).toJSON();
}

function createHelpPayload({ client, mode, selectedCategory, userId }) {
  const commands = getCommandsByMode(client, mode);
  const groupedCommands = groupCommands(commands);
  const prefix = client.config.prefix;
  const totalMembers = client.guilds.cache.reduce((count, guild) => count + (guild.memberCount || 0), 0);
  const embed = {
    title: 'Help Menu',
  };

  if (selectedCategory && groupedCommands[selectedCategory]?.length) {
    embed.thumbnail = {
      url: client.user.displayAvatarURL({ dynamic: true, size: 256 }),
    };
    embed.description = `Browsing **${CATEGORY_META[selectedCategory].label}** commands for ${mode} mode.`;
    embed.fields = [createCommandField(groupedCommands[selectedCategory], mode, prefix, selectedCategory)];
    embed.footer = { text: 'Use the select menu to switch categories.' };
  } else {
    embed.thumbnail = {
      url: client.user.displayAvatarURL({ dynamic: true, size: 256 }),
    };
    embed.description = [
      'Hey there.',
      `- Total commands: \`${commands.length}\``,
      `- Use ${mode === 'prefix' ? `\`${prefix}help <category>\`` : '`/help category:<name>`'} or the selector below to jump into a category`,
      `- Running in \`${client.guilds.cache.size}\` servers with \`${totalMembers}\` members`,
    ].join('\n');
    embed.fields = createOverviewFields(groupedCommands);
    embed.footer = { text: 'Choose a category from the menu to see its commands.' };
  }

  return createCardMessage(embed, {
    components: [
      createSelectRow(groupedCommands, mode, userId, selectedCategory),
      createLinkRow(client),
    ],
  });
}

module.exports = {
  category: 'Info',
  name: 'help',
  description: 'Show all available commands',
  slashOnly: false,

  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available commands')
    .addStringOption((option) =>
      option
        .setName('category')
        .setDescription('Filter commands by category')
        .addChoices(
          ...CATEGORY_ORDER.map((key) => ({
            name: CATEGORY_META[key].label,
            value: key,
          })),
        )),

  async executePrefix(message, args, client) {
    const selectedCategory = CATEGORY_ORDER.includes((args[0] || '').toLowerCase())
      ? args[0].toLowerCase()
      : null;

    await message.reply(
      createHelpPayload({
        client,
        mode: 'prefix',
        selectedCategory,
        userId: message.author.id,
      }),
    );
  },

  async executeSlash(interaction, client) {
    const selectedCategory = interaction.options.getString('category');
    await interaction.reply(
      createHelpPayload({
        client,
        mode: 'slash',
        selectedCategory,
        userId: interaction.user.id,
      }),
    );
  },

  async handleCategorySelect(interaction, client) {
    const [, mode, ownerId] = interaction.customId.split(':');

    if (interaction.user.id !== ownerId) {
      return replyError(interaction, 'Only the original user can use this help menu.', { ephemeral: true });
    }

    const selectedCategory = interaction.values[0] === 'overview' ? null : interaction.values[0];
    return interaction.update(
      createHelpPayload({
        client,
        mode,
        selectedCategory,
        userId: ownerId,
      }),
    );
  },
};

