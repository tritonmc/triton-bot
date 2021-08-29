import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

const registerCommands = async (commands, { guildId, clientId, token }) => {
  try {
    const rest = new REST({ version: '9' }).setToken(token);

    console.log('Started refreshing application (/) commands.');

    if (guildId) {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
    } else {
      await rest.put(Routes.applicationCommands(clientId), { body: commands });
    }

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(
      'Failed to register slash commands:',
      error,
      JSON.stringify(error.rawError, null, 2)
    );
  }
};

export default registerCommands;
