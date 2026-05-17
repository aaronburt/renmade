import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { getGuildSetting } from '../../utils/settings.js';

export const data = new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set the slowmode delay for this channel')
    .addIntegerOption(option =>
        option.setName('seconds')
            .setDescription('Delay in seconds (0 to disable, max 21600)')
            .setRequired(true)
            .setMinValue(0)
            .setMaxValue(21600))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export const privilegedOnly = true;

export async function execute(interaction) {
    const seconds = interaction.options.getInteger('seconds');
    const hidden = getGuildSetting(interaction.guildId, 'hidden');

    try {
        await interaction.channel.setRateLimitPerUser(seconds);
        
        await interaction.reply({
            content: `✅ Slowmode has been set to **${seconds}** seconds.`,
            flags: hidden ? [MessageFlags.Ephemeral] : []
        });
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: '❌ Failed to update slowmode. Ensure I have the **Manage Channels** permission.',
            flags: [MessageFlags.Ephemeral]
        });
    }
}
