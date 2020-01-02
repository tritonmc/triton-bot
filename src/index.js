import { Client /*, RichEmbed*/ } from 'discord.js';
import 'dotenv/config';
import DatabaseController from './DatabaseController.ctrl';
import generateToken from './randomGenerator';
import SpigotController from './SpigotController.ctrl';

const client = new Client();
const databaseController = new DatabaseController();
const spigotController = new SpigotController();

client.on('ready', () => {
  console.log('Successfuly logged in into Discord!');
});

client.on('message', (msg) => {
  if (msg.channel.id === process.env.VERIFICATION_CHANNEL) handleVerificationMessage(msg);
  if (msg.channel.type === 'dm' && msg.content === '!twin') handleDM(msg);
});

/*const embed = new RichEmbed()
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
    );*/

client.login(process.env.DISCORD_TOKEN);

const handleVerificationMessage = async (msg) => {
  try {
    msg.delete();
    try {
      const buyer = spigotController.getBuyer(msg.content);
      if (!buyer) {
        msg.author.send(`Can't find ${msg.content} in the buyers list! Please try again later.`);
        return;
      }
      await databaseController.addUserToDatabase(
        msg.author.id,
        buyer.username,
        buyer.id,
        generateToken()
      );
      await (await msg.guild.fetchMember(msg.author)).addRole(
        process.env.BUYER_ROLE,
        `Spigot Username: ${buyer.username}`
      );
      msg.author.send(
        "Verification successful! You've gained access to the support channels! :tada:\nYou can reply `!twin` in this chat to get your TWIN token at any moment."
      );
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') {
        msg.author.send(
          `That Spigot account has already been verified! If you think this is a mistake, please contact <@${process.env.BOT_OWNER_ID}>.`
        );
        return;
      }
      console.error('Error while handling verification message.', e);
      msg.author.send(
        `An error occurred while trying to verify your purchase. Please try again later. If the problem persists, please contact <@${process.env.BOT_OWNER_ID}>.`
      );
    }
  } catch (e) {
    console.error('Error while handling verification message:', e);
  }
};

const handleDM = async (msg) => {
  try {
    var token = await databaseController.getToken(msg.author.id);
    if (token.length === 0) {
      msg.author.send(
        `Your account isn't verified yet. Please follow the instructions in the <#${process.env.VERIFICATION_CHANNEL}> channel.`
      );
      return;
    }
    const tokenMsg = await msg.author.send(
      `Your TWIN token is \`${token[0].token}\`. Please **DO NOT SHARE** it with anyone. This message will disappear in 30 seconds. :bomb:`
    );
    setTimeout(() => tokenMsg.delete().catch(console.error), 30000);
  } catch (e) {
    msg.author
      .send(
        `An error occurred while fetching your token. Please try again later. If the problem persists, please contact <@${process.env.BOT_OWNER_ID}>.`
      )
      .catch((e) => console.error('Error while handling TWIN token request:', e));
  }
};
