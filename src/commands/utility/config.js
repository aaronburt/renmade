import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { setGuildSetting } from '../../utils/settings.js';

export const data = new SlashCommandBuilder()
    .setName('config')
    .setDescription('Configure bot settings for this server')
    .addBooleanOption(option =>
        option.setName('hidden')
            .setDescription('Whether bot responses should be ephemeral')
            .setRequired(true))
    .addIntegerOption(option =>
        option.setName('gemini_cooldown')
            .setDescription('Gemini API cooldown in seconds')
            .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
    const hidden = interaction.options.getBoolean('hidden');
    const geminiCooldown = interaction.options.getInteger('gemini_cooldown');
    setGuildSetting(interaction.guildId, 'hidden', hidden);
    setGuildSetting(interaction.guildId, 'gemini_cooldown', geminiCooldown);

    await interaction.reply({
        content: `Configuration updated: **hidden** is now set to \`${hidden}\`, **gemini_cooldown** is set to \`${geminiCooldown}\` seconds.`,
        flags: [MessageFlags.Ephemeral]
    });
}
