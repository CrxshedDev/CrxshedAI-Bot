const config = require('../config.json');
const token = require('../token.json');
var mysql = require('mysql');
const linkfilter = require('../linkfilter.json')
const wordfilter = require('../wordfilter.json')
const { Client, IntentsBitField, ActivityType, roleMention } = require('discord.js');
const eventHandler = require('./handlers/eventHandler');
const { getAudioUrl } = require('google-tts-api');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const fs = require('fs');
const tesseract = require("node-tesseract-ocr")

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildVoiceStates,
  ],
});


eventHandler(client);

client.on ('ready', () => {
  setInterval(() => {
    const customStatus = [
      `${client.guilds.cache
        .map((guild) => guild.memberCount)
        .reduce((p, c) => p + c)} Users`,
    ];

    const randomIndex = Math.floor(Math.random() * customStatus.length);
    const randomMessage = customStatus[randomIndex];
  client.user.setPresence({
    activities: [{ name: `${randomMessage}`, type: ActivityType.Watching }],
    status: 'dnd',
  });
}, 5 * 60 * 1000);
});

client.on('voiceStateUpdate', (newState, oldState) => {
      const NewChannel = newState.channel;
      const OldChannel = oldState.channel;
      const channel = OldChannel;
      const JTC = config.WaitingRoom;
    if(OldChannel && !NewChannel && OldChannel.id === JTC) {
      if(newState.member.user.bot){return}

      string = `Welcome to Waiting ${newState.member.user.username}, A member will drag you shortly.`
      
      const audioURL = getAudioUrl(string, {
        lang: 'en',
        slow: false,
        host: 'https://translate.google.com',
        timeout: 10000,
      });
      let VoiceConnection = joinVoiceChannel({ channelId: channel.id, guildId: channel.guild.id, adapterCreator: channel.guild.voiceAdapterCreator });
      console.log("Joined Voice")
      const resource = createAudioResource(audioURL, {
        inlineVolume: true,
    });
      const player = createAudioPlayer();

      VoiceConnection.subscribe(player);
      setTimeout(function(){
        player.play(resource);
      }, 1000);
    }
});

client.on('messageCreate', async (message) => {
  const isScam = linkfilter.some((linkfilterWord) => message.content.toLowerCase().includes(linkfilterWord.toLowerCase()));
  if (!isScam) return;
  const { EmbedBuilder } = require('discord.js');
  const server = message.guild;
  const channel = message.channel.guild.channels.cache.find((channel) => channel.topic === config.GuardianLogAuth);
      if (channel) {
        const FlaggedMessageLink = new EmbedBuilder()
          .setColor(0xA0000C)
          .setTitle('Crxshed AI')
          .setDescription(`Crxshed AI: Unsafe Link Detected.`)
          .setTimestamp()
          .addFields(
            { name: 'User 🏳️‍🌈', value: `\`\`\`${message.author.username}\`\`\``, inline: true },
            { name: 'Message 💬', value: `\`\`\`${message.content}\`\`\``, inline: true },
            { name: 'Action Preformed At ⏰', value: `<t:${Math.round(message.createdTimestamp / 1000)}>`, inline: false },
          )
          .setFooter({ text: 'Crxshed AI' });

        channel.send({ embeds: [FlaggedMessageLink] });
      } else {
        // No channel found
        console.log("No Channel Found");
      }
  message.delete({ reason: "Unsafe Link Detected." });
});

client.on('messageCreate', async (message) => {
    if(message.author.bot) return;
  const isWordfilter = wordfilter.some((wordfilterWord) => message.content.toLowerCase().includes(wordfilterWord.toLowerCase()));



  if (!isWordfilter) return;
  const { EmbedBuilder } = require('discord.js');
  const server = message.guild;
  const channel = message.channel.guild.channels.cache.find((channel) => channel.topic === config.GuardianLogAuth);
      if (channel) {
        const FlaggedMessageWord = new EmbedBuilder()
          .setColor(0xA0000C)
          .setTitle('Crxshed AI Engaged')
          .setDescription(`Crxshed AI: Blacklisted Word.`)
          .setTimestamp()
          .addFields(
            { name: 'User 🏳️‍🌈', value: `\`\`\`${message.author.username}\`\`\``, inline: true },
            { name: 'Message 💬', value: `\`\`\`${message.content}\`\`\``, inline: true },
            { name: 'Action Preformed At ⏰', value: `<t:${Math.round(message.createdTimestamp / 1000)}>`, inline: false },
          )
          .setFooter({ text: 'Crxshed AI' });

        channel.send({ embeds: [FlaggedMessageWord] });
      } else {
        console.log("No Channel Found");
      }
  message.delete({ reason: "Blacklisted Word Detected." });

});

const usersMap = new Map();

client.on('messageCreate', async (message) => {
  if(message.author.bot) return;
  if(usersMap.has(message.author.id)) {
    const userData = usersMap.get(message.author.id);
    const { lastMessage, timer } = userData;
    const difference = message.createdTimestamp - lastMessage.createdTimestamp;
    let msgCount = userData.msgCount;
    if(difference > 3500) {
      clearTimeout(timer);
      userData.msgCount = 1;
      userData.lastMessage = message;
      userData.timer = setTimeout(() => {
        usersMap.delete(message.author.id)
      }, 5000)
      usersMap.set(message.author.id, userData);
    } else {
      ++msgCount;
      if(parseInt(msgCount) === 5) {
        const member = message.guild.members.cache.get(message.author.id)
        message.channel.bulkDelete(userData.msgCount, true)
        member.timeout(300000)
        .then(console.log)
        .catch(console.error);

        fs.writeFile('spam-upload.txt', '', err => {
          if (err) {
            console.error(err)
            return
          }
        })

        const user = message.author;
    const messages = await message.channel.messages.fetch({ limit: 10 }); // Fetch the last 10 messages in the channel
    const channelName = message.channel.name;
    // Filter the messages sent by the user
    const userMessages = messages.filter((msg) => msg.author.id === user.id);

    // Create a formatted message string
    let formattedMessages = '';
    userMessages.forEach((msg) => {
      const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });
      formattedMessages += `[${currentTime}] (#${channelName}) - 👤 ${msg.author.username} - 🗨️ ${msg.content}\n`;
    });

      const content = `${formattedMessages}`;
      fs.appendFile('spam-upload.txt', content, err => {
        if (err) {
          console.error(err)
          return
        }
        return
      })
      const channel = member.guild.channels.cache.find((channel) => channel.topic === config.GuardianLogAuth);
      if (channel) {
        const { EmbedBuilder } = require('discord.js');
        const SpamLog = new EmbedBuilder()
          .setColor(0xA0000C)
          .setTitle('Crxshed AI Engaged')
          .setDescription(`Crxshed AI: User Spamming`)
          .setTimestamp()
          .addFields(
              { name: 'User 🌈', value: `${message.author}`, inline: true },
              { name: 'Preformed In Discord 🏠', value: `\`\`\`${member.guild.name}\`\`\``, inline: false },
          )
          .setFooter({ text: 'Crxshed AI', });

        channel.send({ embeds: [SpamLog], files: ['spam-upload.txt'] });
        
        return
      } else {
        // No channel found
        console.log("No Channel Found");
      }
      } else {
        userData.msgCount = msgCount;
        usersMap.set(message.author.id, userData)
      }
    }
  } else {
    let fn = setTimeout(() => {
      usersMap.delete(message.author.id)
    }, 5000)
    usersMap.set(message.author.id, {
      msgCount: 1,
      lastMessage: message,
      timer: fn
    })
  }
})

let OldData;

function checkWebsiteForText() {
    fs.readFile('GameLink.txt', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return;
        }
        const searchText = 'Content-Deleted';

        fetch(data)
            .then(response => {
                if (response.url.includes(searchText)) {
                    // Convert data to string if needed
                    data = data.toString();
                    if (data !== OldData) {
                      const channel = client.channels.cache.get("1192507284845248534");

                      channel.messages.fetch({ limit: 1 })
                      .then(messages => {
                          if (messages.size === 0) {
                              console.log('No messages to delete.');
                              return;
                          }
                          const messageToDelete = messages.first();
                          messageToDelete.delete()
                      })

                      const { EmbedBuilder } = require('discord.js');
                      
                      const FlaggedMessage = new EmbedBuilder()
                        .setColor(0xe8e3d6)
                        .setTitle('❌ CONDO Deleted')
                        .setDescription(`Crxshed AI Has detected a deleted Upload, Please wait for a new upload.`)
                        .setThumbnail('https://i.imgur.com/bFIRMCK.png')
                        .setTimestamp()
                        .addFields(
                          { name: 'Info ❔', value: `RBX Has detected the game, Please wait for another game to be uploaded.`, inline: false },
                          { name: 'Accounts 👑', value: `An Upload may take longer if an account is not available, Please ready the announcement in <#1216558315409248354>`, inline: false },
                        )
                        .setFooter({ text: 'Crxshed AI' });

                        channel.send({ embeds: [FlaggedMessage] });

                        OldData = data;
                    }
                }
            })
            .catch(error => {
                // Handle any errors that occur during the fetch
                console.error('Error fetching website:', error);
            });
    });
}

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
      const server = message.guild;
      const attachment = message.attachments.first();
      const url = attachment ? attachment.url : null;

  tesseract.recognize(url, config)
      .then((text) => {
          result = text.toLowerCase();
          if(result.includes("rhub")){
              message.channel.send(`## ${message.author} | Submitted \n\n Thank your for sharing our game, This has been automatically submitted to Chain.`)
          }
      })
      .catch((error) => {
          console.log(error.message)
      })
  });

// Run the function every 10 seconds
setInterval(checkWebsiteForText, 5000);


client.login(token.token)