import { Events, EmbedBuilder, MessageFlags, PermissionFlagsBits } from 'discord.js';
import { votePoll } from '../utils/polls.js';
import { isSuperUser } from '../utils/privileges.js';
import { logResponse } from '../utils/responses.js';
import { removeActiveThread } from '../utils/threads.js';
import { logCommand } from '../utils/logger.js';

export const name = Events.InteractionCreate;

export async function execute(interaction) {
    if (interaction.isButton() && interaction.customId.startsWith('poll_vote_')) {
        const optionIndex = parseInt(interaction.customId.split('_')[2]);
        const poll = votePoll(interaction.message.id, interaction.user.id, optionIndex);

        if (poll) {
            const embed = EmbedBuilder.from(interaction.message.embeds[0])
                .setDescription(`**${poll.question}**\n\n` + poll.options.map((opt, i) => `[${i + 1}] ${opt.label}: ${opt.votes} votes`).join('\n'));

            await interaction.update({ embeds: [embed] });
        }
        return;
    }

    if (interaction.isButton() && interaction.customId.startsWith('delete_thread_')) {
        const creatorId = interaction.customId.split('_')[2];
        const isUserCreator = interaction.user.id === creatorId;
        const hasPermissions = interaction.member.permissions.has(PermissionFlagsBits.ManageThreads) || 
                              interaction.member.permissions.has(PermissionFlagsBits.ManageChannels);
        const superUser = isSuperUser(interaction.user.id);

        if (!isUserCreator && !hasPermissions && !superUser) {
            return interaction.reply({
                content: 'Only the thread creator, server staff, or Super Users can close and delete this thread.',
                flags: [MessageFlags.Ephemeral]
            });
        }

        try {
            await interaction.reply({
                content: 'Closing and deleting thread...',
                flags: [MessageFlags.Ephemeral]
            });
            removeActiveThread(interaction.channelId);
            await interaction.channel.delete();
        } catch (error) {
            console.error(error);
            await interaction.followUp({
                content: 'Failed to delete the thread. Ensure I have the Manage Threads permission.',
                flags: [MessageFlags.Ephemeral]
            });
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
            content: 'This command is restricted to **Super Users**.',
            flags: [MessageFlags.Ephemeral]
        });
    }

    logCommand(interaction);

    try {
        await command.execute(interaction);
        
        if (interaction.replied || interaction.deferred) {
            try {
                const reply = await interaction.fetchReply();
                logResponse(interaction.user.id, interaction.channelId, reply.id);
            } catch (fetchError) {
                if (fetchError.code !== 10008 && fetchError.code !== 10003) {
                    throw fetchError;
                }
            }
        }
    } catch (error) {
        console.error(error);
        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        } catch (replyError) {
            if (replyError.code !== 10008 && replyError.code !== 10003) {
                console.error(replyError);
            }
        }
    }
}
