import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const settingsPath = path.join(__dirname, '../../data/settings.json');

export function getSettings() {
    try {
        const data = fs.readFileSync(settingsPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

export function saveSettings(settings) {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4));
}

export function getGuildSetting(guildId, key) {
    const settings = getSettings();
    return settings[guildId]?.[key];
}

export function setGuildSetting(guildId, key, value) {
    const settings = getSettings();
    if (!settings[guildId]) settings[guildId] = {};
    settings[guildId][key] = value;
    saveSettings(settings);
}
