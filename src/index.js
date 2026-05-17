import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { config } from './config.js';
import { startTimerManager } from './utils/timerManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

const loadedCommands = [];

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = await import(`file://${filePath}`);
        if ('data' in command && 'execute' in command) {
            if (command.data.name === 'gemini' && (!config.GEMINI_API_KEY || config.GEMINI_API_KEY === 'your_gemini_key_here')) {
                console.log('Skipping /gemini command: GEMINI_API_KEY not set.');
                continue;
            }
            client.commands.set(command.data.name, command);
            loadedCommands.push(command.data.name);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}
console.log(`Loaded commands: ${loadedCommands.join(', ')}`);

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
const loadedEvents = [];

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = await import(`file://${filePath}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
    loadedEvents.push(file);
}
console.log(`Loaded events: ${loadedEvents.join(', ')}`);

client.login(config.DISCORD_TOKEN);
startTimerManager(client);
