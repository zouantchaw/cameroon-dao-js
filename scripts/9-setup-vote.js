import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

const voteModule = sdk.getTokenModule("0x252Eb1ccAcAFF3A88c9Fb05aFDF01b73DBD217B5");

const tokenModule = sdk.getTokenModule(
  "0xAAdCB2BeF5c0f54B14503faEAd0C2fb5D1aE5A2E",
);


(async () => {
  try {
    // enable treasury to mint additional tokens if needed
    await tokenModule.grantRole("minter", voteModule.address);

    console.log("Succesfully gave vote module permsissions to act on token module");
  } catch (error) {
    console.error("failed to grant vote module permissions on token module", error);
    process.exit(1);
  }

  try {
    // Get wallets token balance
    const ownedTokenBalance = await tokenModule.balanceOf(process.env.WALLET_ADDRESS)

    // Get 90% of the supply that we hold
    const ownedAmount = ethers.BigNumber.from(ownedTokenBalance.value);
    const percent90 = ownedAmount.div(100).mul(90)

    // Transfer 90% of token supply to voting contract
    await tokenModule.transfer(voteModule.address, percent90);

    console.log("✅ Sucessfully transferred tokens to vote module");
  } catch(error) {
    console.log("failed to transfer tokens to vote module", error);
  }
})();
