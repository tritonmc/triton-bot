import 'dotenv/config';
import { getBuyers as getSpigotBuyers } from './spigot';
import { Client, RichEmbed } from 'discord.js';

const client = new Client();

client.on('ready', () => {
  console.log('Successfuly logged in into Discord!');
});

client.on('message', (msg) => {
  // TODO implement response to !twin PMs
  if (msg.channel.id != process.env.VERIFICATION_CHANNEL) return;
  //if(msg.author)
  const embed = new RichEmbed()
    .setTitle('Get support for Triton!')
    .setDescription(
      'Simply write your Spigot username in this channel to get verified!\nWarning: It is case sensitive!'
    )
    .setColor(0x008ef9)
    .setTimestamp()
    .setFooter('Updates every 5 minutes. Last updated')
    .addField(
      "Haven't bought the plugin yet?",
      'Buy it [here](https://www.spigotmc.org/resources/triton.30331/)!'
    )
    .addField(
      'Useful links',
      '[SpigotMC](https://www.spigotmc.org/resources/triton.30331/) | [Documentation](https://triton.rexcantor64.com/docs) | [Changelog](https://www.spigotmc.org/resources/triton.30331/updates)'
    );
  //msg.channel.send(embed);
});

client.login(process.env.DISCORD_TOKEN);
