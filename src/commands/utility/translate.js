import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { generateAIResponse } from '../../utils/ai.js';
import { getGuildSetting } from '../../utils/settings.js';

export const data = new SlashCommandBuilder()
    .setName('translate')
    .setDescription('Translate text to a specified target language using Gemini')
    .addStringOption(option =>
        option.setName('text')
            .setDescription('The text to translate')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('language')
            .setDescription('The target language (e.g., Spanish, Japanese, French)')
            .setRequired(true));

export async function execute(interaction) {
    const text = interaction.options.getString('text');
    const language = interaction.options.getString('language');
    const hidden = getGuildSetting(interaction.guildId, 'hidden');

    await interaction.deferReply({ flags: hidden ? [MessageFlags.Ephemeral] : [] });

    try {
        const systemInstruction = `You are Renmade, an expert translator. Your goal is to translate the provided text to the target language: "${language}" accurately. Retain original markdown, formatting, tone, and slang, ensuring it sounds completely natural to a native speaker. Do not include any conversational filler, meta-comments, or introductory text. Output only the translated result.`;

        const response = await generateAIResponse(
            `Translate: ${text}`,
            systemInstruction,
            1200
        );

        if (!response) {
            return await interaction.editReply({ content: 'The model returned an empty response. It may have been blocked by safety filters.' });
        }

        const truncatedResponse = response.length > 1000 ? response.substring(0, 997) + '...' : response;
        const truncatedText = text.length > 1000 ? text.substring(0, 997) + '...' : text;

        const embed = new EmbedBuilder()
            .setTitle(`Translation to ${language.substring(0, 50)}`)
            .addFields(
                { name: 'Original Text', value: truncatedText },
                { name: 'Translated Text', value: truncatedResponse }
            )
            .setColor(0x00FF7F)
            .setFooter({ text: `Requested by ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        if (error.message === 'SAFETY_VIOLATION') {
            return await interaction.editReply({ content: 'Your request contains terms that violate our safety policies. Please keep conversations safe and constructive.' });
        }
        console.error(error);
        await interaction.editReply({ content: 'Sorry, I encountered an error while trying to translate that text.' });
    }
}
