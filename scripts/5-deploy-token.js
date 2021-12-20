import sdk from "./1-initialize-sdk.js";

// use getAppModule from sdk
const app = sdk.getAppModule("0x343171e66D6D5307eD242d0a069620C4bde920B4");

(async () => {
  try {
    // Deploy ERC-20 contract.
    const tokenModule = await app.deployTokenModule({
      // Token name
      name: "Cameroon",
      symbol: "CMR",
    });
    console.log("✅ Sucessfully deployed token module, address:", tokenModule.address);
  } catch (error) {
    console.error("failed to deploy token module", error);
  }
})();