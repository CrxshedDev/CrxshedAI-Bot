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
      const targetRoleId = interaction.options.get('role').value;
  
      await interaction.deferReply();
  
      const targetUser = await interaction.guild.members.fetch(targetUserId);
      const TargetRole = await interaction.guild.roles.fetch(targetRoleId);
  
      if (!interaction.member.roles.cache.has(staffteamrole)){
        ErrorReply("AtlasGuard Error", `You do not have permission to Add Roles.`, 0xA0000C)
        return;
      } 

      if (targetUser.roles.cache.has(TargetRole.id)){
        ErrorReply("AtlasGuard Error", `That user already has that role`, 0xA0000C)
        return;
      }
    
      if (!targetUser) {
        ErrorReply("AtlasGuard Error", `That user doesn't exist in this server.`, 0xA0000C)
        return;
      }
  
      if (targetUser.id === interaction.guild.ownerId) {
        ErrorReply("AtlasGuard Error", `You can't Add Roles that user because they're the server owner.`, 0xA0000C)
        return;
      }
  
      const targetUserRolePosition = targetUser.roles.highest.position; // Highest role of the target user
      const requestUserRolePosition = interaction.member.roles.highest.position; // Highest role of the user running the cmd
      const botRolePosition = interaction.guild.members.me.roles.highest.position; // Highest role of the bot
  
      if (targetUserRolePosition >= requestUserRolePosition) {
        ErrorReply("AtlasGuard Error", `You can't Add Roles that user because they have the same/higher role than you.`, 0xA0000C)
        return;
      }
  
      if (targetUserRolePosition >= botRolePosition) {
        ErrorReply("AtlasGuard Error", `I can't Add Roles that user because they have the same/higher role than me.`, 0xA0000C)
        return;
      }
  
      // Ban the targetUser
      try {

        targetUser.roles.add(TargetRole.id)

        const { EmbedBuilder } = require('discord.js');
          ErrorReply("AtlasGuard Role Added", `\`🏳️ User:\` ${targetUser.user} \n \`🎗️ Role:\` ${TargetRole}`, 0x00ff1e)




        const server = interaction.guild;
        const config = require('../../../config.json');
        const channel = interaction.channel.guild.channels.cache.find((channel) => channel.id === guardianlog);
        if (channel) {
          const FlaggedMessage = new EmbedBuilder()
            .setColor(0xA0000C)
            .setTitle('Atlas Guardian Log')
            .setDescription(`Atlas Guardian was triggered due to a user having roles added.`)
            .setTimestamp()
            .addFields(
              { name: 'Event Triggered 📩', value: `\`\`\`User Added Roles\`\`\``, inline: false },
                { name: 'User 🏳️‍🌈', value: `${targetUser.user}`, inline: true },
                { name: 'Member 👑', value: `${interaction.user}`, inline: true },
                { name: 'Role 💻', value: `${TargetRole}`, inline: true },
                { name: 'Action Preformed At ⏰', value: `<t:${Math.round(interaction.createdTimestamp / 1000)}>`, inline: false },
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

      function ErrorReply(tit, err, xcolor) {
        const { EmbedBuilder } = require('discord.js');
        const ErrEmbed = new EmbedBuilder()
          .setColor(xcolor)
          .setTitle(tit)
          .setDescription(err)
          .setTimestamp()
          .setFooter({ text: 'Atlas Guardian™', iconURL: 'https://i.imgur.com/ViArMpu.png' });
        interaction.editReply({ embeds: [ErrEmbed] })
      }
    },
  
    name: 'addrole',
    description: 'Add a role to a user.',
    options: [
      {
        name: 'user',
        description: 'The user you want to add to the role',
        type: ApplicationCommandOptionType.Mentionable,
        required: true,
      },
      {
        name: 'role',
        description: 'the role/roles you want to add.',
        type: ApplicationCommandOptionType.Role,
        required: true,
      },
    ],
  };