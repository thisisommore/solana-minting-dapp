import React from "react";

import {
  Connection,
  clusterApiUrl,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  Account,
  createMint,
  getAccount,
  getMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer,
} from "@solana/spl-token";

window.Buffer = window.Buffer || require("buffer").Buffer
const MintToken = () => {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const fromWallet = Keypair.generate();

  const toWallet = new PublicKey("CZKyrWfobxbUVi9K6vtxCcRXhZTMSsVCt43D64g6VkSH");

  let fromTokenAccount: Account;
  let mint: PublicKey;

  const create_token = async () => {
    const from_airdrop_signature = await connection.requestAirdrop(
      fromWallet.publicKey,
      LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(from_airdrop_signature);

    mint = await createMint(
      connection,
      fromWallet,
      fromWallet.publicKey,
      null,
      9
    );
    console.log("create token:", mint.toBase58());
    fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      fromWallet,
      mint,
      fromWallet.publicKey
    );

    console.log("created token account ", fromTokenAccount.address.toBase58());
  };

  const mint_token = async () => {
    const signature = await mintTo(
      connection,
      fromWallet,
      mint,
      fromTokenAccount.address,
      fromWallet.publicKey,
      10000000000
    );
    console.log("Mint signature ", signature);
  };

  const check_balance = async () => {
    const mint_info = await getMint(connection, mint);

    console.log("mint info: ", mint_info.supply);

    const token_account_info = await getAccount(
      connection,
      fromTokenAccount.address
    );

    console.log(token_account_info.amount);
  };

  const send_token = async ()=>{
    const  to_token_account =await getOrCreateAssociatedTokenAccount(connection,
        fromWallet,
        mint,
        toWallet)

        console.log("toTokenAccount:",(await to_token_account).address);

        const signature = await transfer(connection,fromWallet,fromTokenAccount.address,
            to_token_account.address,fromWallet.publicKey,10000000000)

            console.log("finished tranfer signature",signature);
            
        
  }
  return (
    <div>
      MINT Token -
      <button onClick={create_token}>Create Token</button>
      <button onClick={mint_token}>Mint Token</button>
      <button onClick={check_balance}>Check balance</button>
      <button onClick={send_token}>Send Token</button>
    </div>
  );
};

export default MintToken;
