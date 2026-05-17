import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { getGuildSetting } from '../../utils/settings.js';

export const data = new SlashCommandBuilder()
    .setName('whois')
    .setDescription('Displays information about a user')
    .addUserOption(option => 
        option.setName('target')
            .setDescription('The user to get information about')
            .setRequired(false));

export const privilegedOnly = true;

export async function execute(interaction) {
    const user = interaction.options.getUser('target') || interaction.user;
    const member = await interaction.guild.members.fetch(user.id);
    const hidden = getGuildSetting(interaction.guildId, 'hidden');

    const embed = new EmbedBuilder()
        .setColor(member.displayHexColor || 0x0099FF)
        .setTitle(`User Info - ${user.tag}`)
        .setThumbnail(user.displayAvatarURL())
        .addFields(
            { name: 'ID', value: user.id, inline: true },
            { name: 'Nickname', value: member.nickname || 'None', inline: true },
            { name: 'Bot?', value: user.bot ? 'Yes' : 'No', inline: true },
            { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
            { name: 'Joined Discord', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
            { name: `Roles [${member.roles.cache.size - 1}]`, value: member.roles.cache.filter(role => role.name !== '@everyone').map(role => role.toString()).join(', ') || 'None' }
        )
        .setFooter({ text: `Requested by ${interaction.user.tag}` })
        .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: hidden ? [MessageFlags.Ephemeral] : [] });
}
