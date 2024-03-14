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
    const data = await Handler.fetch(interaction.guild.id, 'logchannel');

      const targetUserId = interaction.options.get('user').value;
  
      await interaction.deferReply();
  
      const targetUser = await interaction.guild.members.fetch(targetUserId);

      if (!interaction.member.roles.cache.has("1154550051633381537")){
        await interaction.editReply({ content: 'You do not have permission to Role Strip Users.', ephemeral: true });
        return;
      }
      if (!targetUser) {
        await interaction.editReply("That user doesn't exist in this server.");
        return;
      }
  
      if (targetUser.id === interaction.guild.ownerId) {
        await interaction.editReply(
          "You can't Role Strip that user because they're the server owner."
        );
        return;
      }
  
      const targetUserRolePosition = targetUser.roles.highest.position; // Highest role of the target user
      const requestUserRolePosition = interaction.member.roles.highest.position; // Highest role of the user running the cmd
      const botRolePosition = interaction.guild.members.me.roles.highest.position; // Highest role of the bot
  
      if (targetUserRolePosition >= requestUserRolePosition) {
        await interaction.editReply(
          "You can't Role Strip that user because they have the same/higher role than you."
        );
        return;
      }
  
      if (targetUserRolePosition >= botRolePosition) {
        await interaction.editReply(
          "I can't Role Strip that user because they have the same/higher role than me."
        );
        return;
      }
        
      try {
      targetUser.roles.remove(targetUser.roles.cache)
       ErrorReply("AtlasGuard Role Strip", `\`🏳️ User:\` ${targetUser.user} \n \`👑 Moderator:\` ${interaction.user}`, 0xA0000C)
       ServerLog('Atlas Guardian Has logged an action due to a user being role stripped.', 'User Role Stripped', targetUser.user, interaction.user, interaction.guild.name)
        const config = require('../../../config.json');
      } catch (error) {
        console.log(`There was an error when Role Stripping: ${error}`);
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


        function ServerLog(Log, ET, Use, Mod, Serv) {
        const { EmbedBuilder } = require('discord.js');
        const channel = interaction.channel.guild.channels.cache.find((channel) => channel.topic === "test");
        if (channel) {
          const FlaggedMessage = new EmbedBuilder()
            .setColor(0xA0000C)
            .setTitle('Atlas Guardian Engaged')
            .setDescription(`${Log}`)
            .setTimestamp()
            .addFields(
              { name: 'Event Triggered 📩', value: `\`\`\`${ET}\`\`\``, inline: false },
              { name: 'User 🏳️‍🌈', value: `${Use}`, inline: true },
              { name: 'Moderator 👑', value: `${Mod}`, inline: true },
              { name: 'Action Preformed At ⏰', value: `<t:${Math.round(interaction.createdTimestamp / 1000)}>`, inline: false },
              { name: 'Preformed In Discord 🏠', value: `\`\`\`${Serv}\`\`\``, inline: false },
            )
            .setFooter({ text: 'Atlas Guardian™', iconURL: 'https://i.imgur.com/YDoaTUD.png' });
  
          channel.send({ embeds: [FlaggedMessage] });
        } else {
          // No channel found
          console.log("No Channel Found");
        }
        }
    },
  
    name: 'rolestrip',
    description: 'Role Strip a member in your server.',
    options: [
      {
        name: 'user',
        description: 'The user you want to Role Strip.',
        type: ApplicationCommandOptionType.Mentionable,
        required: true,
      },
    ],
  };