#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { CodePipelineStack } from '../lib/pipeline-stack'
import { MainStack } from '../lib/main-stack'

const app = new cdk.App()
const stack = new CodePipelineStack(app, 'ApplicationInternalManagement', {
    env: {
        region: 'us-east-1',
        account: '',
      },
})

new MainStack(app, 'Dev-ApplicationInternalStack', {
    env: {
        region: 'us-east-1',
        account: '',
      },
      
},"Dev")
