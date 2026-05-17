import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { generateAIResponse } from '../../utils/ai.js';
import { getGuildSetting } from '../../utils/settings.js';

export const data = new SlashCommandBuilder()
    .setName('explain')
    .setDescription('Explain a complex topic, code block, or term')
    .addStringOption(option =>
        option.setName('topic')
            .setDescription('What do you want explained?')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('style')
            .setDescription('The style/tone of the explanation')
            .setRequired(false)
            .addChoices(
                { name: 'Explain Like I\'m 5', value: 'eli5' },
                { name: 'Standard Overview', value: 'standard' },
                { name: 'Technical Analysis', value: 'technical' },
                { name: 'Metaphor/Analogy', value: 'analogy' }
            ));

const STYLE_PROMPTS = {
    eli5: 'Explain the topic using extremely simple language, avoiding all complex jargon. Use friendly, easy-to-understand terms and basic analogies as if you are speaking to a 5-year-old child.',
    standard: 'Provide a clear, concise, and structured overview of the topic in brief, natural paragraphs.',
    technical: 'Provide a dense, precise, and professional technical analysis in brief paragraphs. Use accurate terminology and focus on the underlying mechanics.',
    analogy: 'Explain this topic entirely through a highly creative, detailed, and relatable real-world comparison or metaphor. Relate the mechanics of the topic directly to the mechanics of the metaphor.'
};

const STYLE_COLORS = {
    eli5: 0xFFA500,
    standard: 0x0099FF,
    technical: 0x8A2BE2,
    analogy: 0x00FF00
};

const STYLE_LABELS = {
    eli5: 'Explain Like I\'m 5',
    standard: 'Standard Overview',
    technical: 'Technical Analysis',
    analogy: 'Metaphor/Analogy'
};

export async function execute(interaction) {
    const topic = interaction.options.getString('topic');
    const style = interaction.options.getString('style') || 'standard';
    const hidden = getGuildSetting(interaction.guildId, 'hidden');

    await interaction.deferReply({ flags: hidden ? [MessageFlags.Ephemeral] : [] });

    try {
        const styleInstruction = STYLE_PROMPTS[style];
        const systemInstruction = `You are Renmade, an expert educator and AI assistant. Your goal is to explain concepts with absolute clarity, ensuring the question is fully answered without leaving any room for misunderstanding or ambiguity. ${styleInstruction} You must ONLY use natural, paragraph-based conversational language. Never use bullet points, numbered lists, checklists, or grids. Keep the explanation exceptionally concise and strictly limited to a maximum of 2 natural paragraphs to optimize token usage. Get straight to the point, avoiding any pleasantries or filler.`;

        const response = await generateAIResponse(
            `Explain: ${topic}`,
            systemInstruction,
            500
        );

        if (!response) {
            return await interaction.editReply({ content: 'The model returned an empty response. It may have been blocked by safety filters.' });
        }

        const truncated = response.length > 2000 ? response.substring(0, 1997) + '...' : response;

        const embed = new EmbedBuilder()
            .setTitle(`Explanation: ${topic.substring(0, 200)}`)
            .setDescription(truncated)
            .setColor(STYLE_COLORS[style])
            .setFooter({ text: `Style: ${STYLE_LABELS[style]} • Requested by ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        if (error.message === 'SAFETY_VIOLATION') {
            return await interaction.editReply({ content: 'Your request contains terms that violate our safety policies. Please keep conversations safe and constructive.' });
        }
        console.error(error);
        await interaction.editReply({ content: 'Sorry, I encountered an error while trying to explain that topic.' });
    }
}
