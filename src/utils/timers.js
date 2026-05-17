import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const timersPath = path.join(__dirname, '../../data/timers.json');

export function getTimers() {
    try {
        const data = fs.readFileSync(timersPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

export function saveTimers(timers) {
    fs.writeFileSync(timersPath, JSON.stringify(timers, null, 4));
}

export function addTimer(userId, channelId, reason, timestamp) {
    const timers = getTimers();
    timers.push({ userId, channelId, reason, timestamp });
    saveTimers(timers);
}
