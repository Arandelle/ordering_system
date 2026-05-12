import { inngest } from "../client";

export const myScheduledJob = inngest.createFunction(
  {
    id: "my-daily-job",
    triggers: [{ cron: "TZ=Asia/Manila 0 9 * * *" }], // 👈 moved here
  },
  async ({ step }) => {
    await step.run("do-the-work", async () => {
      console.log("Running scheduled job!");
    });
  }
);