import { RunInstancesCommand, DescribeInstancesCommand } from "@aws-sdk/client-ec2";
import { ec2Client } from "./ec2Client.js";

export async function createEC2Instance({
  instanceType,
  diskSize,
  region,
  ami,
  keyPairName,
  securityGroupId,
  subnetId
}) {
  const command = new RunInstancesCommand({
    ImageId: ami,
    InstanceType: instanceType,
    KeyName: keyPairName,
    MaxCount: 1,
    MinCount: 1,
    SecurityGroupIds: [securityGroupId],
    SubnetId: subnetId,
    BlockDeviceMappings: [
      {
        DeviceName: "/dev/sda1",
        Ebs: {
          VolumeSize: diskSize,
          VolumeType: "gp3"
        }
      }
    ]
  });

  const response = await ec2Client.send(command);

  const instanceId = response.Instances[0].InstanceId;

  // Wait until AWS updates with public IP
  await new Promise(r => setTimeout(r, 5000));

  const desc = await ec2Client.send(
    new DescribeInstancesCommand({ InstanceIds: [instanceId] })
  );

  return {
    instanceId,
    publicIp: desc.Reservations[0].Instances[0].PublicIpAddress,
    privateIp: desc.Reservations[0].Instances[0].PrivateIpAddress
  };
}
