// Third-Party Imports:
import z from 'zod';

// Local Imports:
import { isValidBase64 } from '../Validations/generalValidations.js';

const audioMessageSchema = z.object({
    message: z
        .string({
            invalid_type_error: 'Invalid message.',
            required_error: 'Message is required.',
        })
        .min(1, 'Message cannot be empty.')
        .refine((value) => isValidBase64(value), {
            message: 'Invalid Base64 audio format.',
        }),
});

export function validateAudioMessage(input) {
    return audioMessageSchema.safeParse(input);
}

export function validatePartialAudioMessage(input) {
    return audioMessageSchema.partial().safeParse(input);
}
