#!/usr/bin/env node

/**
 * Bootstrap script for infrastructure pipeline deployment
 * This deploys the infrastructure pipeline stack first, which will then manage itself
 */

const { spawn } = require('child_process');

async function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: 'inherit',
      ...options
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
  });
}

async function main() {
  try {
    console.log('🏗️  Bootstrapping infrastructure pipeline...');

    // First, bootstrap CDK if needed
    console.log('Checking CDK bootstrap...');
    await runCommand('npx', ['cdk', 'bootstrap']);

    // Deploy the infrastructure pipeline stack
    console.log('Deploying infrastructure pipeline stack...');
    await runCommand('npx', ['cdk', 'deploy', 'InfrastructurePipelineStack', '--require-approval', 'never']);

    console.log('✅ Infrastructure pipeline deployed successfully!');
    console.log('🔄 The pipeline will now manage its own updates when infrastructure code changes.');

  } catch (error) {
    console.error('❌ Failed to bootstrap infrastructure pipeline:', error.message);
    process.exit(1);
  }
}

main();