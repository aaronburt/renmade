import { SlashCommandBuilder, EmbedBuilder, MessageFlags, ChannelType } from 'discord.js';
import { getGuildSetting } from '../../utils/settings.js';

export const data = new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Displays detailed information about this server');

export async function execute(interaction) {
    const { guild } = interaction;
    const hidden = getGuildSetting(interaction.guildId, 'hidden');

    const owner = await guild.fetchOwner();
    const members = await guild.members.fetch();
    const roles = guild.roles.cache.size;
    const channels = guild.channels.cache;
    const emojis = guild.emojis.cache.size;

    const embed = new EmbedBuilder()
        .setTitle(`Server Info - ${guild.name}`)
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .setColor(0x5865F2)
        .addFields(
            { name: 'Owner', value: `<@${owner.id}>`, inline: true },
            { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
            { name: 'Boosts', value: `${guild.premiumSubscriptionCount || 0} (Level ${guild.premiumTier})`, inline: true },
            { name: 'Members', value: `Total: ${guild.memberCount}\nHumans: ${members.filter(m => !m.user.bot).size}\nBots: ${members.filter(m => m.user.bot).size}`, inline: true },
            { name: 'Channels', value: `Text: ${channels.filter(c => c.type === ChannelType.GuildText).size}\nVoice: ${channels.filter(c => c.type === ChannelType.GuildVoice).size}`, inline: true },
            { name: 'Miscellaneous', value: `Roles: ${roles}\nEmojis: ${emojis}\nVerification: ${guild.verificationLevel}`, inline: true }
        )
        .setFooter({ text: `ID: ${guild.id}` })
        .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: hidden ? [MessageFlags.Ephemeral] : [] });
}
