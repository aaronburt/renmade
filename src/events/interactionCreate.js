import { Events, EmbedBuilder, MessageFlags } from 'discord.js';
import { votePoll } from '../utils/polls.js';
import { isSuperUser } from '../utils/privileges.js';
import { logResponse } from '../utils/responses.js';

export const name = Events.InteractionCreate;

export async function execute(interaction) {
    if (interaction.isButton() && interaction.customId.startsWith('poll_vote_')) {
        const optionIndex = parseInt(interaction.customId.split('_')[2]);
        const poll = votePoll(interaction.message.id, interaction.user.id, optionIndex);

        if (poll) {
            const embed = EmbedBuilder.from(interaction.message.embeds[0])
                .setDescription(`**${poll.question}**\n\n` + poll.options.map((opt, i) => `${i + 1}️⃣ ${opt.label}: ${opt.votes} votes`).join('\n'));

            await interaction.update({ embeds: [embed] });
        }
        return;
    }

    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    if (command.privilegedOnly && !isSuperUser(interaction.user.id)) {
        return interaction.reply({
            content: '❌ This command is restricted to **Super Users**.',
            flags: [MessageFlags.Ephemeral]
        });
    }

    try {
        await command.execute(interaction);
        
        if (interaction.replied || interaction.deferred) {
            const reply = await interaction.fetchReply();
            logResponse(interaction.user.id, interaction.channelId, reply.id);
        }
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
}
