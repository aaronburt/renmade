import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { getGuildSetting } from '../../utils/settings.js';

export const data = new SlashCommandBuilder()
    .setName('uptime')
    .setDescription('Displays the bot\'s uptime');

export async function execute(interaction) {
    const uptime = interaction.client.uptime;
    const seconds = Math.floor(uptime / 1000) % 60;
    const minutes = Math.floor(uptime / (1000 * 60)) % 60;
    const hours = Math.floor(uptime / (1000 * 60 * 60)) % 24;
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));

    const hidden = getGuildSetting(interaction.guildId, 'hidden');
    await interaction.reply({
        content: `Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s`,
        flags: hidden ? [MessageFlags.Ephemeral] : []
    });
}
