import { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { getGuildSetting } from '../../utils/settings.js';

export const data = new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Send a styled announcement embed to a channel')
    .addStringOption(option =>
        option.setName('title')
            .setDescription('The title of the announcement')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('message')
            .setDescription('The main message/description of the announcement')
            .setRequired(true))
    .addChannelOption(option =>
        option.setName('channel')
            .setDescription('The channel to send the announcement to (defaults to current channel)')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false))
    .addStringOption(option =>
        option.setName('color')
            .setDescription('The color of the embed (e.g., #ff0000, red, blue, green, gold)')
            .setRequired(false))
    .addRoleOption(option =>
        option.setName('role')
            .setDescription('A role to mention/ping')
            .setRequired(false))
    .addBooleanOption(option =>
        option.setName('ping_everyone')
            .setDescription('Whether to ping @everyone')
            .setRequired(false))
    .addBooleanOption(option =>
        option.setName('ping_here')
            .setDescription('Whether to ping @here')
            .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export const privilegedOnly = true;

const PRESET_COLORS = {
    red: 0xFF0000,
    blue: 0x0099FF,
    green: 0x00FF00,
    gold: 0xFFD700,
    yellow: 0xFFFF00,
    purple: 0x800080,
    orange: 0xFFA500,
    white: 0xFFFFFF,
    black: 0x000000,
    blurple: 0x5865F2
};

export async function execute(interaction) {
    const title = interaction.options.getString('title');
    const message = interaction.options.getString('message');
    const targetChannel = interaction.options.getChannel('channel') || interaction.channel;
    const colorInput = interaction.options.getString('color');
    const role = interaction.options.getRole('role');
    const pingEveryone = interaction.options.getBoolean('ping_everyone') || false;
    const pingHere = interaction.options.getBoolean('ping_here') || false;
    const hidden = getGuildSetting(interaction.guildId, 'hidden');

    let embedColor = 0x5865F2;
    if (colorInput) {
        const cleanColor = colorInput.trim().toLowerCase();
        if (PRESET_COLORS[cleanColor] !== undefined) {
            embedColor = PRESET_COLORS[cleanColor];
        } else {
            const hexMatch = cleanColor.match(/^#?([0-9a-f]{6})$/);
            if (hexMatch) {
                embedColor = parseInt(hexMatch[1], 16);
            } else {
                return interaction.reply({
                    content: 'Invalid color format. Please use a preset name (e.g., red, blue) or a 6-digit hex code (e.g., #ff0000).',
                    flags: [MessageFlags.Ephemeral]
                });
            }
        }
    }

    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(message.replace(/\\n/g, '\n'))
        .setColor(embedColor)
        .setTimestamp()
        .setFooter({ text: `Announcement from ${interaction.guild.name}`, iconURL: interaction.guild.iconURL() });

    const pings = [];
    if (pingEveryone) pings.push('@everyone');
    if (pingHere) pings.push('@here');
    if (role) pings.push(role.toString());

    const content = pings.length > 0 ? pings.join(' ') : undefined;

    try {
        await targetChannel.send({
            content: content,
            embeds: [embed]
        });

        await interaction.reply({
            content: `Announcement successfully sent to ${targetChannel}!`,
            flags: hidden ? [MessageFlags.Ephemeral] : []
        });
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: 'Failed to send announcement. Please ensure I have permission to send messages and embed links in the target channel.',
            flags: [MessageFlags.Ephemeral]
        });
    }
}
