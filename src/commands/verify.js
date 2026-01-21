import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import logger from '../logger.js';
import generateToken from '../randomGenerator.js';

export const data = new SlashCommandBuilder()
  .setName('verify')
  .setDescription(
    'Verify your Triton purchase on Spigot, gain access to support channels and TWIN token'
  )
  .addStringOption((option) =>
    option
      .setName('username')
      .setDescription('Your Spigot username (case sensitive)')
      .setRequired(true)
  );

export const execute = async (interaction, { databaseController }) => {
  try {
    if (!interaction.member) {
      interaction.reply({
        content: `This command must be executed in Triton's Discord server and not by DM.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const username = interaction.options.getString('username');
    const buyerList = await databaseController.getBuyer(username);
    if (buyerList.length === 0) {
      interaction.reply({
        content: `Can't find \`${username.replace(
          '`',
          ''
        )}\` in the buyers list! Please try again later.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const { marketplaceId, friendlyName, date } = buyerList[0];
    await databaseController.addUserToDatabase(
      interaction.member.id,
      friendlyName,
      marketplaceId,
      generateToken()
    );
    await interaction.member.roles.add(process.env.BUYER_ROLE, `Spigot Username: ${friendlyName}`);
    interaction.reply({
      content:
        "Verification successful! You've gained access to the support channels! :tada:\nYou can use the `/twintoken` in this Discord server to get your TWIN token at any moment.",
      flags: MessageFlags.Ephemeral,
    });
    interaction.client.users
      .fetch(process.env.BOT_OWNER_ID)
      .then((u) =>
        u.send(
          `User <@${interaction.member.id}> has been verified as \`${friendlyName}\`. Purchase date: ${date}`
        )
      );
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      interaction.reply({
        content: `That Spigot account has already been verified! If you think this is a mistake, please contact <@${process.env.BOT_OWNER_ID}>.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    logger.error(e, 'Error while handling verification message.');
    interaction.reply({
      content: `An error occurred while trying to verify your purchase. Please try again later. If the problem persists, please contact <@${process.env.BOT_OWNER_ID}>.`,
      flags: MessageFlags.Ephemeral,
    });
  }
};
