import { REST, Routes } from 'discord.js';
import logger from './logger.js';

const registerCommands = async (commands, { guildId, clientId, token }) => {
  try {
    const rest = new REST().setToken(token);

    logger.info('Started refreshing application (/) commands.');

    if (guildId) {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
    } else {
      await rest.put(Routes.applicationCommands(clientId), { body: commands });
    }

    logger.info('Successfully reloaded application (/) commands.');
  } catch (error) {
    logger.error(error, 'Failed to register slash commands:', {
      httpError: JSON.stringify(error.rawError, null, 2),
    });
  }
};

export default registerCommands;
