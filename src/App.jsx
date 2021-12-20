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

  // signer is required to sign transactions on the blockchain
  const signer = provider ? provider.getSigner() : undefined;

  // state variable for us to know if user has native NFT
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);

  // loading state while the NFT is minted
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    // pass signer to sdk, enabling app to interact with deployed contract
    sdk.setProviderOrSigner(signer);
  }, [signer]);

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

  const mintNFT = () => {
    setIsClaiming(true);
    // call bundleDropModule.claim("0", 1) to mint nft to users wallet
    bundleDropModule
    .claim("0", 1)
    .catch((err) => {
      console.error("failed to claim", err);
      setIsClaiming(false);
    })
    .finally(() => {
      // stop loading state
      setIsClaiming(false);
      // set claiming state
      setHasClaimedNFT(true);
      // show user nft link
      console.log(`Mint Successful! Check it out on OpenSea: https://testnets.opensea.io/assets/${bundleDropModule.address}/0`);
    });
  }

  // Render mint nft screen
  return (
    <div className="mint-nft">
      <h1>Mint your free 🇨🇲DAO Membership NFT</h1>
      <button
        disabled={isClaiming}
        onClick={() => mintNFT()}
      >
        {isClaiming ? "Minting..." : "Mint your nft (FREE)"}
      </button>
    </div>
  );
};

export default App;
