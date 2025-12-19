// root/worker/taskWorkers.js
import {BuildJobs, Deployments} from '../models/index.js'
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export async function workerLoop() {
  while (true) {
    const job = await BuildJobs.findOneAndUpdate(
      { status: "PENDING" },
      { status: "RUNNING", startedAt: new Date() },
      { new: true }
    );

    if (!job) {
      await sleep(3000);
      continue;
    }

    try {
      await runBuild(job);   // clone → build → push (later)

      await Deployments.updateOne(
  { _id: job.deploymentId },
  { status: "BUILDING_IMAGE" }
);

      job.status = "SUCCESS";
      job.finishedAt = new Date();
      await job.save();

      await Deployments.updateOne(
        { _id: job.deploymentId },
        { status: "DEPLOYING" }
      );

    } catch (err) {
      job.status = "FAILED";
      job.error = err.message;
      await job.save();

      await Deployments.updateOne(
        { _id: job.deploymentId },
        { status: "FAILED", error: err.message }
      );
    }
  }
}