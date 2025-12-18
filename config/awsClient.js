import { EC2Client } from "@aws-sdk/client-ec2";
import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";


export const makeEc2ClientWithEnv = (region = process.env.AWS_REGION) => {
return new EC2Client({ region });
};


export const assumeRoleAndMakeEc2Client = async (roleArn, region = process.env.AWS_REGION) => {
const sts = new STSClient({ region });
const resp = await sts.send(new AssumeRoleCommand({ RoleArn: roleArn, RoleSessionName: `axeiro-${Date.now()}` }));
const creds = {
accessKeyId: resp.Credentials.AccessKeyId,
secretAccessKey: resp.Credentials.SecretAccessKey,
sessionToken: resp.Credentials.SessionToken,
};
return new EC2Client({ region, credentials: creds });
};