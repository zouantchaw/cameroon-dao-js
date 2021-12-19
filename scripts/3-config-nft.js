import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const bundleDrop = sdk.getBundleDropModule(
  "0x635a3DE9D799C62CA88fF62a19fC51AA95EA9690",
);

(async () => {
  try {
    await bundleDrop.createBatch([
      {
        name: "Cameroon Coat Of Arms",
        description: "Owners of this NFT have access to CameroonDAO!",
        image: readFileSync("scripts/assets/cameroonCoat.png"),
      },
    ]);
    console.log("✅ Successfully created a new NFT in the drop!");
  } catch (error) {
    console.error("failed to create the new NFT", error);
  }
})()