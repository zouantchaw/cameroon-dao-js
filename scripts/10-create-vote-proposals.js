import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

const voteModule = sdk.getVoteModule("0x252Eb1ccAcAFF3A88c9Fb05aFDF01b73DBD217B5");

const tokenModule = sdk.getTokenModule(
  "0xAAdCB2BeF5c0f54B14503faEAd0C2fb5D1aE5A2E",
);

(async () => {
  try {
    const amount = 420_000;
    // proposal to mint 420,000 new token to the treasury.
    await voteModule.propose(
      "Should the DAO mint an additional " + amount + " tokens into the treasury?",
      [
        {
          // Our nativeToken is ETH. nativeTokenValue is the amount of ETH we want
          // to send in this proposal. In this case, we're sending 0 ETH.
          nativeTokenValue: 0,
          transactionData: tokenModule.contract.interface.encodeFunctionData(
            // mint new tokens to voteModule(treasury)
            "mint",
            [
              voteModule.address,
              ethers.utils.parseUnits(amount.toString(), 18),
            ]
          ),
          // token module that actually executes the mint.
          toAddress: tokenModule.address,
        },
      ]
    );

    console.log("✅ Successfully created proposal to mint tokens");
  } catch (error) {
    console.error("failed to create first proposal", error);
    process.exit(1);
  }

  try {
    const amount = 6_900;
    // proposal to transfer ourselves 6,900 
    await voteModule.propose(
      "Should the DAO transfer " +
      amount + " tokens from the treasury to " +
      process.env.WALLET_ADDRESS + " for being awesome?",
      [
        {
          nativeTokenValue: 0,
          transactionData: tokenModule.contract.interface.encodeFunctionData(
            // transfer from the treasury to (my) wallet.
            "transfer",
            [
              process.env.WALLET_ADDRESS,
              ethers.utils.parseUnits(amount.toString(), 18),
            ]
          ),

          toAddress: tokenModule.address,
        },
      ]
    );

    console.log(
      "✅ Successfully created proposal to reward ourselves from the treasury, let's hope people vote for it!"
    );
  } catch (error) {
    console.error("failed to create first proposal", error);
  }
})();