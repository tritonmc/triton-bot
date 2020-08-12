import { Client, MessageEmbed } from 'discord.js';
import 'dotenv/config';
import DatabaseController from './DatabaseController.ctrl';
import generateToken from './randomGenerator';

const client = new Client();
const databaseController = new DatabaseController();

client.on('ready', async () => {
  console.log(`Successfuly logged in into Discord as ${client.user.tag}!`);
  refreshEmbed();
});

client.on('message', (msg) => {
  if (msg.channel.id === process.env.VERIFICATION_CHANNEL) handleVerificationMessage(msg);
  if (msg.channel.type === 'dm' && msg.content === '!twin') handleDM(msg);
});

client.on('guildMemberAdd', (member) => {
  handleOnJoinVerification(member);
});

client.login(process.env.DISCORD_TOKEN);

const handleVerificationMessage = async (msg) => {
  try {
    if (msg.author.id === client.user.id) return;
    msg.delete();
    try {
      const buyerList = await databaseController.getBuyer(msg.content);
      if (buyerList.length === 0) {
        msg.author.send(`Can't find ${msg.content} in the buyers list! Please try again later.`);
        return;
      }
      const { marketplaceId, friendlyName, date } = buyerList[0];
      await databaseController.addUserToDatabase(
        msg.author.id,
        friendlyName,
        marketplaceId,
        generateToken()
      );
      await msg.member.roles.add(process.env.BUYER_ROLE, `Spigot Username: ${friendlyName}`);
      msg.author.send(
        "Verification successful! You've gained access to the support channels! :tada:\nYou can reply `!twin` in this chat to get your TWIN token at any moment."
      );
      client.users
        .fetch(process.env.BOT_OWNER_ID)
        .then((u) =>
          u.send(
            `User <@${msg.author.id}> has been verified as \`${friendlyName}\`. Purchase date: ${date}`
          )
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

const handleOnJoinVerification = async (member) => {
  const previousBuyer = await databaseController.getToken(member.user.id);
  if (previousBuyer.length !== 0) {
    await member.roles.add(process.env.BUYER_ROLE, `Guild rejoin`);
    return;
  }
  const buyerNotGenerated = await databaseController.getUserFromTag(member.user.tag);
  if (buyerNotGenerated.length === 0) return;
  const { marketplaceId, friendlyName, date } = buyerNotGenerated[0];

  try {
    await databaseController.addUserToDatabase(
      member.user.id,
      friendlyName,
      marketplaceId,
      generateToken()
    );
    await member.roles.add(process.env.BUYER_ROLE, `(Auto) Spigot Username: ${friendlyName}`);
    member.user.send(
      "Automatic verification successful! You've gained access to the support channels! :tada:\nYou can reply `!twin` in this chat to get your TWIN token at any moment."
    );
    client.users
      .fetch(process.env.BOT_OWNER_ID)
      .then((u) =>
        u.send(
          `User <@${member.user.id}> has been automatically verified as \`${friendlyName}\`. Purchase date: ${date}`
        )
      );
  } catch (e) {
    if (e.code !== 'ER_DUP_ENTRY')
      console.error('Error while handling verification on guild join.', e);
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

const refreshEmbed = async () => {
  try {
    const channel = await client.channels.fetch(process.env.VERIFICATION_CHANNEL);
    const embed = new MessageEmbed()
      .setTitle('Get support for Triton!')
      .setDescription(
        'Simply write your Spigot username in this channel to get verified!\nWarning: It is case sensitive!'
      )
      .setColor(0x008ef9)
      .setFooter('Purchases might take a few minutes to be processed')
      .addField(
        'Bought the plugin on another marketplace?',
        "Unfortunately, automatic verification for your marketplace isn't available yet. Please DM a staff member to get verified."
      )
      .addField(
        "Haven't bought the plugin yet?",
        'Buy it on [SpigotMC](https://www.spigotmc.org/resources/triton.30331/)!'
      )
      .addField(
        'Useful links',
        '[SpigotMC](https://www.spigotmc.org/resources/triton.30331/) | [Documentation](https://triton.rexcantor64.com/) | [Changelog](https://www.spigotmc.org/resources/triton.30331/updates)'
      );
    const lastMessage = (await channel.messages.fetch({ limit: 1 })).first();
    if (lastMessage && lastMessage.author.id === client.user.id) lastMessage.edit(embed);
    else channel.send(embed);
  } catch (e) {
    console.error('Failed to refresh embed.', e);
  }
};
