import sdk from "./1-initialize-sdk.js";

const appModule = sdk.getAppModule(
  "0x343171e66D6D5307eD242d0a069620C4bde920B4",
);

(async () => {
  try {
    const voteModule = await appModule.deployVoteModule({
      // Governance contract name
      name: "CameroonDAO Proposals",

      // location of governance token
      votingTokenAddress: "0xAAdCB2BeF5c0f54B14503faEAd0C2fb5D1aE5A2E",

      // Voting starts immediatly after proposal is created
      proposalStartWaitTimeInSeconds: 0,

      // Time members have to vote on a proposal when its created
      proposalVotingTimeInSeconds: 24 * 60 * 60,

      votingQuorumFraction: 0,

      // No tokens are required for a user to be allowed to create a proposal
      minimumNumberOfTokensNeededToPropose: "0",
    });

    console.log("✅ Sucessfully deployed vote module, address:", voteModule.address);
  } catch (err) {
    console.log("Failed to deploy vote module", err);
  }
})();