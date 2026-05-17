import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
    DISCORD_TOKEN: z.string()
        .min(1, 'Discord Token is required')
        .refine((val) => val.split('.').length === 3, {
            message: 'Invalid Discord Token format. It should have 3 parts separated by dots.',
        }),
    APP_ID: z.string()
        .min(1, 'Application ID is required')
        .regex(/^\d+$/, 'Application ID must be a numeric string'),
    GUILD_ID: z.string()
        .regex(/^\d+$/, 'Guild ID must be a numeric string')
        .optional()
        .or(z.literal('')),
    OWNER_ID: z.string()
        .min(1, 'Owner ID is required')
        .regex(/^\d+$/, 'Owner ID must be a numeric string'),
    GEMINI_API_KEY: z.string().optional().or(z.literal('')),
    GEMINI_MODEL_NAME: z.string().optional().or(z.literal('')),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
    console.error('❌ Invalid environment variables:');
    result.error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
}

export const config = result.data;
