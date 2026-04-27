const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
  TextDisplayBuilder,
  ContainerBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
} = require('discord.js');

module.exports = {
  category: 'Moderation',
  name: 'removerole',
  description: 'Remove a role from a member',
  slashOnly: false,

  data: new SlashCommandBuilder()
    .setName('removerole')
    .setDescription('Remove a role from a member')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user to remove role from')
        .setRequired(true))
    .addRoleOption(option =>
      option
        .setName('role')
        .setDescription('The role to remove')
        .setRequired(true))
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('Reason for removing role')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async executePrefix(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return message.reply(createErrorPayload('You need Manage Roles permission to use this command.'));
    }

    const member = message.mentions.members.first();
    const role = message.mentions.roles.first();
    const reason = args.slice(2).join(' ') || 'No reason provided';

    if (!member) {
      return message.reply(createErrorPayload('Please mention a user.'));
    }

    if (!role) {
      return message.reply(createErrorPayload('Please mention a role.'));
    }

    if (role.position >= message.guild.members.me.roles.highest.position) {
      return message.reply(createErrorPayload('I cannot manage this role due to role hierarchy.'));
    }

    if (role.position >= message.member.roles.highest.position) {
      return message.reply(createErrorPayload('You cannot manage this role due to role hierarchy.'));
    }

    if (!member.roles.cache.has(role.id)) {
      return message.reply(createErrorPayload('User does not have this role.'));
    }

    try {
      await member.roles.remove(role, reason);
      await message.reply(createRemoveRolePayload(member.user, role, message.author, reason));
    } catch (error) {
      await message.reply(createErrorPayload(`Failed to remove role: ${error.message}`));
    }
  },

  async executeSlash(interaction, client) {
    const member = interaction.options.getMember('user');
    const role = interaction.options.getRole('role');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!member) {
      return interaction.reply(createErrorPayload('User not found in this server.'));
    }

    if (role.position >= interaction.guild.members.me.roles.highest.position) {
      return interaction.reply(createErrorPayload('I cannot manage this role due to role hierarchy.'));
    }

    if (role.position >= interaction.member.roles.highest.position) {
      return interaction.reply(createErrorPayload('You cannot manage this role due to role hierarchy.'));
    }

    if (!member.roles.cache.has(role.id)) {
      return interaction.reply(createErrorPayload('User does not have this role.'));
    }

    try {
      await member.roles.remove(role, reason);
      await interaction.reply(createRemoveRolePayload(member.user, role, interaction.user, reason));
    } catch (error) {
      await interaction.reply(createErrorPayload(`Failed to remove role: ${error.message}`));
    }
  }
};

function createRemoveRolePayload(user, role, moderator, reason) {
  let roleText = `# ➖ Role Removed\n\n`;
  roleText += `**User:** ${user.tag}\n`;
  roleText += `**Role:** ${role.name}\n`;
  roleText += `**Moderator:** ${moderator.tag}\n`;
  roleText += `**Reason:** ${reason}`;

  const textDisplay = new TextDisplayBuilder().setContent(roleText);

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

function createErrorPayload(message) {
  const textDisplay = new TextDisplayBuilder().setContent(`⚠️ ${message}`);
  const container = new ContainerBuilder().addTextDisplayComponents(textDisplay);

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [container],
  };
}
