import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { getGuildSetting } from '../../utils/settings.js';

export const data = new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlocks the current channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export const privilegedOnly = true;

export async function execute(interaction) {
    const hidden = getGuildSetting(interaction.guildId, 'hidden');

    try {
        await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            SendMessages: null
        });

        await interaction.reply({
            content: 'This channel has been **unlocked**. Users can now send messages again.',
            flags: hidden ? [MessageFlags.Ephemeral] : []
        });
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: 'Failed to unlock the channel. Ensure I have the **Manage Channels** permission.',
            flags: [MessageFlags.Ephemeral]
        });
    }
}
