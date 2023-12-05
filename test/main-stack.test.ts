import * as cdk from 'aws-cdk-lib'
import { Template } from 'aws-cdk-lib/assertions'
import { MainStack } from '../lib/main-stack'

const app = new cdk.App()

const stack = new MainStack(app,'Dev-ApplicationInternalStack', {
  env: {
    region: 'us-east-1',
    account: '',
  },
})
const template = Template.fromStack(stack)

test('Event Bus has been created', () => {
  // Assessment
  template.hasResource('AWS::Events::EventBus', '')
})

test('Event Bus has been created', () => {
  // Assessment
  template.hasResource('AWS::EC2::Instance', '')
})

test('MainStack has output', () => {
  // Assessment
  template.hasOutput('EventBusName', '')
})
