import { Client, VoiceBasedChannel } from "discord.js";
import {
  AudioPlayer,
  AudioPlayerStatus,
  AudioResource,
  createAudioPlayer,
  createAudioResource,
  demuxProbe,
  entersState,
  joinVoiceChannel,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import { resolve } from "node:path";
import { createReadStream } from "node:fs";
import { config } from "./config.ts";
import { eventEmitter, EventNames } from "./eventEmitter.ts";
import { job } from "./cronJob.ts";

export class VoiceService {
  player: AudioPlayer;
  client: Client;
  audioResource: AudioResource | null = null;

  private async joinVoice() {
    const channelId = config.VOICE_CHANNEL_ID;
    const voiceChannel = await this.client.channels.fetch(channelId);
    if (!voiceChannel || !voiceChannel.isVoiceBased()) {
      throw new Error("Voice channel not found");
    }

    try {
      const connection = await this.connectToChannel(voiceChannel);

      connection.subscribe(this.player);
    } catch (error) {
      console.error(error);
    }
  }

  private async playAudio() {
    if (!this.audioResource) {
      throw new Error("Audio resource not found");
    }

    this.player.play(this.audioResource);
    return entersState(this.player, AudioPlayerStatus.Playing, 5_000);
  }

  constructor(client: Client) {
    this.player = createAudioPlayer();
    this.client = client;
  }

  public async connectToChannel(channel: VoiceBasedChannel) {
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
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

  public async selectAudio(filePath: string) {
    try {
      const abs = resolve(filePath);
      const stream = createReadStream(abs);
      const { stream: probed, type } = await demuxProbe(stream);

      this.audioResource = createAudioResource(probed, {
        inputType: type,
      });
      console.log("Selected audio: ", filePath);
    } catch (error) {
      console.error(error);
    }
  }

  public async setup() {
    if (!this.audioResource) {
      throw new Error("Audio resource not found");
    }

    job.start();

    eventEmitter.on(EventNames.PLAY_BARKA, async () => {
      console.log("Playing audio");

      await this.joinVoice();
      await this.playAudio();
    });
  }
}
