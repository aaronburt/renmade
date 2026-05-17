import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pollsPath = path.join(__dirname, '../../data/polls.json');

export function getPolls() {
    try {
        const data = fs.readFileSync(pollsPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

export function savePolls(polls) {
    fs.writeFileSync(pollsPath, JSON.stringify(polls, null, 4));
}

export function createPoll(messageId, question, options) {
    const polls = getPolls();
    polls[messageId] = {
        question,
        options: options.map(opt => ({ label: opt, votes: 0 })),
        voters: {}
    };
    savePolls(polls);
}

export function votePoll(messageId, userId, optionIndex) {
    const polls = getPolls();
    const poll = polls[messageId];
    if (!poll) return null;

    const previousVote = poll.voters[userId];
    if (previousVote === optionIndex) return poll;

    if (previousVote !== undefined) {
        poll.options[previousVote].votes--;
    }

    poll.options[optionIndex].votes++;
    poll.voters[userId] = optionIndex;
    
    savePolls(polls);
    return poll;
}
