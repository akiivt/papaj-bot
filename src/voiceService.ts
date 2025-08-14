import { Client, VoiceBasedChannel } from "discord.js";
import {
  AudioPlayer, AudioPlayerStatus,
  AudioResource,
  createAudioResource,
  demuxProbe, entersState, joinVoiceChannel, VoiceConnectionStatus,
} from "@discordjs/voice";
import { resolve } from "node:path";
import { createReadStream } from "node:fs";
import { config } from "./config.ts";
import { eventEmitter, EventNames } from "./eventEmitter.ts";

export async function selectAudio(filePath: string) {
  const abs = resolve(filePath);
  const stream = createReadStream(abs);
  const { stream: probed, type } = await demuxProbe(stream);

  return createAudioResource(probed, {
    inputType: type,
  });
}

async function playAudio(
  player: AudioPlayer,
  resource: AudioResource,
): Promise<AudioPlayer> {
  player.play(resource);

  return entersState(player, AudioPlayerStatus.Playing, 5_000);
}

async function connectToChannel(channel: VoiceBasedChannel) {
  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
    // selfDeaf: false,
  });

  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 30_000);

    console.log("Connection ready");

    return connection;
  } catch (error) {
    connection.destroy();

    throw error;
  }
}

async function joinVoice(
  client: Client,
  player: AudioPlayer,
) {
  const channelId = config.VOICE_CHANNEL_ID;
  const voiceChannel = await client.channels.fetch(channelId);
  if (!voiceChannel || !voiceChannel.isVoiceBased()) {
    throw new Error("Voice channel not found");
  }

  try {
    const connection = await connectToChannel(voiceChannel);

    connection.subscribe(player);
  } catch (error) {
    console.error(error);
  }
}

export async function setupVoice(client: Client, player: AudioPlayer) {
  let resource: AudioResource | null = null;
  try {
    resource = await selectAudio("audio.ogg");

    console.log("Ready to play audio");
  } catch (error) {
    console.error(error);
  }

  if (!resource) return;
  eventEmitter.on(EventNames.PLAY_BARKA, async () => {
    console.log("Playing audio");
    
    await joinVoice(client, player);
    await playAudio(player, resource);
  });
}