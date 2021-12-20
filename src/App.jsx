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

const voteModule = sdk.getVoteModule(
  "0x252Eb1ccAcAFF3A88c9Fb05aFDF01b73DBD217B5",
);

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

  const [proposals, setProposals] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // Get all proposals from contract
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }
    // get all proposals from voteModule
    voteModule
      .getAll()
      .then((proposals) => {
        // set state
        setProposals(proposals)
        console.log("📃 Proposals:", proposals)
      })
      .catch((err) => {
        console.error("failed to get proposals", err)
      });
  }, [hasClaimedNFT]);

  // Check if user already voted
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // If proposal retrieving is not complete, can't check if the user voted yet
    if (!proposals.length)  {
      return;
    }

    // Check if user has already voted on first proposal
    voteModule
      .hasVoted(proposals[0].proposalId, address)
      .then((hasVoted) => {
        setHasVoted(hasVoted);
        console.log("😲 User has already voted")
      })
      .catch((err) => {
        console.log("failed to check if wallet has voted", err);
      });
  }, [hasClaimedNFT, proposals, address]);

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
        setMemberTokensAmounts(amounts)
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
        <h1>DAO Member Page</h1>
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
          <div>
            <h2>Active Proposals</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                e.stopPropagation();

                //before we do async things, we want to disable the button to prevent double clicks
                setIsVoting(true);

                // lets get the votes from the form for the values
                const votes = proposals.map((proposal) => {
                  let voteResult = {
                    proposalId: proposal.proposalId,
                    //abstain by default
                    vote: 2,
                  };
                  proposal.votes.forEach((vote) => {
                    const elem = document.getElementById(
                      proposal.proposalId + "-" + vote.type
                    );

                    if (elem.checked) {
                      voteResult.vote = vote.type;
                      return;
                    }
                  });
                  return voteResult;
                });

                // first we need to make sure the user delegates their token to vote
                try {
                  //we'll check if the wallet still needs to delegate their tokens before they can vote
                  const delegation = await tokenModule.getDelegationOf(address);
                  // if the delegation is the 0x0 address that means they have not delegated their governance tokens yet
                  if (delegation === ethers.constants.AddressZero) {
                    //if they haven't delegated their tokens yet, we'll have them delegate them before voting
                    await tokenModule.delegateTo(address);
                  }
                  // then we need to vote on the proposals
                  try {
                    await Promise.all(
                      votes.map(async (vote) => {
                        // before voting we first need to check whether the proposal is open for voting
                        // we first need to get the latest state of the proposal
                        const proposal = await voteModule.get(vote.proposalId);
                        // then we check if the proposal is open for voting (state === 1 means it is open)
                        if (proposal.state === 1) {
                          // if it is open for voting, we'll vote on it
                          return voteModule.vote(vote.proposalId, vote.vote);
                        }
                        // if the proposal is not open for voting we just return nothing, letting us continue
                        return;
                      })
                    );
                    try {
                      // if any of the propsals are ready to be executed we'll need to execute them
                      // a proposal is ready to be executed if it is in state 4
                      await Promise.all(
                        votes.map(async (vote) => {
                          // we'll first get the latest state of the proposal again, since we may have just voted before
                          const proposal = await voteModule.get(
                            vote.proposalId
                          );

                          //if the state is in state 4 (meaning that it is ready to be executed), we'll execute the proposal
                          if (proposal.state === 4) {
                            return voteModule.execute(vote.proposalId);
                          }
                        })
                      );
                      // if we get here that means we successfully voted, so let's set the "hasVoted" state to true
                      setHasVoted(true);
                      // and log out a success message
                      console.log("successfully voted");
                    } catch (err) {
                      console.error("failed to execute votes", err);
                    }
                  } catch (err) {
                    console.error("failed to vote", err);
                  }
                } catch (err) {
                  console.error("failed to delegate tokens");
                } finally {
                  // in *either* case we need to set the isVoting state to false to enable the button again
                  setIsVoting(false);
                }
              }}
            >
              {proposals.map((proposal, index) => (
                <div key={proposal.proposalId} className="card">
                  <h5>{proposal.description}</h5>
                  <div>
                    {proposal.votes.map((vote) => (
                      <div key={vote.type}>
                        <input
                          type="radio"
                          id={proposal.proposalId + "-" + vote.type}
                          name={proposal.proposalId}
                          value={vote.type}
                          //default the "abstain" vote to chedked
                          defaultChecked={vote.type === 2}
                        />
                        <label htmlFor={proposal.proposalId + "-" + vote.type}>
                          {vote.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button disabled={isVoting || hasVoted} type="submit">
                {isVoting
                  ? "Voting..."
                  : hasVoted
                    ? "You Already Voted"
                    : "Submit Votes"}
              </button>
              <small>
                This will trigger multiple transactions that you will need to
                sign.
              </small>
            </form>
          </div>
        </div>
      </div>
    );
  };

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
