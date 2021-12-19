import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App.jsx";

// Import thirdweb
import { ThirdwebWeb3Provider } from '@3rdweb/hooks';

// Include for rinkeby chain
const supportedChainIds = [4];

// Include support for metamask(injected wallet)
const connectors = {
  injected: {},
};

// Wrap App with ThirdwebWeb3Provider
// Render the App component to the DOM
ReactDOM.render(
  <React.StrictMode>
  <ThirdwebWeb3Provider
    connectors={connectors}
    supportedChainIds={supportedChainIds}
  >
    <div className="landing">
      <App />
    </div>
  </ThirdwebWeb3Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
