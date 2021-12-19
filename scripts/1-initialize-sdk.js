import { ThirdwebSDK } from "@3rdweb/sdk";
import ethers from "ethers";

// Import and configure .env file to store environment variables
import dotenv from "dotenv";
dotenv.config();

// Check if .env is working
if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY == "") {
  console.log("🔴 Private key not found.")
}

if (!process.env.ALCHEMY_API || process.env.ALCHEMY_API == "") {
  console.log("🔴 Alchemy API not found.")
}

if (!process.env.WALLET_ADDRESS || process.env.WALLET_ADDRESS == "") {
  console.log("🔴 Wallet address key not found.")
}

const sdk = new ThirdwebSDK(
  new ethers.Wallet(
    process.env.PRIVATE_KEY,
    ethers.getDefaultProvider(process.env.ALCHEMY_API_URL),
  ),
);

(async () => {
  try {
    const apps = await sdk.getApps();
    console.log("Your app address is:", apps[0].address);
  } catch(err) {
    console.log("Failed to get apps from the sdk")
    process.exit(1);
  }
})()

// export sdk to use in other scripts
export default sdk;