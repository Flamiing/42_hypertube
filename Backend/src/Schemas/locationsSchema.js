// Third-Party Imports:
import z from 'zod';

const locationsSchema = z.object({
    locationOne: z.object(
        {
            latitude: z
                .number({
                    required_error: 'Location one latitude is required.',
                })
                .min(-90, { message: 'Latitude must be between -90 and 90' })
                .max(90, { message: 'Latitude must be between -90 and 90' }),
            longitude: z
                .number({
                    required_error: 'Location one longitude is required.',
                })
                .min(-180, {
                    message: 'Longitude must be between -180 and 180',
                })
                .max(180, {
                    message: 'Longitude must be between -180 and 180',
                }),
        },
        {
            required_error: 'LocationOne is required.',
        }
    ),
    locationTwo: z.object(
        {
            latitude: z
                .number({
                    required_error: 'Location two latitude is required.',
                })
                .min(-90, { message: 'Latitude must be between -90 and 90' })
                .max(90, { message: 'Latitude must be between -90 and 90' }),
            longitude: z
                .number({
                    required_error: 'Location two longitude is required.',
                })
                .min(-180, {
                    message: 'Longitude must be between -180 and 180',
                })
                .max(180, {
                    message: 'Longitude must be between -180 and 180',
                }),
        },
        {
            required_error: 'LocationOne is required.',
        }
    ),
});

export function validateLocations(input) {
    return locationsSchema.safeParse(input);
}

export function validatePartialLocations(input) {
    return locationsSchema.partial().safeParse(input);
}
