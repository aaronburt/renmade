import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { isThreadActive, getThreadCreator, removeActiveThread } from '../../utils/threads.js';
import { isSuperUser } from '../../utils/privileges.js';

export const data = new SlashCommandBuilder()
    .setName('exit')
    .setDescription('Exit and delete the current Gemini chat thread');

export async function execute(interaction) {
    if (!interaction.channel.isThread()) {
        return await interaction.reply({
            content: 'This command can only be used inside thread channels.',
            flags: [MessageFlags.Ephemeral]
        });
    }

    if (!isThreadActive(interaction.channelId)) {
        return await interaction.reply({
            content: 'This command can only be used inside active Gemini chat threads.',
            flags: [MessageFlags.Ephemeral]
        });
    }

    const creatorId = getThreadCreator(interaction.channelId);
    const isCreator = creatorId ? interaction.user.id === creatorId : false;
    const superUser = isSuperUser(interaction.user.id);

    if (!isCreator && !superUser) {
        return await interaction.reply({
            content: 'Only the original thread creator or a Super User can delete this thread.',
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
}
