import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { getGuildSetting } from '../../utils/settings.js';

export const data = new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Locks the current channel (prevents @everyone from sending messages)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export const privilegedOnly = true;

export async function execute(interaction) {
    const hidden = getGuildSetting(interaction.guildId, 'hidden');

    try {
        await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            SendMessages: false
        });

        await interaction.reply({
            content: 'This channel has been **locked**. Users can no longer send messages.',
            flags: hidden ? [MessageFlags.Ephemeral] : []
        });
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: 'Failed to lock the channel. Ensure I have the **Manage Channels** permission.',
            flags: [MessageFlags.Ephemeral]
        });
    }
}
