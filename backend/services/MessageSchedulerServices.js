const CronJob = require("cron").CronJob;
const MessageService = require("./MessageServices");
const makeToken = require('../utils/makeToken.js');

const base = 'localhost:8000';
const cron_handle = 'fv';
class SchedulerMessageService {

  
  static async setPostTime({schedule, myPost}) {
    const job = new CronJob(schedule, async () => {
      // TODO: postUserMessage
  
      // illegal art number 462: make your own token
      const jwtoken = makeToken({
        handle: cron_handle,
        accountType: 'user',
        admin: true
      });
  
      let s = await fetch(
        `http://${base}/messages/user/${cron_handle}`,
        {
          method: 'POST',
          body: myPost,
          headers: {
            'Authorization': `Bearer ${jwtoken}`,
            'Content-Type': 'application/json'
          },
          mode: 'cors'
        }
      );
  
      console.log("cronJob done");
      console.log("cron param is: ", schedule);
  
      job.stop();
    });
  
    job.start();
  }
}
  

module.exports = SchedulerMessageService;
