import EventEmitter from "node:events";

export const EventNames = {
  PLAY_BARKA: "playBarka",
} as const;

export const eventEmitter = new EventEmitter();