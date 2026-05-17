import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { getGuildSetting } from '../../utils/settings.js';

export const data = new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Deletes the last 50 messages sent by the bot in this channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

export const privilegedOnly = true;

export async function execute(interaction) {
    const hidden = getGuildSetting(interaction.guildId, 'hidden');

    try {
        const fetched = await interaction.channel.messages.fetch({ limit: 100 });
        const botMessages = fetched.filter(m => m.author.id === interaction.client.user.id).first(50);

        if (botMessages.length === 0) {
            return await interaction.reply({
                content: 'No recent bot messages found to clear.',
                flags: [MessageFlags.Ephemeral]
            });
        }

        await interaction.channel.bulkDelete(botMessages, true);

        await interaction.reply({
            content: `Successfully cleared ${botMessages.length} bot messages from this channel.`,
            flags: hidden ? [MessageFlags.Ephemeral] : []
        });
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: 'Failed to clear bot messages. Make sure I have Manage Messages permission.',
            flags: [MessageFlags.Ephemeral]
        });
    }
}
