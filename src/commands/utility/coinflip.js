import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { getGuildSetting } from '../../utils/settings.js';

export const data = new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Flips a coin');

export async function execute(interaction) {
    const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
    const hidden = getGuildSetting(interaction.guildId, 'hidden');
    
    await interaction.reply({
        content: `🪙 The coin landed on: **${result}**!`,
        flags: hidden ? [MessageFlags.Ephemeral] : []
    });
}
