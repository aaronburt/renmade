import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { getGuildSetting } from '../../utils/settings.js';

export const data = new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Displays the avatar of a user')
    .addUserOption(option => 
        option.setName('target')
            .setDescription('The user to get the avatar of')
            .setRequired(false));

export async function execute(interaction) {
    const user = interaction.options.getUser('target') || interaction.user;
    const hidden = getGuildSetting(interaction.guildId, 'hidden');

    const embed = new EmbedBuilder()
        .setTitle(`${user.tag}'s Avatar`)
        .setImage(user.displayAvatarURL({ size: 1024, dynamic: true }))
        .setColor(0x0099FF);

    await interaction.reply({ embeds: [embed], flags: hidden ? [MessageFlags.Ephemeral] : [] });
}
