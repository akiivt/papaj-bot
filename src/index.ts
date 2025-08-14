import "dotenv/config";
import { Client, Events, GatewayIntentBits } from "discord.js";
import { createAudioPlayer } from "@discordjs/voice";
import { job } from "./cronJob.ts";
import { setupVoice } from "./voiceService.ts";

async function main() {
  const discordToken = process.env.TOKEN;
  if (!discordToken) {
    throw new Error("Discord token not found");
  }

  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  });
  const player = createAudioPlayer();

  client.once(Events.ClientReady, async (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);

    await setupVoice(client, player);
    job.start();
  });

  await client.login(discordToken);
}

main();
