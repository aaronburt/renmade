import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { getGuildSetting } from '../../utils/settings.js';
import { config } from '../../config.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cachePath = path.join(__dirname, '../../../data/weather.json');

function readCache() {
    try {
        if (!fs.existsSync(cachePath)) {
            return {};
        }
        const fileContent = fs.readFileSync(cachePath, 'utf8');
        return JSON.parse(fileContent);
    } catch (error) {
        return {};
    }
}

function writeCache(cache) {
    try {
        fs.writeFileSync(cachePath, JSON.stringify(cache, null, 4));
    } catch (error) {
        console.error(error);
    }
}

export const data = new SlashCommandBuilder()
    .setName('weather')
    .setDescription('Get the current weather for a city')
    .addStringOption(option =>
        option.setName('city')
            .setDescription('The city to get weather for')
            .setRequired(true));

export async function execute(interaction) {
    const city = interaction.options.getString('city');
    const hidden = getGuildSetting(interaction.guildId, 'hidden');

    await interaction.deferReply({ flags: hidden ? [MessageFlags.Ephemeral] : [] });

    try {
        const normalizedCity = city.trim().toLowerCase();
        const cache = readCache();
        const cachedEntry = cache[normalizedCity];
        const now = Date.now();

        let weatherData;

        if (cachedEntry && now - cachedEntry.timestamp < 10 * 60 * 1000) {
            weatherData = cachedEntry.data;
        } else {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${config.OPENWEATHER_API_KEY}&units=metric`);

            if (!response.ok) {
                await interaction.editReply({ content: `Could not find weather for city: **${city}**. Please check the spelling and try again.` });
                return;
            }

            weatherData = await response.json();

            cache[normalizedCity] = {
                timestamp: now,
                data: weatherData
            };
            writeCache(cache);
        }

        const embed = new EmbedBuilder()
            .setTitle(`Weather in ${weatherData.name}, ${weatherData.sys.country}`)
            .setColor(0x3498db)
            .addFields(
                { name: 'Temperature', value: `${weatherData.main.temp}°C`, inline: true },
                { name: 'Feels Like', value: `${weatherData.main.feels_like}°C`, inline: true },
                { name: 'Humidity', value: `${weatherData.main.humidity}%`, inline: true },
                { name: 'Condition', value: weatherData.weather[0].description, inline: true }
            )
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error(error);
        await interaction.editReply({ content: 'Sorry, I encountered an error while fetching the weather.' });
    }
}
