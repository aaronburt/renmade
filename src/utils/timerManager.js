import { getTimers, saveTimers } from './timers.js';

export function startTimerManager(client) {
    setInterval(async () => {
        const timers = getTimers();
        if (timers.length === 0) return;

        const now = Date.now();
        const expired = timers.filter(t => t.timestamp <= now);
        const remaining = timers.filter(t => t.timestamp > now);

        if (expired.length > 0) {
            for (const timer of expired) {
                try {
                    const channel = await client.channels.fetch(timer.channelId);
                    if (channel) {
                        await channel.send(`🔔 <@${timer.userId}>, here is your reminder: **${timer.reason}**`);
                    }
                } catch (error) {
                    console.error(`Failed to send reminder to ${timer.userId}:`, error);
                }
            }
            saveTimers(remaining);
        }
    }, 5000);
}
