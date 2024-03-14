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
  
      await interaction.deferReply();
  
      const targetUser = interaction.guild.members.cache.get(targetUserId);
      const server = interaction.guild;
      const banInfo = await server.bans.fetch(targetUserId);
      if (!banInfo) {
        ErrorReply("AtlasGuard Error", `That user is not banned.`, 0xA0000C)
        return;
      }

      if (!interaction.member.roles.cache.has(staffteamrole)){
        ErrorReply("AtlasGuard Error", `You do not have permission to unban users.`, 0xA0000C)
        return;
      }
  
      // Ban the targetUser
      try {
        if(targetUserId) {
        const server = interaction.guild;
        await server.members.unban(targetUserId, { reason: `🔨 Atlas Unban`})
        ErrorReply("AtlasGuard Unban", `\`🏳️ User:\` ${targetUser} - (${targetUserId}) \n \`👑 Moderator:\` ${interaction.user} `, 0xA0000C)

        const { EmbedBuilder } = require('discord.js');
        const config = require('../../../config.json');
        const channel = interaction.channel.guild.channels.cache.find((channel) => channel.id === guardianlog);
        if (channel) {
          const FlaggedMessage = new EmbedBuilder()
            .setColor(0xA0000C)
            .setTitle('Atlas Guardian Log')
            .setDescription(`Atlas Guardian was triggered due to a user being Unbanned.`)
            .setTimestamp()
            .addFields(
              { name: 'Event Triggered 📩', value: `\`\`\`User Unbanned\`\`\``, inline: false },
              { name: 'User 🏳️‍🌈', value: `${targetUser} - (${targetUserId})`, inline: true },
                { name: 'Moderator 👑', value: `${interaction.user}`, inline: true },
                { name: 'Action Preformed At ⏰', value: `<t:${Math.round(interaction.createdTimestamp / 1000)}>`, inline: true },
                { name: 'Preformed In Discord 🏠', value: `\`\`\`${server.name}\`\`\``, inline: false },
            )
            .setFooter({ text: 'Atlas Guardian™', iconURL: 'https://i.imgur.com/YDoaTUD.png' });
  
          channel.send({ embeds: [FlaggedMessage] });
        } else {
          // No channel found
          console.log("No Channel Found");
        }
      }
      } catch (error) {
        console.log(`There was an error when unbanning: ${error}`);
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
  
    name: 'unban',
    description: 'Unbans a member from this server.',
    options: [
      {
        name: 'user',
        description: 'The user you want to unban.',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  };