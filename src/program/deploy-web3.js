// Deploy using @solana/web3.js directly to bypass CLI issues
import { Connection, Keypair, Transaction, SystemProgram, sendAndConfirmTransaction } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet } from '@project-serum/anchor';
import { readFileSync } from 'fs';
import { execSync } from 'child_process';

const RPC_URL = 'https://api.devnet.solana.com';
const connection = new Connection(RPC_URL, 'confirmed');

// Load keypairs
const deployKeypairPath = '/Users/mac/.config/solana/deploy.json';
const programKeypairPath = './target/deploy/fundrr-keypair.json';

const deployKeypair = Keypair.fromSecretKey(
  Buffer.from(JSON.parse(readFileSync(deployKeypairPath, 'utf-8')))
);

console.log('Deploy keypair:', deployKeypair.publicKey.toString());
console.log('Program ID:', '2YmiPygdaL7MfnB4otFDchBFd2gdEQnNeeYd4LueJFvu');

// Check balance
const balance = await connection.getBalance(deployKeypair.publicKey);
console.log('Balance:', balance / 1e9, 'SOL');

if (balance < 0.1e9) {
  console.error('Insufficient balance for deployment');
  process.exit(1);
}

// Deploy using solana CLI but with better error handling
console.log('Deploying program...');
try {
  const programPath = './target/deploy/fundrr.so';
  const cmd = `solana program deploy ${programPath} --program-id ${programKeypairPath} --url ${RPC_URL} --keypair ${deployKeypairPath} --max-sign-attempts 10`;
  console.log('Running:', cmd);
  execSync(cmd, { stdio: 'inherit' });
  console.log('✅ Deployment successful!');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}

