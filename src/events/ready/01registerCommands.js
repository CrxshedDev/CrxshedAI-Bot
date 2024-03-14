const { Guild } = require('discord.js');
const config = require('../../../config.json');
const areCommandsDifferent = require('../../utils/areCommandsDifferent');
const getApplicationCommands = require('../../utils/getApplicationCommands');
const getLocalCommands = require('../../utils/getLocalCommands');
const reset = "\x1b[0m"; // Reset all attributes
const red = "\x1b[31m"; // Red text color
const green = "\x1b[32m"; // Green text color
const yellow = "\x1b[33m"; // Yellow text color
const blue = "\x1b[34m"; // Blue text color

module.exports = async (client) => {
  try {
    const localCommands = getLocalCommands();
    const applicationCommands = await getApplicationCommands(
      client,
      config.testServer
    );

    for (const localCommand of localCommands) {
      const { name, description, options } = localCommand;

      const existingCommand = await applicationCommands.cache.find(
        (cmd) => cmd.name === name
      );

      if (existingCommand) {
        if (localCommand.deleted) {
          await applicationCommands.delete(existingCommand.id);
          continue;
        }

        if (areCommandsDifferent(existingCommand, localCommand)) {
          await applicationCommands.edit(existingCommand.id, {
            description,
            options,
          });

          console.log(green + `--------------------------------` + reset)
          console.log(green + `🔁 Edited command ${name}` + reset)
          console.log(green + `--------------------------------` + reset)
        }
      } else {
        if (localCommand.deleted) {
          console.log(red + `--------------------------------` + reset)
          console.log(red + `❌ Deleting Registered Command ${name}` + reset)
          console.log(red + `--------------------------------` + reset)
          continue;
        }

        await applicationCommands.create({
          name,
          description,
          options,
        });

        console.log(green + `--------------------------------` + reset)
        console.log(green + `✅ Registered Command ${name}` + reset)
        console.log(green + `--------------------------------` + reset)
      }
    }
  } catch (error) {
    console.log(`There was an error: ${error}`);
  }
};
