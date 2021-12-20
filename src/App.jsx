import { useEffect, useMemo, useState } from 'react';

// import thirdweb
import { useWeb3 } from "@3rdweb/hooks";

import { ThirdwebSDK } from "@3rdweb/sdk";


// instantiate sdk on rinkeby
const sdk = new ThirdwebSDK("rinkeby")

// refrence to ERC-1155 contract
const bundleDropModule = sdk.getBundleDropModule("0x635a3DE9D799C62CA88fF62a19fC51AA95EA9690");

const App = () => {
  // use connectWallet hook from third web
  const { connectWallet, address, error, provider } = useWeb3();
  console.log("👋 Address:", address)
  console.log("provider:", provider)

  // state variable for us to know if user has native NFT
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);

  useEffect(() => {
    // If wallet if not connected, exit
    if (!address) {
      return;
    }

    // Check if user has native NFT
    return bundleDropModule
      .balanceOf(address, "0")
      .then((balance) => {
        // If balance is greater than 0, user owns native NFT
        if (balance.gt(0)) {
          setHasClaimedNFT(true);
          console.log('🌟 user had a membership NFT!')
        } else {
          setHasClaimedNFT(false);
          console.log('😢 user does not have a membership NFT.')
        }
      })
      .catch((error) => {
        setHasClaimedNFT(false);
        console.error("failed to get nft balance", error);
      });
  }, [address]);

  // If users wallet is not connected to app, show connect wallet button
  if (!address) {
    return (
      <div className="landing">
        <h2>Welcome to CameroonDAO</h2>
        <button onClick={() => connectWallet("injected")} className="btn-hero">
          Connect your wallet
        </button>
      </div>
    )
  }
  return (
    <div className="landing">
      <h1>Wallet connected to app... now what</h1>
    </div>
  );
};

export default App;
