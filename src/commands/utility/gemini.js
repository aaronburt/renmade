import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../../config.js';
import { getGuildSetting } from '../../utils/settings.js';

export const data = new SlashCommandBuilder()
    .setName('gemini')
    .setDescription('Ask Gemini a question')
    .addStringOption(option =>
        option.setName('prompt')
            .setDescription('What do you want to ask?')
            .setRequired(true));

export async function execute(interaction) {
    const prompt = interaction.options.getString('prompt');
    const hidden = getGuildSetting(interaction.guildId, 'hidden');

    await interaction.deferReply({ flags: hidden ? [MessageFlags.Ephemeral] : [] });

    try {
        const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: config.GEMINI_MODEL_NAME,
            systemInstruction: 'You are Renmade, an AI assistant integrated into a Discord server. Your primary goal is to provide highly accurate, conversational, and exceptionally concise answers. Because you operate on Discord, your responses must be short and easy to read on both desktop and mobile devices. Focus strictly on minimizing token usage to save compute costs without sacrificing factual accuracy. Never output large blocks of text, unnecessary AI filler, or redundant explanations. Get straight to the point, answer the user\'s query directly, and keep the tone helpful and natural.',
            generationConfig: {
                maxOutputTokens: 1000,
                thinkingConfig: {
                    thinkingBudget: 1024
                }
            },
            tools: [{ googleSearch: {} }]
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        if (!text) {
            return await interaction.editReply({ content: '⚠️ The model returned an empty response. It may have been blocked by safety filters.' });
        }

        const truncatedText = text.length > 2000 ? text.substring(0, 1997) + '...' : text;

        await interaction.editReply({ content: truncatedText });
    } catch (error) {
        console.error(error);
        await interaction.editReply({ content: 'Sorry, I encountered an error while talking to Gemini.' });
    }
}