import { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { getGuildSetting } from '../../utils/settings.js';

export const data = new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Create and send a custom styled embed')
    .addStringOption(option =>
        option.setName('description')
            .setDescription('The main description/text of the embed (use \\n for newlines)')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('title')
            .setDescription('The title of the embed')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('color')
            .setDescription('The color of the embed (e.g., #ff0000, red, blue, green)')
            .setRequired(false))
    .addChannelOption(option =>
        option.setName('channel')
            .setDescription('The text channel to send the embed to (defaults to current channel)')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false))
    .addStringOption(option =>
        option.setName('thumbnail')
            .setDescription('URL for the top-right thumbnail image')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('image')
            .setDescription('URL for the bottom main image')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('footer')
            .setDescription('Footer text of the embed')
            .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

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
    const description = interaction.options.getString('description');
    const title = interaction.options.getString('title');
    const colorInput = interaction.options.getString('color');
    const targetChannel = interaction.options.getChannel('channel') || interaction.channel;
    const thumbnail = interaction.options.getString('thumbnail');
    const image = interaction.options.getString('image');
    const footer = interaction.options.getString('footer');
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
        .setDescription(description.replace(/\\n/g, '\n'))
        .setColor(embedColor);

    if (title) embed.setTitle(title);

    if (thumbnail) {
        if (thumbnail.startsWith('http://') || thumbnail.startsWith('https://')) {
            embed.setThumbnail(thumbnail);
        } else {
            return interaction.reply({
                content: 'Invalid thumbnail URL format. It must start with http:// or https://.',
                flags: [MessageFlags.Ephemeral]
            });
        }
    }

    if (image) {
        if (image.startsWith('http://') || image.startsWith('https://')) {
            embed.setImage(image);
        } else {
            return interaction.reply({
                content: 'Invalid image URL format. It must start with http:// or https://.',
                flags: [MessageFlags.Ephemeral]
            });
        }
    }

    if (footer) {
        embed.setFooter({ text: footer });
    }

    try {
        await targetChannel.send({ embeds: [embed] });
        await interaction.reply({
            content: `Embed successfully sent to ${targetChannel}!`,
            flags: hidden ? [MessageFlags.Ephemeral] : []
        });
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: 'Failed to send embed. Please ensure I have permission to send messages and embed links in the target channel.',
            flags: [MessageFlags.Ephemeral]
        });
    }
}
