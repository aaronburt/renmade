import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { getGuildSetting } from '../../utils/settings.js';
import { generateAIResponse } from '../../utils/ai.js';

export const data = new SlashCommandBuilder()
    .setName('summarise')
    .setDescription('Summarise the recent chat history')
    .addIntegerOption(option =>
        option.setName('limit')
            .setDescription('Number of messages to summarise (default: 50, max: 100)')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(100))
    .addBooleanOption(option =>
        option.setName('ignore_bots')
            .setDescription('Ignore bot messages in the summary (default: false)')
            .setRequired(false));

export async function execute(interaction) {
    const limit = interaction.options.getInteger('limit') || 50;
    const ignoreBots = interaction.options.getBoolean('ignore_bots') ?? false;
    const hidden = getGuildSetting(interaction.guildId, 'hidden');

    await interaction.deferReply({ flags: hidden ? [MessageFlags.Ephemeral] : [] });

    console.log(`Executing /summarise command with limit: ${limit}, ignoreBots: ${ignoreBots}`);

    try {
        const fetched = await interaction.channel.messages.fetch({ limit });
        const messagesArray = Array.from(fetched.values()).reverse();
        const filtered = messagesArray.filter(msg => {
            if (msg.author.id === interaction.client.user.id) {
                return false;
            }
            if (ignoreBots && msg.author.bot) {
                return false;
            }
            return true;
        });

        console.log(`Fetched ${messagesArray.length} total messages in channel. Filtered down to ${filtered.length} messages (ignoreBots: ${ignoreBots}).`);

        if (filtered.length === 0) {
            console.log('Returning early: 0 filtered messages found.');
            return await interaction.editReply({ content: 'The provided log contains no substantive conversation or information to summarize.' });
        }

        const compressedString = filtered.map(msg => {
            let text = msg.content || '';
            if (!text && msg.embeds && msg.embeds.length > 0) {
                text = msg.embeds.map(e => [e.title, e.description].filter(Boolean).join(' - ')).filter(Boolean).join(' | ');
            }
            return `${msg.author.username}: ${text}`;
        }).filter(line => {
            const parts = line.split(': ');
            return parts[1] && parts[1].trim();
        }).join('\n');

        if (!compressedString.trim()) {
            console.log('Returning early: Compressed string is empty/whitespace only.');
            return await interaction.editReply({ content: 'The provided log contains no substantive conversation or information to summarize.' });
        }

        const prompt = `Here is the Discord chat log to summarise:\n${compressedString}`;
        console.log('Prompt to Gemini:');
        console.log(prompt);

        const text = await generateAIResponse(
            prompt,
            'You are an assistant that summarises Discord chat logs. Provide a brief, high-level summary of the ongoing conversations. Ignore casual greetings. Be highly concise. If the log contains no substantive conversation or information to summarize, always output exactly: "The provided log contains no substantive conversation or information to summarize."',
            250
        );

        if (!text) {
            return await interaction.editReply({ content: 'The provided log contains no substantive conversation or information to summarize.' });
        }

        const truncatedText = text.length > 2000 ? text.substring(0, 1997) + '...' : text;

        await interaction.editReply({ content: truncatedText });
    } catch (error) {
        console.error(error);
        await interaction.editReply({ content: '❌ Failed to fetch channel history or generate summary. Ensure I have permission to read this channel.' });
    }
}
