import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { getTimers, saveTimers } from '../../utils/timers.js';
import { getGuildSetting } from '../../utils/settings.js';

export const data = new SlashCommandBuilder()
    .setName('timers')
    .setDescription('Manages your active reminders')
    .addIntegerOption(option =>
        option.setName('cancel')
            .setDescription('The number of the reminder to cancel')
            .setRequired(false)
            .setMinValue(1));

export async function execute(interaction) {
    const cancelIndex = interaction.options.getInteger('cancel');
    const hidden = getGuildSetting(interaction.guildId, 'hidden');
    const userId = interaction.user.id;

    const allTimers = getTimers();
    const userTimers = allTimers.filter(t => t.userId === userId);

    if (cancelIndex) {
        if (cancelIndex < 1 || cancelIndex > userTimers.length) {
            return await interaction.reply({
                content: 'Invalid reminder number. Use `/timers` to see your active reminders.',
                flags: [MessageFlags.Ephemeral]
            });
        }

        const targetTimer = userTimers[cancelIndex - 1];
        const updatedTimers = allTimers.filter(t => t !== targetTimer);
        saveTimers(updatedTimers);

        return await interaction.reply({
            content: `Successfully canceled reminder: **${targetTimer.reason}**`,
            flags: hidden ? [MessageFlags.Ephemeral] : []
        });
    }

    if (userTimers.length === 0) {
        return await interaction.reply({
            content: 'You have no active reminders.',
            flags: hidden ? [MessageFlags.Ephemeral] : []
        });
    }

    const list = userTimers
        .map((t, idx) => `${idx + 1}. **${t.reason}** - <t:${Math.floor(t.timestamp / 1000)}:R>`)
        .join('\n');

    await interaction.reply({
        content: `⏰ **Your Active Reminders:**\n\n${list}\n\nUse \`/timers cancel:[number]\` to delete a reminder.`,
        flags: hidden ? [MessageFlags.Ephemeral] : []
    });
}
