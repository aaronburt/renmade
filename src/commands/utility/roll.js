import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { getGuildSetting } from '../../utils/settings.js';

export const data = new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Rolls a dice')
    .addIntegerOption(option =>
        option.setName('sides')
            .setDescription('Number of sides on the dice (default 6)')
            .setMinValue(2)
            .setMaxValue(1000000));

export async function execute(interaction) {
    const sides = interaction.options.getInteger('sides') || 6;
    const result = Math.floor(Math.random() * sides) + 1;
    const hidden = getGuildSetting(interaction.guildId, 'hidden');

    await interaction.reply({
        content: `🎲 You rolled a **${result}** (1-${sides})!`,
        flags: hidden ? [MessageFlags.Ephemeral] : []
    });
}
