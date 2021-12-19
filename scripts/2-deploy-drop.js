import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const app = sdk.getAppModule("0x343171e66D6D5307eD242d0a069620C4bde920B4");

(async () => {
  try {
    const bundleDropModule = await app.deployBundleDropModule({
      name: "CameroonDAO Membership",
      description: "A DAO for people interested in Cameroon.",
      image: readFileSync("scripts/assets/cameroon.jpeg"),
      primarySaleRecipientAddress: ethers.constants.AddressZero,
    });

    console.log("✅ Successfully deployed bundleDrop module, address:", bundleDropModule.address);

    console.log("✅ bundleDrop metadata:", await bundleDropModule.getMetadata());
  } catch (error) {
    console.log("failed to deploy bundleDrop module", error);
  }
})()