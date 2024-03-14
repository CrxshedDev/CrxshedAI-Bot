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
        await interaction.editReply({ content: 'You do not have permission to warn users.', ephemeral: true });
        return;
      }
  
      if (!targetUser) {
        await interaction.editReply("That user doesn't exist in this server.");
        return;
      }
  
      if (targetUser.id === interaction.guild.ownerId) {
        await interaction.editReply(
          "You can't warn that user because they're the server owner."
        );
        return;
      }
  
      const targetUserRolePosition = targetUser.roles.highest.position; // Highest role of the target user
      const requestUserRolePosition = interaction.member.roles.highest.position; // Highest role of the user running the cmd
      const botRolePosition = interaction.guild.members.me.roles.highest.position; // Highest role of the bot
  
      if (targetUserRolePosition >= requestUserRolePosition) {
        await interaction.editReply(
          "You can't warn that user because they have the same/higher role than you."
        );
        return;
      }
  
      if (targetUserRolePosition >= botRolePosition) {
        await interaction.editReply(
          "I can't warn that user because they have the same/higher role than me."
        );
        return;
      }
        
      try {
        const Keyv = require('keyv');
        const config = require('../../../config.json');
        let TargetKey = `${targetUser.user.id}:${interaction.guild.id}`
        const wars = new Keyv(config.mysqlstring);
        let warns = await wars.get(TargetKey);
        if(!warns) {
            warns = 1
        } else {
            warns++
        }
        await wars.set(TargetKey, warns);

        await interaction.editReply(
          `User ${targetUser} was Warned\nReason: ${reason}`
        );
        let warnings = await wars.get(TargetKey);
        const server = interaction.guild;
        const { EmbedBuilder } = require('discord.js');
        const channel = interaction.channel.guild.channels.cache.find((channel) => channel.id === guardianlog);
        
        const WarningMessage = new EmbedBuilder()
            .setColor(0xA0000C)
            .setTitle('Atlas Guardian Engaged')
            .setDescription(`Level 1 Warning.`)
            .setTimestamp()
            .addFields(
              { name: 'User 🏳️‍🌈', value: `${targetUser.user}`, inline: true },
              { name: 'Moderator 👑', value: `${interaction.user}`, inline: true },
              { name: 'Reason ❔', value: `\`\`\`${reason}\`\`\``, inline: false },
              { name: 'Status ❗', value: `\`\`\`${targetUser.user.username} now has ${warnings} Warnings.\`\`\``, inline: false },
              { name: 'Action Preformed At ⏰', value: `<t:${Math.round(interaction.createdTimestamp / 1000)}>`, inline: false },
            )
            .setFooter({ text: 'Atlas Guardian™', iconURL: 'https://i.imgur.com/YDoaTUD.png' });
  
          interaction.channel.send({ embeds: [WarningMessage] });
          targetUser.user.send({ embeds: [WarningMessage] });
        
        if (channel) {
          const FlaggedMessage = new EmbedBuilder()
            .setColor(0xA0000C)
            .setTitle('Atlas Guardian Engaged')
            .setDescription(`Atlas Guardian was triggered due to a user being Warned.`)
            .setTimestamp()
            .addFields(
              { name: 'Event Triggered 📩', value: `\`\`\`User Warned\`\`\``, inline: false },
              { name: 'User 🏳️‍🌈', value: `${targetUser.user}`, inline: true },
              { name: 'Moderator 👑', value: `${interaction.user}`, inline: true },
              { name: 'Action Preformed At ⏰', value: `<t:${Math.round(interaction.createdTimestamp / 1000)}>`, inline: true },
              { name: 'Reason ❔', value: `\`\`\`${reason}\`\`\``, inline: false },
              { name: 'Preformed In Discord 🏠', value: `\`\`\`${server.name}\`\`\``, inline: false },
              { name: 'Status ❗', value: `\`\`\`${targetUser.user.username} now has ${warnings} Warnings.\`\`\``, inline: false },
            )
            .setFooter({ text: 'Atlas Guardian™', iconURL: 'https://i.imgur.com/YDoaTUD.png' });
  
          channel.send({ embeds: [FlaggedMessage] });
        } else {
          // No channel found
          console.log("No Channel Found");
        }
      } catch (error) {
        console.log(`There was an error when warning: ${error}`);
      }
    },
  
    name: 'warn',
    description: 'Warns a member in your server.',
    options: [
      {
        name: 'user',
        description: 'The user you want to warn.',
        type: ApplicationCommandOptionType.Mentionable,
        required: true,
      },
      {
        name: 'reason',
        description: 'The reason you want to warn (optional).',
        type: ApplicationCommandOptionType.String,
      },
    ],
  };