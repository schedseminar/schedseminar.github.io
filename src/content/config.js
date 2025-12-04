import {defineCollection, z} from "astro:content";

const talks = defineCollection({
    type: 'data',
    schema: z.object({
        title: z.string(),
        abstract: z.string().optional(),
        presenter: z.object({
            name: z.string(),
            affiliation: z.string(),
            photo: z.string(),
            link: z.string(),
            continent: z.string(),
        }),
        invitedBy: z.string(),
        datePrague: z.string(),
        keywords: z.string().optional(),
        pdf: z.string().optional(),
        video: z.string().optional(),
        youtubeEmbed: z.string().optional(),
        status: z.enum(["upcoming", "past"]),
    }),
});

export const collections = {talks};
