const solanaWeb3 = require('@solana/web3.js');
const splToken = require('@solana/spl-token');
const bs58 = require('bs58').default;

const base58PrivateKey = 'YOUR PRIVATE SOLANA WALLET KEY';

const privateKeyUint8Array = bs58.decode(base58PrivateKey);

// Use the Tatum RPC URL with the API key in the URL
const tatumRpcUrl = 'https://api.tatum.io/v3/blockchain/node/solana-mainnet/YOUR-TATUM-API-KEY';

const connection = new solanaWeb3.Connection(tatumRpcUrl, 'confirmed');
const wallet = solanaWeb3.Keypair.fromSecretKey(privateKeyUint8Array);
const wSOLMintAddress = splToken.NATIVE_MINT; // wSOL mint address

const thresholdWSOL = 0.05; 
const wrapAmount = 0.04; 

console.log('Wallet Public Key:', wallet.publicKey.toBase58());

async function getOrCreateAssociatedTokenAccount(connection, mint, owner, payer) {
    const associatedTokenAddress = await splToken.getAssociatedTokenAddress(mint, owner);

    const accountInfo = await connection.getAccountInfo(associatedTokenAddress);

    if (accountInfo === null) {
        console.log('Creating associated token account for wSOL...');

        const transaction = new solanaWeb3.Transaction().add(
            splToken.createAssociatedTokenAccountInstruction(
                payer.publicKey,
                associatedTokenAddress,
                owner,
                mint
            )
        );

        await solanaWeb3.sendAndConfirmTransaction(connection, transaction, [payer]);
        console.log('Associated token account created.');
    } else {
        console.log('Associated token account already exists.');
    }

    return associatedTokenAddress;
}

async function unwrapAllWSOL(connection, wallet, wSOLAccount) {
    const transaction = new solanaWeb3.Transaction().add(
        splToken.createCloseAccountInstruction(
            wSOLAccount,
            wallet.publicKey,
            wallet.publicKey,
            []
        )
    );

    try {
        const signature = await solanaWeb3.sendAndConfirmTransaction(connection, transaction, [wallet]);
        console.log(`Unwrapped all wSOL. Transaction signature: ${signature}`);
    } catch (error) {
        console.error('Error during unwrapping:', error);
    }
}

async function wrapSOL(connection, wallet, wrapAmountLamports) {
    try {
        const wSOLAccount = await getOrCreateAssociatedTokenAccount(connection, wSOLMintAddress, wallet.publicKey, wallet);

        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: wallet.publicKey,
                toPubkey: wSOLAccount,
                lamports: wrapAmountLamports
            }),
            splToken.createSyncNativeInstruction(wSOLAccount)
        );

        const wrapSignature = await solanaWeb3.sendAndConfirmTransaction(connection, transaction, [wallet]);
        console.log(`Wrapped ${wrapAmountLamports / solanaWeb3.LAMPORTS_PER_SOL} SOL back into wSOL. Transaction signature: ${wrapSignature}`);
    } catch (error) {
        console.error('Error during wrapping:', error);
    }
}

async function checkAndUnwrapAndWrapBack() {
    try {
        const wSOLAccount = await getOrCreateAssociatedTokenAccount(connection, wSOLMintAddress, wallet.publicKey, wallet);

        const tokenBalance = await connection.getTokenAccountBalance(wSOLAccount);

        const balanceInSOL = parseFloat(tokenBalance.value.amount) / solanaWeb3.LAMPORTS_PER_SOL;

        console.log(`Current wSOL balance: ${balanceInSOL} SOL`);

        if (balanceInSOL >= thresholdWSOL) {
            console.log(`Threshold met! Unwrapping all ${balanceInSOL} SOL...`);

            await unwrapAllWSOL(connection, wallet, wSOLAccount);

            const newWSOLAccount = await getOrCreateAssociatedTokenAccount(connection, wSOLMintAddress, wallet.publicKey, wallet);

            const wrapAmountLamports = wrapAmount * solanaWeb3.LAMPORTS_PER_SOL;
            await wrapSOL(connection, wallet, wrapAmountLamports);
        } else {
            console.log(`Threshold not met. No action taken.`);
        }
    } catch (error) {
        console.error('Error checking balance or unwrapping SOL:', error);
    }
}

setInterval(checkAndUnwrapAndWrapBack, 20000);
