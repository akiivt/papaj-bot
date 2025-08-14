import "dotenv/config";
import { Client, Events, GatewayIntentBits } from "discord.js";
import { VoiceService } from "./voiceService.ts";

async function main() {
  const discordToken = process.env.TOKEN;
  if (!discordToken) {
    throw new Error("Discord token not found");
  }

  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  });

  const voiceService = new VoiceService(client);
  await voiceService.selectAudio("../audio/barka.ogg");

  client.once(Events.ClientReady, async (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);

    await voiceService.setup();
  });

  await client.login(discordToken);
}

main();
