import { Stage, StageProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { MainStack } from './main-stack'

// Main deployment setup. Collection of the stacks and deployment sequence
export class Deployment extends Stage {
  constructor (scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props)
    // Deploy the main stack in the Deployment stage

    new MainStack(this, 'ApplicationInternalStack', {
      description: 'This is the main stack with IaC.',
        env: {
            region: 'us-east-1',
            account: '',
          },
    }, id)
  }
}
