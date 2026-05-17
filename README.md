# 🤖 Renmade Discord Bot

Renmade is a modular, high-performance, and feature-rich Discord bot built using Node.js, ES Modules, and `discord.js` v14. It is designed with robust security controls, persistent custom features, and native integration with Gemini AI models.

---

## ✨ Features

*   **🌐 Google-Powered Gemini AI (`/gemini`):** Direct communication with Gemini models featuring automatic safety filters, a cost-controlled `1024` token thinking budget, and real-time **Google Search Grounding** for mathematically and factually accurate answers.
*   **⏰ Crash-Proof Reminders (`/remind`, `/timers`):** A custom, file-backed background service that runs on a 5-second interval. Reminders survive bot crashes and restarts, and can be viewed or canceled anytime via slash commands.
*   **📊 Dynamic Button Polls (`/poll`):** Fully interactive voting system updating embeds in real-time with unique voter mapping to prevent double-voting.
*   **🛡️ Dual-Layer Privileges:** Built-in permission gates distinguishing standard users from whitelisted **Super Users** and the Bot Owner (automatically assigned on boot).
*   **🔒 Channel Isolation (`/lock`, `/unlock`):** Instant, non-destructive channel freeze/unfreeze toggles for moderators.
*   **🧹 Smart Cleanup (`/clear`):** Privileged command designed to safely purge up to 50 of the bot's own recent messages from the channel history.
*   **📝 Dynamic Boot Logs:** Prints a complete checklist of successfully verified commands and loaded event listeners in the console on startup.

---

## 📚 Command Catalog

### 👥 Public Commands
*   `/gemini prompt:[question]` - Ask the bot a question using Google Search grounding.
*   `/poll question:[text] options:[A|B|...]` - Create an interactive poll with button-based voting.
*   `/remind minutes:[int] reason:[text]` - Schedule a custom persistent reminder.
*   `/timers` - List your active reminders. Use `/timers cancel:[number]` to delete one.
*   `/serverinfo` - Display detailed guild statistics, boost levels, and timestamps.
*   `/help` - View a dynamic, role-aware directory of commands.
*   `/avatar user:[optional]` - View high-resolution user avatars.
*   `/uptime` - Show the bot's precise connection uptime.
*   `/ping` - Get real-time WebSocket latency stats.
*   `/coinflip` / `/roll` - Quick fun randomizers.

### 🛡️ Privileged Commands
*   `/clear` - Purge up to 50 recent messages sent by this bot in the channel.
*   `/config hidden:[true|false]` - Toggle ephemeral (hidden) responses per server.
*   `/whois user:[target]` - View advanced member metadata, join dates, and badges.
*   `/slowmode seconds:[int]` - Adjust the current channel's rate limit.
*   `/lock` / `/unlock` - Freeze or restore text input permissions for `@everyone`.

---

## ⚙️ Configuration & Setup

### 1. Environment File (`.env`)
Create a `.env` file in the root of the project:

```env
DISCORD_TOKEN=your_discord_bot_token
APP_ID=your_discord_application_id
GUILD_ID=your_target_server_guild_id
OWNER_ID=your_discord_user_id
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL_NAME=gemini-3.1-flash-lite
```

### 2. Installation
Install all required packages:
```bash
npm install
```

### 3. Running the Bot
Launch the gateway client and activate background services:
```bash
npm start
```
