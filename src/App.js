import React, { useState} from "react";
import Web3 from "web3";
import Abi from "./Abi.json";
import coinabi from "./coinabi.json";
import "./components/css/connect.css";
// const rpcEndpoint =
//   "https://sepolia.infura.io/v3/6fa7fc5c25ba48b6b574615df446bb47"; // Replace with your custom testnet RPC endpoint
// const infuraUrl = rpcEndpoint;

const App = () => {
  const [sidesl, setsidesl] = useState("Token");
  const swap_adr = "0xC6EB0ceB1eA2Af9a1Ca3a8FBE68570F16A5492dE";
  const standard_adr = "0x506C421A7054Aad5F8BC6554BF9F5A89B4c0B37c";
  const [tokens, settokens] = useState([]);
  const [account, setaccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [contract, setcontract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [standard, setstandard] = useState(null);
  const [amount, setamount] = useState({
    token: "",
    to: "",
    amount: "",
  });
  const [spender, setSpender] = useState("");
  const [amountValue, setAmountValue] = useState("");
  const [transferAddress, setTransferAddress] = useState("");
  const [allowanceOwner, setAllowanceOwner] = useState("");
  const [allowanceSpender, setAllowanceSpender] = useState("");
  const [mintAmount, setMintAmount] = useState("");
  const [burnAmount, setBurnAmount] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");
  const [balanceAddress, setBalanceAddress] = useState("");
  const [transferAmount, settransferAmount] = useState("");
  const handleTAmountChange = (e) => {
    settransferAmount(e.target.value);
  };
  const handleSpenderChange = (e) => {
    setSpender(e.target.value);
  };

  const handleAmountChange = (e) => {
    setAmountValue(e.target.value);
  };

  const handleTransferAddressChange = (e) => {
    setTransferAddress(e.target.value);
  };

  const handleAllowanceOwnerChange = (e) => {
    setAllowanceOwner(e.target.value);
  };

  const handleAllowanceSpenderChange = (e) => {
    setAllowanceSpender(e.target.value);
  };

  const handleMintAmountChange = (e) => {
    setMintAmount(e.target.value);
  };

  const handleBurnAmountChange = (e) => {
    setBurnAmount(e.target.value);
  };

  const handleStakeAmountChange = (e) => {
    setStakeAmount(e.target.value);
  };

  const handleBalanceAddressChange = (e) => {
    setBalanceAddress(e.target.value);
  };

  const initializeWeb3 = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      setWeb3(web3);
      await updateContract(swap_adr, Abi, setcontract, web3);
      await updateContract(standard_adr, coinabi, setstandard, web3);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setaccount(accounts[0]);
    } else {
      alert("Please install MetaMask");
    }
  };

  const getSwap = async () => {
    try {
      let tokensw = await contract.methods.getSwaps().call();
      settokens([...tokensw]);
    } catch (error) {
      alert(error.message);
    }
  };
  const updateContract = async (contractAddress, abi, setstate, web3) => {
    const readcontract = new web3.eth.Contract(abi, contractAddress);
    setstate(readcontract);
  };

  const buy = async () => {
    try {
      const currentAllowance = await tokenContract.methods
        .allowance(account, swap_adr)
        .call();
      const currentAllowanceNumber = web3.utils.fromWei(
        Number(currentAllowance).toString(),
        "ether"
      );
      const desiredAllowance = web3.utils.toWei(
        amount.amount.toString(),
        "ether"
      );

      if (currentAllowanceNumber < desiredAllowance) {
        await tokenContract.methods.approve(swap_adr, desiredAllowance).send({
          from: account,
        });
      }

      await contract.methods.buy(amount.token, desiredAllowance).send({
        from: account,
      });

      console.log("Bought successfully");
    } catch (error) {
      alert(error.message);
    }
  };

  const swap = async () => {
    try {
      const currentAllowance = await tokenContract.methods
        .allowance(account, swap_adr)
        .call();
      const currentAllowanceNumber = web3.utils.fromWei(
        currentAllowance.toString(),
        "ether"
      );
      const desiredAllowance = web3.utils.toWei(
        amount.amount.toString(),
        "ether"
      );

      if (currentAllowanceNumber < desiredAllowance) {
        await tokenContract.methods.approve(swap_adr, desiredAllowance).send({
          from: account,
        });
      }

      await contract.methods
        .swap(amount.token, amount.to, desiredAllowance)
        .send({
          from: account,
        });

      console.log("Swapped successfully");
    } catch (error) {
      alert(error.message);
    }
  };
  const sell = async () => {
    try {
      const currentAllowance = await standard.methods
        .allowance(account, swap_adr)
        .call();
      const currentAllowanceNumber = web3.utils.fromWei(
        currentAllowance.toString(),
        "ether"
      );
      const desiredAllowance = web3.utils.toWei(
        amount.amount.toString(),
        "ether"
      );

      if (currentAllowanceNumber < desiredAllowance) {
        await standard.methods.approve(swap_adr, desiredAllowance).send({
          from: account,
        });
      }

      await contract.methods.sell(amount.token, desiredAllowance).send({
        from: account,
      });

      console.log("Sold successfully");
    } catch (error) {
      alert(error.message);
    }
  };

  const changeToken = async (e) => {
    if (e.target.value !== "") {
      await updateContract(e.target.value, coinabi, setTokenContract, web3);
    }
  };

  const transfer = async () => {
    try {
      const tres = await tokenContract.methods
        .transfer(
          transferAddress,
          web3.utils.toWei(transferAmount.toString(), "ether")
        )
        .send({
          from: account,
        });
      if (tres) {
        alert("token transfered");
      } else {
        alert("transfer failed");
      }
    } catch (error) {}
  };
  const balance = async () => {
    try {
      const bres = await tokenContract.methods.balanceOf(balanceAddress).call();
      // Convert the token balance to ether
      const balanceInEther = web3.utils.fromWei(bres.toString(), "ether");
      alert(balanceInEther);
    } catch (error) {
      console.error(error);
      alert("Error occurred while fetching token balance");
    }
  };

  const burn = async () => {
    try {
      // eslint-disable-next-line
      const bres = await tokenContract.methods
        .burn(web3.utils.toWei(burnAmount.toString(), "ether"))
        .send({ from: account });
      alert("burnt successfully");
    } catch (error) {}
  };
  const mint = async () => {
    try {
      // eslint-disable-next-line
      const mres = await tokenContract.methods
        .mint(web3.utils.toWei(mintAmount.toString(), "ether"))
        .send({ from: account });
      alert("Mint was successfull");
    } catch (error) {}
  };
  const approve = async () => {
    try {
      // eslint-disable-next-line
      const ares = await tokenContract.methods
        .approve(spender, web3.utils.toWei(amountValue.toString(), "ether"))
        .send({ from: account });
      alert("Allowance approved successfully");
    } catch (error) {}
  };
  const allowance = async () => {
    try {
      // eslint-disable-next-line
      const ares = await tokenContract.methods
        .allowance(allowanceOwner, allowanceSpender)
        .call();
      alert(web3.utils.fromWei(ares.toString(), "ether"));
    } catch (error) {}
  };
  const stake = async () => {
    try {
      const currentAllowance = await tokenContract.methods
        .allowance(account, tokenContract._address)
        .call();
      const currentAllowanceNumber = web3.utils.fromWei(
        currentAllowance.toString(),
        "ether"
      );
      const desiredAllowance = web3.utils.toWei(
        Number(stakeAmount).toString(),
        "ether"
      );
      if (currentAllowanceNumber < desiredAllowance) {
        await tokenContract.methods
          .approve(tokenContract._address, desiredAllowance)
          .send({
            from: account,
          });
      }
      // eslint-disable-next-line
      const sres = await tokenContract.methods
        .stake(desiredAllowance)
        .send({ from: account });
      alert("staked successfully");
    } catch (error) {}
  };
  const withdraw = async () => {
    try {
      // eslint-disable-next-line
      const wres = await tokenContract.methods
        .withdraw()
        .send({ from: account });
      alert("withrawed successfully");
    } catch (error) {}
  };
  const staked = async () => {
    try {
      const sres = await tokenContract.methods.stakedAmount(account).call();
      alert(sres);
    } catch (error) {}
  };
  const name = async () => {
    try {
      const rname = await tokenContract.methods.name().call();
      alert(rname);
    } catch (error) {}
  };
  return (
    <div>
      {!account ? (
        <div className="container">
          <button className="connect-button" onClick={initializeWeb3}>
            Connect to Metamask
          </button>
        </div>
      ) : (
        <>
          <nav className="navbar">
            <div className="address-container">
              <span>Account: {account}</span>
            </div>
            <div>
              <button
                className="refresh-button"
                onClick={getSwap}
                style={{ marginRight: "10px" }}
              >
                GetSwaps
              </button>
              <button className="refresh-button" onClick={initializeWeb3}>
                Refresh
              </button>
            </div>
          </nav>
          <div className="container-sidebar">
            <div className="sidebar">
              <ul>
                <li
                  onClick={() => {
                    setsidesl("Token");
                  }}
                >
                  Token
                </li>
                <li
                  onClick={() => {
                    setsidesl("Buy");
                  }}
                >
                  Buy
                </li>
                <li
                  onClick={() => {
                    setsidesl("Sell");
                  }}
                >
                  Sell
                </li>
                <li
                  onClick={() => {
                    setsidesl("Swap");
                  }}
                >
                  Swap
                </li>
              </ul>
            </div>
            <div className="swap-container">
              {sidesl === "Token" ? (
                <>
                  <div className="token_intraction">
                    <div className="token_row">
                      <select
                        className="token_intractionsl"
                        onChange={async (e) => {
                          setamount({ ...amount, token: e.target.value });
                          changeToken(e);
                        }}
                      >
                        <option value="">Select Token</option>
                        <option value={standard_adr}>{standard_adr}</option>
                        {tokens.map((itm) => {
                          return <option value={itm}>{itm}</option>;
                        })}
                      </select>
                    </div>
                    <div className="token_row">
                      <div className="intraction-form">
                        <div className="form-field">
                          <input
                            type="text"
                            placeholder="Spender"
                            name="spender"
                            value={spender}
                            onChange={handleSpenderChange}
                          />
                        </div>

                        <div className="form-field">
                          <input
                            type="number"
                            placeholder="Amount"
                            name="Amount"
                            value={amountValue}
                            onChange={handleAmountChange}
                          />
                        </div>
                        <button className="submit" onClick={approve}>
                          Approve
                        </button>
                      </div>
                    </div>
                    <div className="token_row">
                      <div className="intraction-form">
                        <div className="form-field">
                          <input
                            type="text"
                            placeholder="address"
                            name="address"
                            value={transferAddress}
                            onChange={handleTransferAddressChange}
                          />
                        </div>

                        <div className="form-field">
                          <input
                            type="number"
                            placeholder="Amount"
                            name="Amount"
                            value={transferAmount}
                            onChange={handleTAmountChange}
                          />
                        </div>
                        <button className="submit" onClick={transfer}>
                          Transfer
                        </button>
                      </div>
                    </div>
                    <div className="token_row">
                      <div className="intraction-form">
                        <div className="form-field">
                          <input
                            type="text"
                            placeholder="Owner"
                            name="address"
                            value={allowanceOwner}
                            onChange={handleAllowanceOwnerChange}
                          />
                        </div>

                        <div className="form-field">
                          <input
                            className="form_input"
                            type="text"
                            placeholder="Spender"
                            name="spender"
                            value={allowanceSpender}
                            onChange={handleAllowanceSpenderChange}
                          />
                        </div>
                        <button className="submit" onClick={allowance}>
                          Allowance
                        </button>
                      </div>
                    </div>
                    <div className="token_row">
                      <div className="intraction-form">
                        <div className="form-field">
                          <input
                            type="number"
                            placeholder="Amount"
                            name="Amount"
                            value={mintAmount}
                            onChange={handleMintAmountChange}
                          />
                        </div>
                        <button className="submit" onClick={mint}>
                          Mint
                        </button>
                      </div>
                    </div>
                    <div className="token_row">
                      <div className="intraction-form">
                        <div className="form-field">
                          <input
                            type="number"
                            placeholder="Amount"
                            name="Amount"
                            value={burnAmount}
                            onChange={handleBurnAmountChange}
                          />
                        </div>
                        <button className="submit" onClick={burn}>
                          Burn
                        </button>
                      </div>
                    </div>
                    <div className="token_row">
                      <div className="intraction-form">
                        <div className="form-field">
                          <input
                            type="number"
                            placeholder="Amount"
                            name="Amount"
                            value={stakeAmount}
                            onChange={handleStakeAmountChange}
                          />
                        </div>
                        <button className="submit" onClick={stake}>
                          Stake
                        </button>
                      </div>
                    </div>
                    <div className="token_row">
                      <div className="intraction-form">
                        <div className="form-field">
                          <input
                            type="text"
                            placeholder="Address"
                            name="address"
                            value={balanceAddress}
                            onChange={handleBalanceAddressChange}
                          />
                        </div>
                        <button className="submit" onClick={balance}>
                          Balance
                        </button>
                      </div>
                    </div>
                    <div className="token_row">
                      <div className="intraction-form">
                        <button className="submit" onClick={withdraw}>
                          withdraw
                        </button>
                        <button className="submit" onClick={staked}>
                          Staked Amount
                        </button>
                        <button className="submit" onClick={name}>
                          Name
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="swap-tab">
                  <h2 className="swap-header">{sidesl} Tokens</h2>
                  <div className="token-selection">
                    <select
                      className="token-select"
                      onChange={async (e) => {
                        setamount({ ...amount, token: e.target.value });
                        changeToken(e);
                      }}
                    >
                      <option value="">
                        {sidesl === "Buy"
                          ? "Buy Through"
                          : sidesl === "Sell"
                          ? "Credit to"
                          : "Select Token 1"}
                      </option>
                      {tokens.map((itm) => {
                        return <option value={itm}>{itm}</option>;
                      })}
                      {/* Add more options as needed */}
                    </select>
                    {sidesl === "Swap" ? (
                      <select
                        className="token-select"
                        onChange={async (e) => {
                          setamount({ ...amount, to: e.target.value });
                        }}
                      >
                        <option value="">Select Token 2</option>
                        {tokens.map((itm) => {
                          return <option value={itm}>{itm}</option>;
                        })}
                        {/* Add more options as needed */}
                      </select>
                    ) : (
                      ""
                    )}
                    <input
                      type="number"
                      className="token-select"
                      value={amount.amount}
                      onChange={(e) => {
                        setamount({ ...amount, amount: e.target.value });
                      }}
                    />
                  </div>
                  <button
                    className="swap-button"
                    onClick={
                      sidesl === "Buy" ? buy : sidesl === "Sell" ? sell : swap
                    }
                  >
                    {sidesl}
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
