import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { setGuildSetting } from '../../utils/settings.js';

export const data = new SlashCommandBuilder()
    .setName('config')
    .setDescription('Configure bot settings for this server')
    .addBooleanOption(option =>
        option.setName('hidden')
            .setDescription('Whether bot responses should be ephemeral')
            .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
    const hidden = interaction.options.getBoolean('hidden');
    setGuildSetting(interaction.guildId, 'hidden', hidden);

    await interaction.reply({
        content: `Configuration updated: **hidden** is now set to \`${hidden}\`.`,
        flags: [MessageFlags.Ephemeral]
    });
}
