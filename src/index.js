import { Client, MessageEmbed } from 'discord.js';
import 'dotenv/config';
import cron from 'node-cron';
import DatabaseController from './DatabaseController.ctrl';
import generateToken from './randomGenerator';
import SongodaController from './SongodaController.ctrl';
import SpigotController from './SpigotController.ctrl';

const client = new Client();
const databaseController = new DatabaseController();
const spigotController = new SpigotController();
const songodaController = new SongodaController();

client.on('ready', async () => {
  console.log(`Successfuly logged in into Discord as ${client.user.tag}!`);
  await spigotController.refreshLogin();
  refreshBuyerList();
});

client.on('message', (msg) => {
  if (msg.channel.id === process.env.VERIFICATION_CHANNEL) handleVerificationMessage(msg);
  if (msg.channel.type === 'dm' && msg.content === '!twin') handleDM(msg);
});

client.on('guildMemberAdd', (member) => {
  handleSongodaVerification(member, true);
});

client.login(process.env.DISCORD_TOKEN);

const handleVerificationMessage = async (msg) => {
  try {
    if (msg.author.id === client.user.id) return;
    msg.delete();
    if (msg.content === '!songoda') {
      handleSongodaVerification(msg.member, false);
      return;
    }
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
      await msg.member.roles.add(process.env.BUYER_ROLE, `Spigot Username: ${buyer.username}`);
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

const handleSongodaVerification = async (member, auto) => {
  const buyer = songodaController.getBuyer(member.user.tag);
  if (!buyer) {
    if (!auto)
      member
        .send(`Can't find ${member.user.tag} in the buyers list! Please try again later.`)
        .catch(console.error);
    return;
  }
  try {
    await databaseController.addUserToDatabase(
      member.id,
      buyer.username,
      buyer.id,
      generateToken()
    );
    await member.roles.add(process.env.BUYER_ROLE, `Songoda Username: ${buyer.username}`);
    member.send(
      `${auto ? `Automatic v` : `V`}erification successful as \`${
        buyer.username
      }\`! You've gained access to the support channels! :tada:\nYou can reply \`!twin\` in this chat to get your TWIN token at any moment.`
    );
  } catch (e) {
    if (e.code !== 'ER_DUP_ENTRY') {
      console.error(
        `An error occurred while${auto ? ` automatically` : ``} verifying a Songoda purchase`,
        e
      );
      member
        .send(
          `You purchase has been${
            auto ? ` automatically` : ``
          } verified, but an error occurred while saving the changes. Please contact <@${
            process.env.BOT_OWNER_ID
          }>.`
        )
        .catch(() => {});
      return;
    } else if (!auto) {
      member.send(
        `That Songoda account has already been verified! If you think this is a mistake, please contact <@${process.env.BOT_OWNER_ID}>.`
      );
      return;
    }
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

const refreshBuyerList = async () => {
  try {
    await spigotController.refreshBuyers();
    await songodaController.refreshBuyers();
    const channel = await client.channels.fetch(process.env.VERIFICATION_CHANNEL);
    const embed = new MessageEmbed()
      .setTitle('Get support for Triton!')
      .setDescription(
        'Simply write your Spigot username in this channel to get verified!\nWarning: It is case sensitive!'
      )
      .setColor(0x008ef9)
      .setTimestamp()
      .setFooter('Updates every 5 minutes. Last updated')
      .addField(
        'Bought the plugin on Songoda Marketplace?',
        'Add your Discord tag to your Songoda profile and type `!songoda` below.'
      )
      .addField(
        "Haven't bought the plugin yet?",
        'Buy it on [Spigot](https://www.spigotmc.org/resources/triton.30331/)!'
      )
      .addField(
        'Useful links',
        '[SpigotMC](https://www.spigotmc.org/resources/triton.30331/) | [Documentation](https://triton.rexcantor64.com/docs) | [Changelog](https://www.spigotmc.org/resources/triton.30331/updates)'
      );
    const lastMessage = (await channel.messages.fetch({ limit: 1 })).first();
    if (lastMessage && lastMessage.author.id === client.user.id) lastMessage.edit(embed);
    else channel.send(embed);
  } catch (e) {
    console.error('Failed to refresh buyer list.', e);
  }
};

cron.schedule('*/5 * * * *', refreshBuyerList);
cron.schedule('0 0 */3 * *', spigotController.refreshLogin);
