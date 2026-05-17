import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const threadsPath = path.join(__dirname, '../../data/threads.json');

export function getActiveThreads() {
    try {
        const data = fs.readFileSync(threadsPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

export function saveActiveThreads(threads) {
    fs.mkdirSync(path.dirname(threadsPath), { recursive: true });
    fs.writeFileSync(threadsPath, JSON.stringify(threads, null, 4));
}

export function addActiveThread(threadId, creatorId) {
    const threads = getActiveThreads();
    const exists = threads.some(t => (typeof t === 'string' ? t === threadId : t.id === threadId));
    if (!exists) {
        threads.push({ id: threadId, creatorId: creatorId });
        saveActiveThreads(threads);
    }
}

export function removeActiveThread(threadId) {
    const threads = getActiveThreads();
    const updated = threads.filter(t => (typeof t === 'string' ? t !== threadId : t.id !== threadId));
    if (threads.length !== updated.length) {
        saveActiveThreads(updated);
    }
}

export function isThreadActive(threadId) {
    const threads = getActiveThreads();
    return threads.some(t => (typeof t === 'string' ? t === threadId : t.id === threadId));
}

export function getThreadCreator(threadId) {
    const threads = getActiveThreads();
    const found = threads.find(t => typeof t !== 'string' && t.id === threadId);
    return found ? found.creatorId : null;
}
