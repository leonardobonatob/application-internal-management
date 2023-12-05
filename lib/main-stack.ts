import { CfnElement, CfnOutput, Fn, Stack, StackProps } from 'aws-cdk-lib'
import { EventBus } from 'aws-cdk-lib/aws-events'
import { Construct } from 'constructs'
import * as ec2 from "aws-cdk-lib/aws-ec2"; // Allows working with EC2 and VPC resources
import * as iam from "aws-cdk-lib/aws-iam"; // Allows working with IAM resources
import * as s3assets from "aws-cdk-lib/aws-s3-assets"; // Allows managing files with S3
import * as keypair from "cdk-ec2-key-pair"; // Helper to create EC2 SSH keypairs
import * as path from "path"; // Helper for working with file paths
import * as s3 from "aws-cdk-lib/aws-s3-deployment";
import * as s3bucket from "aws-cdk-lib/aws-s3";
import {readFileSync} from 'fs';
import { AaaaRecord } from 'aws-cdk-lib/aws-route53';


export class MainStack extends Stack {
  constructor (scope: Construct, id: string, props?: StackProps, idStage?: string) {
    super(scope, id, props)

    // Create a sample event bus
    const eventBus = new EventBus(this, 'EventBus-'+idStage)


    const vpc = ec2.Vpc.fromLookup(this, "CheckPCAlreadyCreated1", {vpcName: "AppInternalManagement-vpc"});
    // Create a key pair to be used with this EC2 Instance
    const key = new keypair.KeyPair(this, "KeyPair-"+idStage, {
      name: "app-internal-management-keypair-"+idStage,
      description: "Key Pair created with CDK Deployment",
    });
    key.grantReadOnPublicKey; 

    // Security group for the EC2 instance
    const securityGroup = new ec2.SecurityGroup(this, "SecurityGroupAppInternalManagement-"+idStage, {
      vpc: vpc,
      description: "Allow SSH (TCP port 22) and HTTP (TCP port 80) in",
      allowAllOutbound: true,
    });

    // Allow SSH access on port tcp/22
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      "Allow SSH Access"
    );

    // Allow HTTP access on port tcp/80
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      "Allow HTTPS Access"
    );

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      "Allow HTTP Access"
    );

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(3000),
      "Allow User Access"
    );

    // IAM role to allow access to other AWS services
    const role = new iam.Role(this, "ec2Role-"+idStage, {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
    });

    // IAM policy attachment to allow access to 
    role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore")
    );

    role.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: ["arn:aws:s3:::your-bucket/*"],
      actions: ['s3:ListBucket','s3:GetObject','s3:PutObject']}));

    // Put app folder in S3 Bucket
    const s3deploy = new s3.BucketDeployment(this, 'DeployAppClassroom', {
      sources: [s3.Source.asset('./app/app.zip')],
      destinationBucket: s3bucket.Bucket.fromBucketName(this,"CheckBucketDestination","your-bucket"),
      destinationKeyPrefix: idStage,
      extract: false
    });

    // Look up the AMI Id for the Amazon Linux 2 Image with CPU Type X86_64
    const ami = new ec2.AmazonLinuxImage({
      generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      cpuType: ec2.AmazonLinuxCpuType.X86_64,
    });


    // Create the EC2 instance using the Security Group, AMI, and KeyPair defined.
    const ec2Instance = new ec2.Instance(this, "Instance-"+idStage, {
      vpc: vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ami,
      securityGroup: securityGroup,
      keyName: key.keyPairName,
      role: role,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
    });

    if(idStage == 'Dev'){
      var allocId = '';
      var userdatastep = './lib/user-data-dev.sh';
    }
    else if(idStage == 'Test'){
      var allocId = '';
      var userdatastep = './lib/user-data-test.sh';
    }
    else{
      var allocId = '';
      var userdatastep = './lib/user-data-prod.sh';
    }

    const eip = new ec2.CfnEIPAssociation(this,'EIPAssociation-'+idStage, {
        allocationId: allocId,
        instanceId: ec2Instance.instanceId
    });

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(8888),
      "Allow App layer Access from instance"
    );
    // 👇 load user data script
    var userDataScript = readFileSync('./lib/user-data.sh', 'utf8');
    // 👇 add user data to the EC2 instance
    // Adds our custom application
    userDataScript += "\nsudo aws s3 cp s3://your-bucket/" +idStage + "/" + Fn.select(0,s3deploy.objectKeys) + " ." +  "\nsudo unzip " + Fn.select(0,s3deploy.objectKeys) + "\ncd backend/" + "\nsudo npm install" + "\nsudo node setup/setup.js" + "\nsudo npm run dev &\n" 
    //userDataScript += "\ncd .." + "\ncd frontend/src/" + "\nsudo chmod -R 777 config/" + "\ncd config/" + "\necho 'export const API_BASE_URL = 'http://"+instanceId+":8888/api/';\nexport const BASE_URL = 'http://"+instanceId+":8888/';\nexport const DOWNLOAD_BASE_URL = 'http://"+instanceId+":8888/download/';\nexport const ACCESS_TOKEN_NAME = 'x-auth-token';' > serverApiConfig.js" + "\ncd.." + "\ncd.." +"\nsudo npm install" + "\nsudo npm run start"
    userDataScript += readFileSync(userdatastep,'utf8')
    ec2Instance.addUserData(userDataScript);


    // Output
    new CfnOutput(this, 'EventBusName', {
      value: eventBus.eventBusName
    })

    new CfnOutput(this,'EC2InstanceId',{value: ec2Instance.instanceId });
    new CfnOutput(this,'EC2InstanceIP',{value: ec2Instance.instancePublicIp });
    new CfnOutput(this, 'S3Output', { value: Fn.select(0,s3deploy.objectKeys) });
  }
}
