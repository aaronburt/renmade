import { GoogleGenerativeAI } from '@google/generative-ai';
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
        tools: tools || undefined
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}
