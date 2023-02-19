import { closeAccount, createAssociatedTokenAccount, createAssociatedTokenAccountInstruction, createSyncNativeInstruction, getAccount, getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount, NATIVE_MINT, transfer } from '@solana/spl-token'
import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmRawTransaction, sendAndConfirmTransaction, SystemProgram, Transaction } from '@solana/web3.js'
import React from 'react'

const SendSol = () => {

    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')
    const from_wallet = Keypair.generate()


    let associated_token_account: PublicKey;
    const wrap_sol = async () => {
        const airdrop_signature = await connection.requestAirdrop(from_wallet.publicKey, LAMPORTS_PER_SOL)

        await connection.confirmTransaction(airdrop_signature)


        associated_token_account = await getAssociatedTokenAddress(NATIVE_MINT, from_wallet.publicKey)

        const ata_transaction = new Transaction().add(
            createAssociatedTokenAccountInstruction(
                from_wallet.publicKey,
                associated_token_account,
                from_wallet.publicKey,
                NATIVE_MINT
            )
        )

        await sendAndConfirmTransaction(connection, ata_transaction, [from_wallet])


        const sol_transfer_transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: from_wallet.publicKey,
                toPubkey: associated_token_account,
                lamports: LAMPORTS_PER_SOL
            }),
            createSyncNativeInstruction(associated_token_account)
        )

        await sendAndConfirmTransaction(
            connection,
            sol_transfer_transaction,
            [from_wallet]
        )

        const account_info = await getAccount(connection, associated_token_account)
        console.log("Native:", account_info.isNative, "Lamports:", account_info.amount);

    }

    const unwrap_sol = async () => {
        const wallet_balance = await connection.getBalance(from_wallet.publicKey)

        console.log("Before unwrapping SOL:", wallet_balance);


        await closeAccount(connection, from_wallet, associated_token_account, from_wallet.publicKey, from_wallet)
        const wallet_closed_balance = await connection.getBalance(from_wallet.publicKey)
        console.log("Balance after unwrapping:", wallet_closed_balance);


    }

    const send_sol = async () => {
        const airdrop_signature = await connection.requestAirdrop(from_wallet.publicKey, LAMPORTS_PER_SOL)

        await connection.confirmTransaction(airdrop_signature)

        const to_wallet = new PublicKey("CZKyrWfobxbUVi9K6vtxCcRXhZTMSsVCt43D64g6VkSH")
        const from_token_account = await getOrCreateAssociatedTokenAccount(connection,from_wallet,NATIVE_MINT,from_wallet.publicKey)

        const to_token_account = await getOrCreateAssociatedTokenAccount(connection,from_wallet,NATIVE_MINT,to_wallet)

        const signature = await transfer(connection,from_wallet,from_token_account.address,to_token_account.address,from_wallet.publicKey,LAMPORTS_PER_SOL)

        console.log("TXN:",signature);
        
    }
    return (
        <div>WRAP & SEND SOL -
            <button onClick={wrap_sol}>Wrap SOL</button>
            <button onClick={unwrap_sol}>Unwrap SOL</button>
            <button onClick={send_sol}>Send SOL</button>
        </div>
    )
}

export default SendSol