import { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, MessageFlags } from 'discord.js';
import QRCode from 'qrcode';
import { getGuildSetting } from '../../utils/settings.js';

export const data = new SlashCommandBuilder()
    .setName('qrcode')
    .setDescription('Generate a scannable QR code from text or a URL link')
    .addStringOption(option =>
        option.setName('text')
            .setDescription('The text or website link to convert to a QR code')
            .setRequired(true));

export async function execute(interaction) {
    const text = interaction.options.getString('text');
    const hidden = getGuildSetting(interaction.guildId, 'hidden');

    await interaction.deferReply({ flags: hidden ? [MessageFlags.Ephemeral] : [] });

    try {
        const qrBuffer = await QRCode.toBuffer(text, { width: 300, margin: 2 });
        const attachment = new AttachmentBuilder(qrBuffer, { name: 'qrcode.png' });

        const truncatedText = text.length > 200 ? text.substring(0, 197) + '...' : text;

        const embed = new EmbedBuilder()
            .setTitle('QR Code Generated')
            .setDescription(`Scan the QR code below to access the encoded text/link:\n\`\`\`\n${truncatedText}\n\`\`\``)
            .setImage('attachment://qrcode.png')
            .setColor(0x5865F2)
            .setFooter({ text: `Requested by ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed], files: [attachment] });
    } catch (error) {
        console.error(error);
        await interaction.editReply({ content: 'Sorry, I encountered an error while trying to generate the QR code.' });
    }
}
