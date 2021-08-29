import { SlashCommandBuilder } from '@discordjs/builders';

export const data = new SlashCommandBuilder()
  .setName('twintoken')
  .setDescription('After verification, get your TWIN token!');

export const execute = async (interaction, { databaseController }) => {
  try {
    const token = await databaseController.getToken(interaction.member.id);
    if (token.length === 0) {
      interaction.reply({
        content: `Your account isn't verified yet. Use the \`/verify\` command to get verified.`,
        ephemeral: true,
      });
      return;
    }
    await interaction.reply({
      content: `Your TWIN token is \`${token[0].token}\`. Please **DO NOT SHARE** it with anyone.`,
      ephemeral: true,
    });
  } catch (e) {
    interaction
      .reply({
        content: `An error occurred while fetching your token. Please try again later. If the problem persists, please contact <@${process.env.BOT_OWNER_ID}>.`,
        ephemeral: true,
      })
      .catch((e) => console.error('Error while handling TWIN token request:', e));
  }
};
