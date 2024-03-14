const {
    Client,
    Interaction,
    ApplicationCommandOptionType,
    PermissionFlagsBits,
  } = require('discord.js');
  
  module.exports = {
    /**
     *
     * @param {Client} client
     * @param {Interaction} interaction
     */
  
    callback: async (client, interaction) => {
      let DBD = require('discord-dashboard');
      const Handler = new DBD.Handler(); 
      const { Category, Option } = Handler; 
      const guardianlog = await Handler.fetch(interaction.guild.id, 'guardianlog');
      const staffteamrole = await Handler.fetch(interaction.guild.id, 'staffteam');

      const targetUserId = interaction.options.get('user').value;
      const reason =
        interaction.options.get('reason')?.value || 'No reason provided';
  
      await interaction.deferReply();
  
      const targetUser = await interaction.guild.members.fetch(targetUserId);
  
      if (!interaction.member.roles.cache.has(staffteamrole)){
        await interaction.editReply({ content: 'You do not have permission to kick users.', ephemeral: true });
        return;
      }
  
      if (!targetUser) {
        await interaction.editReply("That user doesn't exist in this server.");
        return;
      }
  
      if (targetUser.id === interaction.guild.ownerId) {
        await interaction.editReply(
          "You can't kick that user because they're the server owner."
        );
        return;
      }
  
      const targetUserRolePosition = targetUser.roles.highest.position; // Highest role of the target user
      const requestUserRolePosition = interaction.member.roles.highest.position; // Highest role of the user running the cmd
      const botRolePosition = interaction.guild.members.me.roles.highest.position; // Highest role of the bot
  
      if (targetUserRolePosition >= requestUserRolePosition) {
        await interaction.editReply(
          "You can't kick that user because they have the same/higher role than you."
        );
        return;
      }
  
      if (targetUserRolePosition >= botRolePosition) {
        await interaction.editReply(
          "I can't kick that user because they have the same/higher role than me."
        );
        return;
      }
  
      // Ban the targetUser
      try {
        await targetUser.kick({ reason });
        await interaction.editReply(
          `User ${targetUser} was kick\nReason: ${reason}`
        );
  
        const server = interaction.guild;
        const { EmbedBuilder } = require('discord.js');
        const config = require('../../../config.json');
        const channel = interaction.channel.guild.channels.cache.find((channel) => channel.id === guardianlog);
        if (channel) {
          const FlaggedMessage = new EmbedBuilder()
            .setColor(0xA0000C)
            .setTitle('Atlas Guardian Engaged')
            .setDescription(`Atlas Guardian was triggered due to a user being kicked.`)
            .setTimestamp()
            .addFields(
              { name: 'Event Triggered 📩', value: `\`\`\`User Kicked\`\`\``, inline: false },
              { name: 'User 🏳️‍🌈', value: `${targetUser.user}`, inline: true },
              { name: 'Moderator 👑', value: `${interaction.user}`, inline: true },
              { name: 'Action Preformed At ⏰', value: `<t:${Math.round(interaction.createdTimestamp / 1000)}>`, inline: true },
              { name: 'Reason ❔', value: `\`\`\`${reason}\`\`\``, inline: false },
              { name: 'Preformed In Discord 🏠', value: `\`\`\`${server.name}\`\`\``, inline: false },
            )
            .setFooter({ text: 'Atlas Guardian™', iconURL: 'https://i.imgur.com/YDoaTUD.png' });
  
          channel.send({ embeds: [FlaggedMessage] });
        } else {
          // No channel found
          console.log("No Channel Found");
        }
      } catch (error) {
        console.log(`There was an error when banning: ${error}`);
      }
    },
  
    name: 'kick',
    description: 'kicks a member from this server.',
    options: [
      {
        name: 'user',
        description: 'The user you want to kick.',
        type: ApplicationCommandOptionType.Mentionable,
        required: true,
      },
      {
        name: 'reason',
        description: 'The reason you want to kick.',
        type: ApplicationCommandOptionType.String,
      },
    ],
    botPermissions: [PermissionFlagsBits.BanMembers],
  };