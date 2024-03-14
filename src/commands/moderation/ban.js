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
      const targetUser = interaction.guild.members.cache.get(targetUserId);

    await interaction.deferReply();

    if (!interaction.member.roles.cache.has(staffteamrole)){
      ErrorReply("AtlasGuard Error", `You do not have permission to ban users.`, 0xA0000C)
      return;
    }

    if (targetUser) {
    if (targetUserId === interaction.guild.ownerId) {
      ErrorReply("AtlasGuard Error", `You can't ban that user because they're the server owner.`, 0xA0000C)
      return;
    }
    const targetUserRolePosition = targetUser.roles.highest.position; // Highest role of the target user
    const requestUserRolePosition = interaction.member.roles.highest.position; // Highest role of the user running the cmd
    const botRolePosition = interaction.guild.members.me.roles.highest.position; // Highest role of the bot

    if (targetUserRolePosition >= requestUserRolePosition) {
      ErrorReply("AtlasGuard Error", `You can't ban that user because they have the same/higher role than you.`, 0xA0000C)
      return;
    }

    if (targetUserRolePosition >= botRolePosition) {
      ErrorReply("AtlasGuard Error", `I can't ban that user because they have the same/higher role than me.`, 0xA0000C)
      return;
    }
    }
    // Ban the targetUser
    try {
      if(targetUserId) {
      const server = interaction.guild;
      await server.members.ban(targetUserId, { reason: `🔨 Atlas Ban - ${reason} (${targetUserId}) - By ${interaction.user.username}`})
      ErrorReply("AtlasGuard Ban", `\`🏳️ User:\` ${targetUser} - (${targetUserId}) \n \`❔ Reason:\` ${reason} \n \`👑 Moderator:\` ${interaction.user} `, 0xA0000C)

      const { EmbedBuilder } = require('discord.js');
      const config = require('../../../config.json');
      const channel = interaction.channel.guild.channels.cache.find((channel) => channel.id === guardianlog);
      if (channel) {
        const FlaggedMessage = new EmbedBuilder()
          .setColor(0xA0000C)
          .setTitle('Atlas Guardian Engaged')
          .setDescription(`Atlas Guardian was triggered due to a user being banned.`)
          .setTimestamp()
          .addFields(
            { name: 'Event Triggered 📩', value: `\`\`\`User Banned\`\`\``, inline: false },
              { name: 'User 🏳️‍🌈', value: `${targetUser} - (${targetUserId})`, inline: true },
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
    } else {
      const userId = interaction.options.get('user').value;
      console.log(userId)
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

  name: 'ban',
  description: 'Bans a member from this server.',
  options: [
    {
      name: 'user',
      description: 'The user you want to ban.',
      type: ApplicationCommandOptionType.Mentionable,
      required: true,
    },
    {
      name: 'reason',
      description: 'The reason you want to ban.',
      type: ApplicationCommandOptionType.String,
    },
  ],
};