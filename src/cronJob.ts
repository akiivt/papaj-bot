import { CronJob } from "cron";
import { eventEmitter, EventNames } from "./eventEmitter.ts";
import { config } from "./config.ts";

export const job = new CronJob(
  config.CRON_TIME,
  async () => {
    eventEmitter.emit(EventNames.PLAY_BARKA);
  },
  null,
  false,
  "Europe/Warsaw",
);
