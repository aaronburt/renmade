import { Events, REST, Routes } from 'discord.js';
import { config } from '../config.js';

export const name = Events.ClientReady;
export const once = true;

export async function execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);

    const commands = [];
    client.commands.forEach(command => {
        commands.push(command.data.toJSON());
    });

    const rest = new REST().setToken(config.DISCORD_TOKEN);

    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        let data;
        if (config.GUILD_ID) {
            data = await rest.put(
                Routes.applicationGuildCommands(config.APP_ID, config.GUILD_ID),
                { body: commands },
            );
        } else {
            data = await rest.put(
                Routes.applicationCommands(config.APP_ID),
                { body: commands },
            );
        }

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
}
