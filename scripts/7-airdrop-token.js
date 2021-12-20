import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

// ERC-1155 membership NFT contract
const bundleDropModule = sdk.getBundleDropModule("0x635a3DE9D799C62CA88fF62a19fC51AA95EA9690");

// ERC-20 token contract
const tokenModule = sdk.getTokenModule(
  "0xAAdCB2BeF5c0f54B14503faEAd0C2fb5D1aE5A2E"
);

(async () => {
  try {
    // Get all addresses of people who own membershipNFT, tokenID 0
    const walletAddresses = await bundleDropModule.getAllClaimerAddresses("0");

    if (walletAddresses.length === 0)  {
      console.log("No NFT has been claimed yet, get some friends to claim free NFTs!");
      process.exit(0);
    }

    // Loop through array of addresses
    const airdropTargets = walletAddresses.map((address) => {
      // Random number between 1000 and 10000
      const randomAmount = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000);
      console.log("✅ Going to airdrop", randomAmount, "tokens to", address);

      // Set up the target
      const airdropTarget = {
        address,
        // 18 decimal places
        amount: ethers.utils.parseUnits(randomAmount.toString(), 18)
      };

      return airdropTarget;
    });

    // Invoke transferBatch method on airdrop targets
    console.log("🌈 Starting airdrop...")
    await tokenModule.transferBatch(airdropTargets);
    console.log("✅ Sucessfully airdropped tokens to all the holders of the NFT!");
  } catch (error) {
    console.log("Failed to airdrop tokens", error);
  }
})();