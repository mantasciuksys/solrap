# solrap
Auto SOL wrap/unwrap bot

This Node.js script automatically monitors your Solana wallet for wSOL (wrapped SOL) balances. When the wSOL balance exceeds a specified threshold, the script will unwrap all wSOL into SOL and then rewrap a specified amount of SOL back into wSOL.

**Features**

Monitor wSOL Balance: Continuously checks the wSOL balance in your wallet.
Auto Unwrap: If the balance exceeds a defined threshold, the script unwraps all wSOL back to SOL.
Auto Rewrap: After unwrapping, a predefined amount of SOL is wrapped back into wSOL.
Customizable Thresholds: Set your own threshold for when to trigger the unwrapping process.

**Prerequisites**

Node.js: Make sure Node.js is installed on your system.
NPM: Ensure NPM is available for package management.

**Installation**

Clone this repository or download the script file.

Install the necessary dependencies:
npm install @solana/web3.js @solana/spl-token bs58

**Configuration**

Before running the script, you need to configure the following:

Private Key: Update the base58PrivateKey variable in the script with your wallet's private key in base58 format.

RPC URL: The script is configured to use the Tatum Solana RPC endpoint. Make sure the tatumRpcUrl contains your API key. Get your for free at www.tatum.io 

Thresholds:

thresholdWSOL: The minimum wSOL balance that triggers the unwrapping process (in SOL).
wrapAmount: The amount of SOL to wrap back into wSOL after unwrapping (in SOL).

**Usage**

Run the script with Node.js:

The script will now start monitoring your wallet and execute the unwrapping and wrapping logic as per the configured thresholds.

**Example**

// Example configuration
const thresholdWSOL = 0.05; // Unwrap if wSOL balance is 0.01 SOL or more
const wrapAmount = 0.04;    // Wrap 0.011 SOL back into wSOL after unwrapping

**License**
This project is licensed under the MIT License - see the LICENSE file for details.

**Disclaimer**

This script is provided as-is, and the authors are not responsible for any loss or damage caused by its use. Always test in a safe environment before using it with real assets.
