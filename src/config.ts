import { z } from "zod";

const configSchema = z.object({
  TOKEN: z.string(),
  CRON_TIME: z.string(),
  VOICE_CHANNEL_ID: z.string(),
});

export const config = configSchema.parse(process.env);
