import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

// ER-20 address
const tokenModule = sdk.getTokenModule(
  "0xAAdCB2BeF5c0f54B14503faEAd0C2fb5D1aE5A2E"
);

(async () => {
  try {
    // set max supply 
    const amount = 1_000_000;
    // convert amount using utils method
    const amountWith18Decimals = ethers.utils.parseUnits(amount.toString(), 18);
    // Interact with ER-20 contract to mint tokens
    await tokenModule.mint(amountWith18Decimals);
    const totalSupply = await tokenModule.totalSupply();

    console.log("✅ There now is", ethers.utils.formatUnits(totalSupply, 18), "$CMR in circulation");
  } catch(error) {
    console.log("🔴 Money printer no burrr", error);
  }
})();