import { SlashCommandBuilder, ChannelType, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { addActiveThread } from '../../utils/threads.js';
import { getGuildSetting } from '../../utils/settings.js';

export const data = new SlashCommandBuilder()
    .setName('chat')
    .setDescription('Start a new persistent Gemini chat thread')
    .addStringOption(option =>
        option.setName('name')
            .setDescription('The name/topic of the chat thread')
            .setRequired(true));

export async function execute(interaction) {
    const name = interaction.options.getString('name');
    const hidden = getGuildSetting(interaction.guildId, 'hidden');

    try {
        const thread = await interaction.channel.threads.create({
            name: name,
            autoArchiveDuration: 60,
            reason: 'Gemini Chat Thread'
        });

        addActiveThread(thread.id, interaction.user.id);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`delete_thread_${interaction.user.id}`)
                    .setLabel('Close & Delete Thread')
                    .setStyle(ButtonStyle.Danger)
            );

        await thread.send({
            content: `Welcome to your new chat thread: **${name}**! Ask me anything here, and I will reply with full thread context.`,
            components: [row]
        });

        await interaction.reply({
            content: `Chat thread created: ${thread}`,
            flags: hidden ? [MessageFlags.Ephemeral] : []
        });
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: 'Failed to create chat thread. Make sure I have permissions to create public threads in this channel.',
            flags: [MessageFlags.Ephemeral]
        });
    }
}
