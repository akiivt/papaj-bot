import { CronJob } from "cron";
import { eventEmitter, EventNames } from "./eventEmitter";
import { config } from "./config";

export const job = new CronJob(
  config.CRON_TIME,
  () => {
    eventEmitter.emit(EventNames.PLAY_BARKA);
  },
  null,
  false,
  "Europe/Warsaw",
);
