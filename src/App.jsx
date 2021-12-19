import { useEffect, useMemo, useState } from 'react';

// import thirdweb
import { useWeb3 } from "@3rdweb/hooks";

const App = () => {
  // use connectWallet hook from third web
  const { connectWallet, address, error, provider } = useWeb3();
  console.log("👋 Address:", address)
  console.log("provider:", provider)

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
