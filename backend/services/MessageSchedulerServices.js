const CronJob = require("cron").CronJob;
const MessageService = require("./MessageServices");

class SchedulerMessageService {
  static async setPostTime(schedule, myPost) {
    const job = new CronJob(schedule, () => {
      // TODO: postUserMessage
      console.log("cronJob done");
      console.log("cron param is: ", schedule);


      job.stop();
    });

    job.start();
  }
}

module.exports = SchedulerMessageService;
