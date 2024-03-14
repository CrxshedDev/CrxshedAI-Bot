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
      const GameLink = interaction.options.get('link').value;
      const fs = require('fs');
      await interaction.deferReply();

      try {
        const channel = interaction.channel.guild.channels.cache.find((channel) => channel.id === "1192507284845248534");
    
        if (GameLink.includes("roblox.com")) {
          if (channel) {
            const { EmbedBuilder } = require('discord.js');
            const FlaggedMessage = new EmbedBuilder()
              .setColor(0xe8e3d6)
              .setTitle('💖 CONDO UPLOAD')
              .setDescription(`Crxshed AI Has detected a new condo Upload, Please join it below.`)
              .setThumbnail('https://i.imgur.com/nUMAm8Z.png')
              .setTimestamp()
              .addFields(
                { name: 'Info ❔', value: `Wait for Chains to start the game once review gets bypassed.`, inline: false },
                { name: 'Game Link ❗', value: `**[Join Here](${GameLink})**`, inline: false },
                { name: 'Upload Time ⌚', value: `<t:${Math.round(interaction.createdTimestamp / 1000)}:R>`, inline: true },
                { name: 'Uploader 👑', value: `${interaction.user}`, inline: true },
              )
              .setFooter({ text: 'Crxshed AI' });
    
              const sentEmbed = await channel.send({ embeds: [FlaggedMessage] });
              sentEmbed.react('✅')

              fs.appendFile('GameLink.txt', GameLink, err => {
                if (err) {
                  console.error(err)
                  return
                }
                return
              })
          } else {
            // No channel found
            console.log("No Channel Found");
          }

          interaction.editReply("**Condo Has been submitted! ✅**")
        }
    } catch (error) {
        console.log(`There was an error when uploading: ${error}`);
    }
    
    },
  
    name: 'upload',
    description: 'Uploads a new Condo',
    options: [
      {
        name: 'link',
        description: 'Link to the game',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  };