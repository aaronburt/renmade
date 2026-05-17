import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { config } from '../config.js';

export async function generateAIResponse(prompt, customSystemInstruction, maxTokens, tools) {
    const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
        model: config.GEMINI_MODEL_NAME,
        systemInstruction: customSystemInstruction,
        generationConfig: {
            maxOutputTokens: maxTokens || 1000,
            thinkingConfig: {
                thinkingBudget: 1024
            }
        },
        safetySettings: [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
            },
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
            }
        ],
        tools: tools || undefined
    });

    try {
        const request = Array.isArray(prompt) ? { contents: prompt } : prompt;
        const result = await model.generateContent(request);
        const response = await result.response;

        if (response.promptFeedback && response.promptFeedback.blockReason) {
            throw new Error('SAFETY_VIOLATION');
        }

        if (response.candidates && response.candidates[0] && response.candidates[0].finishReason === 'SAFETY') {
            throw new Error('SAFETY_VIOLATION');
        }

        return response.text();
    } catch (error) {
        if (error.message && (error.message.includes('safety') || error.message.includes('SAFETY') || error.message.includes('blocked'))) {
            throw new Error('SAFETY_VIOLATION');
        }
        throw error;
    }
}
