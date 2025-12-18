import { createEC2Instance } from "../aws/createInstance.js";
import Task from "../models/Task.js";


export async function processProvisionTask(task) {
  try {
    await Task.updateOne({ _id: task._id }, { status: "provisioning" });

    const result = await createEC2Instance({
      instanceType: task.instanceType,
      diskSize: task.diskSize,
      region: task.region,
      ami: task.ami,
      keyPairName: process.env.AWS_KEY_PAIR,
      securityGroupId: process.env.AWS_SECURITY_GROUP,
      subnetId: process.env.AWS_SUBNET_ID
    });

    await Task.updateOne(
      { _id: task._id },
      {
        status: "running",
        instanceId: result.instanceId,
        publicIp: result.publicIp
      }
    );

  } catch (err) {
    await Task.updateOne({ _id: task._id }, { status: "failed", error: err.message });
  }
}
