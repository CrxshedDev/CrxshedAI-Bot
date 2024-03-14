const {
    Client,
    Interaction,
    ApplicationCommandOptionType,
    PermissionFlagsBits,
  } = require('discord.js');
  const config = require('../../../config.json');
  module.exports = {
    /**
     *
     * @param {Client} client
     * @param {Interaction} interaction
     */
  
    callback: async (client, interaction) => {
      var mysql = require('mysql');
      var con = mysql.createConnection({
        host: config.db[0].server,
        user: config.db[0].username,
        password: config.db[0].pass,
        database: config.db[0].dbname
      });

      const targetUserId = interaction.options.get('user').value;
      const reason = interaction.options.get('reason')?.value || 'No reason provided';
  
      await interaction.deferReply();
  
      const targetUser = await interaction.guild.members.fetch(targetUserId);
  
      if (!interaction.member.roles.cache.has("1154550051633381537")){
        await interaction.editReply({ content: 'You do not have permission to Global ban users.', ephemeral: true });
        return;
      }
  
      if (!targetUser) {
        await interaction.editReply("That user doesn't exist in this server.");
        return;
      }
  
      if (targetUser.id === interaction.guild.ownerId) {
        await interaction.editReply(
          "You can't ban that user because they're the server owner."
        );
        return;
      }
  
      const targetUserRolePosition = targetUser.roles.highest.position; // Highest role of the target user
      const requestUserRolePosition = interaction.member.roles.highest.position; // Highest role of the user running the cmd
      const botRolePosition = interaction.guild.members.me.roles.highest.position; // Highest role of the bot
  
      if (targetUserRolePosition >= requestUserRolePosition) {
        await interaction.editReply(
          "You can't ban that user because they have the same/higher role than you."
        );
        return;
      }
  
      if (targetUserRolePosition >= botRolePosition) {
        await interaction.editReply(
          "I can't ban that user because they have the same/higher role than me."
        );
        return;
      }
  
      // Ban the targetUser
      try {
        interaction.client.guilds.cache.forEach(server => {
            server.bans.create(targetUser.id, { reason: `Global Banned - ${reason} - By ${interaction.user.username}`})
        })
        const BanNum = Math.floor(Math.random() * 900) + 100;
        const BanCode = `AG-${BanNum}`
        var sql = `INSERT INTO AtlasGlobalBans (BanID, UserID, Reason, GuildID) VALUES ('${BanCode}', '${targetUser.id}', '${reason}', '${interaction.guild.id}')`;
        con.query(sql, function (err, result) {
          if (err) throw err;
        })

        await interaction.editReply(
          `User ${targetUser} was Global Banned\nReason: ${reason}`
        );
        //await banz.set(TargetKey, reason);
        const server = interaction.guild;
        const { EmbedBuilder } = require('discord.js');
        const channel = interaction.channel.guild.channels.cache.find((channel) => channel.topic === config.GuardianLogAuth);
        if (channel) {
          const FlaggedMessage = new EmbedBuilder()
            .setColor(0xA0000C)
            .setTitle('Atlas Guardian Engaged')
            .setDescription(`Atlas Guardian was triggered due to a user being Global Banned.`)
            .setTimestamp()
            .addFields(
              { name: 'Event Triggered 📩', value: `\`\`\`Global Ban\`\`\``, inline: false },
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
  
    name: 'globalban',
    description: 'Bans a member from all servers.',
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