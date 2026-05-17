import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { getGuildSetting } from '../../utils/settings.js';
import { isSuperUser } from '../../utils/privileges.js';

export const data = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Displays a list of available commands');

export async function execute(interaction) {
    const hidden = getGuildSetting(interaction.guildId, 'hidden');
    const isPrivileged = isSuperUser(interaction.user.id);
    const commands = interaction.client.commands;

    const embed = new EmbedBuilder()
        .setTitle('📚 Bot Help')
        .setDescription('Here is a list of all commands available to you:')
        .setColor(0x00FF00)
        .setTimestamp();

    const publicCommands = [];
    const privilegedCommands = [];

    commands.forEach(command => {
        const cmdInfo = `\`/${command.data.name}\`: ${command.data.description}`;
        if (command.privilegedOnly) {
            privilegedCommands.push(cmdInfo);
        } else {
            publicCommands.push(cmdInfo);
        }
    });

    embed.addFields({ name: 'Public Commands', value: publicCommands.join('\n') || 'None' });

    if (isPrivileged && privilegedCommands.length > 0) {
        embed.addFields({ name: '⭐ Privileged Commands', value: privilegedCommands.join('\n') });
    }

    await interaction.reply({ embeds: [embed], flags: hidden ? [MessageFlags.Ephemeral] : [] });
}
