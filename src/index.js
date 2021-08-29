import {
  Client,
  MessageEmbed,
  Intents,
  Collection,
  MessageActionRow,
  MessageButton,
} from 'discord.js';
import 'dotenv/config';
import DatabaseController from './DatabaseController.ctrl';
import registerCommands from './registerCommands';
import path from 'path';
import fs from 'fs';

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS] });
const databaseController = new DatabaseController();

const loadCommands = async () => {
  client.commands = new Collection();
  const commandFiles = (
    await fs.promises.readdir(path.join(__dirname, 'commands'))
  ).filter((file) => file.endsWith('.js'));

  for (const file of commandFiles) {
    const { default: command } = await import(`./commands/${file}`);
    // Set a new item in the Collection
    // With the key as the command name and the value as the exported module
    client.commands.set(command.data.name, command);
  }
};

client.on('ready', async () => {
  console.log(`Successfuly logged in into Discord as ${client.user.tag}!`);

  await loadCommands();

  await registerCommands(
    client.commands.map((v) => v.data.toJSON()),
    {
      clientId: client.user.id,
      guildId: process.env.GUILD_ID || null,
      token: process.env.DISCORD_TOKEN,
    }
  );

  refreshEmbed();
});

client.on('guildMemberAdd', (member) => {
  handleOnJoinVerification(member);
});

client.on('interactionCreate', async (interaction) => {
  let interactionType;
  if (interaction.isCommand()) {
    interactionType = interaction.commandName;
  } else if (interaction.isButton()) {
    interactionType = interaction.customId;
  } else {
    return;
  }

  const command = client.commands.get(interactionType);

  if (!command) return;

  try {
    await command.execute(interaction, { databaseController });
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: 'There was an error while executing this command!',
      ephemeral: true,
    });
  }
});

client.login(process.env.DISCORD_TOKEN);

const handleOnJoinVerification = async (member) => {
  const previousBuyer = await databaseController.getToken(member.user.id);
  if (previousBuyer.length !== 0) {
    await member.roles.add(process.env.BUYER_ROLE, `Guild rejoin`);
    return;
  }
};

const refreshEmbed = async () => {
  try {
    const channel = await client.channels.fetch(process.env.VERIFICATION_CHANNEL);

    const embed = new MessageEmbed()
      .setTitle('Get support for Triton!')
      .setDescription(
        'Use the `/verify` command in this Discord server to get verified!\nWarning: It is case sensitive!'
      )
      .setColor(0x008ef9)
      .setFooter('Purchases might take a few minutes to be processed')
      .addField(
        'Bought the plugin on a marketplace other than Spigot?',
        "Unfortunately, automatic verification for your marketplace isn't available yet. Please DM a staff member to get verified."
      )
      .addField(
        "Haven't bought the plugin yet?",
        'Buy it on [SpigotMC](https://www.spigotmc.org/resources/triton.30331/) or [Polymart](https://polymart.org/resource/triton.38)!'
      )
      .addField(
        'Useful links',
        '[SpigotMC](https://www.spigotmc.org/resources/triton.30331/) | [Documentation](https://triton.rexcantor64.com/) | [Changelog](https://www.spigotmc.org/resources/triton.30331/updates)'
      );
    const actionRow = new MessageActionRow().addComponents(
      new MessageButton().setCustomId('twintoken').setLabel('Get TWIN token').setStyle('PRIMARY')
    );

    const lastMessage = (await channel.messages.fetch({ limit: 1 })).first();
    if (lastMessage && lastMessage.author.id === client.user.id)
      lastMessage.edit({ embeds: [embed], components: [actionRow] });
    else channel.send({ embeds: [embed], components: [actionRow] });
  } catch (e) {
    console.error('Failed to refresh embed.', e);
  }
};
