// Third-Party Imports:
import z from 'zod';

const textMessageSchema = z.object({
    message: z
        .string({
            invalid_type_error: 'Invalid message.',
            required_error: 'Message is required.',
        })
        .min(1, 'Message cannot be empty.')
        .max(2000, 'Message must be 2000 characters or fewer.'),
});

export function validateTextMessage(input) {
    return textMessageSchema.safeParse(input);
}

export function validatePartialTextMessage(input) {
    return textMessageSchema.partial().safeParse(input);
}
