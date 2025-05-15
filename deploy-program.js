import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting deployment of Fundrr program to Solana devnet...');

// Ensure we're using devnet
exec('solana config set --url devnet', (error, stdout, stderr) => {
  if (error) {
    console.error(`Config error: ${error.message}`);
    return;
  }
  console.log('Using devnet cluster');

  // Deploy the program (assumes the program has been built)
  const programDir = path.join(__dirname, 'src', 'program');
  const programId = '2YmiPygdaL7MfnB4otFDchBFd2gdEQnNeeYd4LueJFvu';

  console.log(`Attempting to deploy with program ID: ${programId}`);

  // Check if program binary exists
  const programPath = path.join(programDir, 'target', 'deploy', 'fundrr.so');
  if (!fs.existsSync(programPath)) {
    console.error(`Program binary not found at ${programPath}`);
    console.log('Please build the program first using "cd src/program && cargo build-bpf"');
    return;
  }

  // Deploy the program
  const deployCmd = `solana program deploy --program-id ${programId} ${programPath}`;
  exec(deployCmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Deployment error: ${error.message}`);
      console.error(stderr);
      return;
    }
    console.log('Program deployed successfully!');
    console.log(stdout);
  });
}); 