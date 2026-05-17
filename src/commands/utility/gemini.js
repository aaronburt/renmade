import { SlashCommandBuilder, MessageFlags, Collection } from 'discord.js';
import { getGuildSetting } from '../../utils/settings.js';
import { generateAIResponse } from '../../utils/ai.js';

const cooldowns = new Collection();

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
    const cooldownLimit = getGuildSetting(interaction.guildId, 'gemini_cooldown') || 0;

    if (cooldownLimit > 0 && cooldowns.has(interaction.user.id)) {
        const lastPromptTime = cooldowns.get(interaction.user.id);
        const now = Date.now();
        const expirationTime = lastPromptTime + cooldownLimit * 1000;
        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            await interaction.reply({
                content: `Please wait ${timeLeft.toFixed(1)} more second(s) before using the gemini command again.`,
                flags: [MessageFlags.Ephemeral]
            });
            return;
        }
    }

    await interaction.deferReply({ flags: hidden ? [MessageFlags.Ephemeral] : [] });

    try {
        if (cooldownLimit > 0) {
            cooldowns.set(interaction.user.id, Date.now());
            setTimeout(() => {
                cooldowns.delete(interaction.user.id);
            }, cooldownLimit * 1000);
        }

        const text = await generateAIResponse(
            prompt,
            'You are Renmade, a friendly, conversational AI assistant on Discord. Keep your tone natural, engaging, and helpful. You must ONLY use natural, paragraph-based conversational language. Never use bullet points, numbered lists, markdown checklists, or structured grids; speak naturally as a human friend would in a casual chat. Aggressively minimize token usage to save compute costs. Deliver extremely concise, short responses that are highly readable on desktop and mobile. Avoid any wordiness, AI filler, conversational pleasantries, or verbose explanations. Get straight to the point.',
            250,
            [{ googleSearch: {} }]
        );

        if (!text) {
            return await interaction.editReply({ content: 'The model returned an empty response. It may have been blocked by safety filters.' });
        }

        const truncatedText = text.length > 2000 ? text.substring(0, 1997) + '...' : text;

        await interaction.editReply({ content: truncatedText });
    } catch (error) {
        if (error.message === 'SAFETY_VIOLATION') {
            return await interaction.editReply({ content: 'Your request contains terms that violate our safety policies. Please keep conversations safe and constructive.' });
        }
        console.error(error);
        await interaction.editReply({ content: 'Sorry, I encountered an error while talking to Gemini.' });
    }
}