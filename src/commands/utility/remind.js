import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { addTimer } from '../../utils/timers.js';
import { getGuildSetting } from '../../utils/settings.js';

export const data = new SlashCommandBuilder()
    .setName('remind')
    .setDescription('Sets a reminder')
    .addIntegerOption(option => 
        option.setName('minutes')
            .setDescription('How many minutes from now')
            .setRequired(true)
            .setMinValue(1))
    .addStringOption(option =>
        option.setName('reason')
            .setDescription('What should I remind you about?')
            .setRequired(true));

export async function execute(interaction) {
    const minutes = interaction.options.getInteger('minutes');
    const reason = interaction.options.getString('reason');
    const hidden = getGuildSetting(interaction.guildId, 'hidden');

    const timestamp = Date.now() + (minutes * 60 * 1000);
    addTimer(interaction.user.id, interaction.channelId, reason, timestamp);

    await interaction.reply({
        content: `I will remind you about **${reason}** in ${minutes} minute(s)!`,
        flags: hidden ? [MessageFlags.Ephemeral] : []
    });
}
