import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import { createPoll } from '../../utils/polls.js';

export const data = new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a poll with buttons')
    .addStringOption(option => 
        option.setName('question')
            .setDescription('The question to ask')
            .setRequired(true))
    .addStringOption(option => option.setName('option1').setDescription('First option').setRequired(true))
    .addStringOption(option => option.setName('option2').setDescription('Second option').setRequired(true))
    .addStringOption(option => option.setName('option3').setDescription('Third option'))
    .addStringOption(option => option.setName('option4').setDescription('Fourth option'))
    .addStringOption(option => option.setName('option5').setDescription('Fifth option'));

export async function execute(interaction) {
    const question = interaction.options.getString('question');
    const options = [
        interaction.options.getString('option1'),
        interaction.options.getString('option2'),
        interaction.options.getString('option3'),
        interaction.options.getString('option4'),
        interaction.options.getString('option5'),
    ].filter(Boolean);

    const embed = new EmbedBuilder()
        .setTitle('Poll')
        .setDescription(`**${question}**\n\n` + options.map((opt, i) => `[${i + 1}] ${opt}: 0 votes`).join('\n'))
        .setColor(0x00FF00)
        .setTimestamp();

    const row = new ActionRowBuilder();
    options.forEach((opt, i) => {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`poll_vote_${i}`)
                .setLabel(`Option ${i + 1}`)
                .setStyle(ButtonStyle.Secondary)
        );
    });

    await interaction.reply({ embeds: [embed], components: [row] });
    const response = await interaction.fetchReply();
    createPoll(response.id, question, options);
}
