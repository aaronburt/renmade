import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { getGuildSetting } from '../../utils/settings.js';

export const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!');

export async function execute(interaction) {
    const hidden = getGuildSetting(interaction.guildId, 'hidden');
    await interaction.reply({ 
        content: 'Pong!', 
        flags: hidden ? [MessageFlags.Ephemeral] : [] 
    });
}
