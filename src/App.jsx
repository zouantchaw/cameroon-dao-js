import { useEffect, useMemo, useState } from 'react';
// import thirdweb
import { useWeb3 } from "@3rdweb/hooks";
import { ThirdwebSDK } from "@3rdweb/sdk";
import { ethers } from "ethers";


// instantiate sdk on rinkeby
const sdk = new ThirdwebSDK("rinkeby")

// refrence to ERC-1155 contract
const bundleDropModule = sdk.getBundleDropModule("0x635a3DE9D799C62CA88fF62a19fC51AA95EA9690");

const tokenModule = sdk.getTokenModule("0xAAdCB2BeF5c0f54B14503faEAd0C2fb5D1aE5A2E")

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

  // Stores amount of tokens each member has in state
  const [memberTokenAmounts, setMemberTokensAmounts] = useState({});

  // array holding all of our members addresses
  const [memberAddresses, setMemberAddresses] = useState([]);

  // function to shorten wallet address
  const shortenAddress = (str) => {
    return str.substring(0, 6) + "..." + str.substring(str.length - 4);
  };

  // get all addresses of members holding member NFT
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // get users with tokenId 0
    bundleDropModule
    .getAllClaimerAddresses("0")
    .then((addresses) => {
      console.log("🚀 Members addresses", addresses)
      setMemberAddresses(addresses);
    })
    .catch((err) => {
      console.error("failed to get member list", err);
    });
  }, [hasClaimedNFT]);

  // gets #'s of token each member holds'
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // Get all address balances
    tokenModule
      .getAllHolderBalances()
      .then((amounts) => {
        console.log("👜 Amounts", amounts)
        setMemberTokenAmounts(amounts)
      })
      .catch((err) => {
        console.error("failed to get token amounts", err);
      });
  }, [hasClaimedNFT]);

  const memberList = useMemo(() => {
    return memberAddresses.map((address) => {
      return {
        address,
        tokenAmount: ethers.utils.formatUnits(
          // if address isn't in memberTokenAmounts, they don't hold any $CMR tokens
          memberTokenAmounts[address] || 0,
          18,
        ),
      };
    });
  }, [memberAddresses, memberTokenAmounts]);

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

  if (hasClaimedNFT) {
    return (
    <div className="member-page">
      <h1>🇨🇲DAO Member Page</h1>
      <p>Congratulations on being a member</p>
      <div>
        <div>
          <h2>Member List</h2>
          <table className="card">
            <thead>
              <tr>
                <th>Address</th>
                <th>Token Amount</th>
              </tr>
            </thead>
            <tbody>
              {memberList.map((member) => {
                return (
                  <tr key={member.address}>
                    <td>{shortenAddress(member.address)}</td>
                    <td>{member.tokenAmount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
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
