const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const programPath = path.join(__dirname, 'target/deploy/fundrr.so');
const keypairPath = path.join(__dirname, 'target/deploy/fundrr-keypair.json');
const deployKeypair = '/Users/mac/.config/solana/deploy.json';

if (!fs.existsSync(programPath)) {
  console.error('Program binary not found!');
  process.exit(1);
}

console.log('Deploying program directly...');
console.log('Program:', programPath);
console.log('Program ID:', '2YmiPygdaL7MfnB4otFDchBFd2gdEQnNeeYd4LueJFvu');

try {
  // Try direct solana program deploy
  const cmd = `solana program deploy ${programPath} --program-id ${keypairPath} --url https://api.devnet.solana.com --keypair ${deployKeypair}`;
  console.log('Running:', cmd);
  const output = execSync(cmd, { encoding: 'utf-8', stdio: 'inherit' });
  console.log(output);
} catch (error) {
  console.error('Deployment failed:', error.message);
  process.exit(1);
}
