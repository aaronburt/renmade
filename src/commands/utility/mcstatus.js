import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { getGuildSetting } from '../../utils/settings.js';

export const data = new SlashCommandBuilder()
    .setName('mcstatus')
    .setDescription('Check the status of a Minecraft server')
    .addStringOption(option =>
        option.setName('ip')
            .setDescription('The IP address or domain of the Minecraft server')
            .setRequired(true))
    .addIntegerOption(option =>
        option.setName('port')
            .setDescription('The server port (optional)')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('type')
            .setDescription('The Minecraft server edition (defaults to Java)')
            .setRequired(false)
            .addChoices(
                { name: 'Java Edition', value: 'java' },
                { name: 'Bedrock Edition', value: 'bedrock' }
            ));

export async function execute(interaction) {
    const ip = interaction.options.getString('ip');
    const port = interaction.options.getInteger('port');
    const type = interaction.options.getString('type') || 'java';
    const hidden = getGuildSetting(interaction.guildId, 'hidden');

    await interaction.deferReply({ flags: hidden ? [MessageFlags.Ephemeral] : [] });

    try {
        const address = port ? `${ip}:${port}` : ip;
        const apiUrl = type === 'bedrock' 
            ? `https://api.mcsrvstat.us/bedrock/3/${address}`
            : `https://api.mcsrvstat.us/3/${address}`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
            return await interaction.editReply({ content: 'Failed to fetch server status. Please try again later.' });
        }

        const data = await response.json();

        if (!data.online) {
            const offlineEmbed = new EmbedBuilder()
                .setTitle('Minecraft Server Offline')
                .setDescription(`Could not connect to **${address}**.\n\nPlease verify that the address is correct and the server is running.`)
                .setColor(0xFF0000)
                .setFooter({ text: `Type: ${type === 'java' ? 'Java' : 'Bedrock'} • Requested by ${interaction.user.tag}` })
                .setTimestamp();

            return await interaction.editReply({ embeds: [offlineEmbed] });
        }

        const cleanMotd = data.motd && data.motd.clean ? data.motd.clean.join('\n') : 'No description provided';
        const playersOnline = data.players ? data.players.online : 0;
        const playersMax = data.players ? data.players.max : 0;
        const version = data.version ? data.version : 'Unknown';
        const faviconUrl = `https://api.mcsrvstat.us/icon/${ip}`;

        const embed = new EmbedBuilder()
            .setTitle('Minecraft Server Online')
            .setDescription(`\`\`\`\n${cleanMotd}\n\`\`\``)
            .addFields(
                { name: 'Server Address', value: `\`${address}\``, inline: true },
                { name: 'Version', value: `\`${version}\``, inline: true },
                { name: 'Players', value: `\`${playersOnline} / ${playersMax}\``, inline: true }
            )
            .setColor(0x00FF00)
            .setThumbnail(faviconUrl)
            .setFooter({ text: `Type: ${type === 'java' ? 'Java' : 'Bedrock'} • Requested by ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error(error);
        await interaction.editReply({ content: 'Sorry, I encountered an error while trying to fetch that server\'s status.' });
    }
}
