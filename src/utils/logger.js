import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDirectory = path.join(__dirname, '../../logs');
const logFilePath = path.join(logDirectory, 'commands.log');

export function logCommand(interaction) {
    try {
        fs.mkdirSync(logDirectory, { recursive: true });
        
        const timestamp = new Date().toISOString();
        const commandName = interaction.commandName;
        const userId = interaction.user.id;
        const username = interaction.user.tag;
        const guildId = interaction.guildId || 'DM';
        const channelId = interaction.channelId;

        const options = [];
        interaction.options.data.forEach(opt => {
            if (opt.value !== undefined) {
                options.push(`${opt.name}:${opt.value}`);
            } else if (opt.options) {
                opt.options.forEach(subOpt => {
                    options.push(`${opt.name}.${subOpt.name}:${subOpt.value}`);
                });
            }
        });
        const optionsStr = options.length > 0 ? ` [${options.join(', ')}]` : '';

        const logMessage = `[${timestamp}] User: ${username} (${userId}) | Command: /${commandName}${optionsStr} | Guild: ${guildId} | Channel: ${channelId}\n`;
        
        fs.appendFileSync(logFilePath, logMessage, 'utf8');
    } catch (error) {
        console.error('Failed to write to command log:', error);
    }
}
