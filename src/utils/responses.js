import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const responsesPath = path.join(__dirname, '../../data/responses.json');

export function getResponses() {
    try {
        const data = fs.readFileSync(responsesPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

export function saveResponses(responses) {
    fs.writeFileSync(responsesPath, JSON.stringify(responses, null, 4));
}

export function logResponse(userId, channelId, messageId) {
    const responses = getResponses();
    if (!responses[userId]) responses[userId] = [];
    responses[userId].push({ channelId, messageId });
    saveResponses(responses);
}

export function getUserResponses(userId) {
    const responses = getResponses();
    return responses[userId] || [];
}

export function clearUserResponses(userId) {
    const responses = getResponses();
    delete responses[userId];
    saveResponses(responses);
}
