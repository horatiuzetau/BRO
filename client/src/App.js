import React, { Component } from "react";
import Election from "./build/Election.json";
import getWeb3 from "./getWeb3";

import "./App.css";

const initState = { value: '', storageValue: null, web3: null, accounts: null, contract: null, options: null}

class App extends Component {

  constructor(props){
    super(props)
    this.state = initState

    this.handleSubmit = this.handleSubmit.bind(this)
  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3("https://mainnet.infura.io/v3/781d6fc8e6ea4d869ef23e0d9d07ac0a");

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();

      // const deployedNetwork = Election.networks[networkId];
    
      // console.log(web3, accounts, networkId )

      const instance = new web3.eth.Contract(
        Election.abi,
        "0xE08e7af249eddcAb851584e16dFDaE8f6914618f"
      );

      instance.options.from = accounts[0]
      instance.options.gas  = 213064
        

      this.setState({ web3, accounts, contract: instance}, this.runExample);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runExample = async () => {
    const { accounts, contract} = this.state;

    // console.log(contract.methods.viewOptions())

    // Luam rezultate
    // let results = await contract.methods.viewResults().call()

    // Avem aici optiunile de vot
    let options = await contract.methods.viewOptions().call()
    console.log(options)

    this.setState({ options: options, results: '' });
  };


  async handleSubmit(e){
    e.preventDefault()

    const {contract, value, accounts} = this.state
    
    // Votam
    await contract.methods.vote(value).send({from: accounts[0]})
  }

  handleChange = e => {
    this.setState({ value: e.target.value });    
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    const {accounts, contract, options, results} = this.state

    let output
    
    if(results) // Votul s-a terminat
      output = "Rezultatele: ..."
    else if(options && options.length > 0) // Votul se desfasoara
      output = (
          <>
            Optiunile: ...
            <p>Ai votat cu {this.state.storageValue}</p>
            <form onSubmit={this.handleSubmit}>
              <input type="text" name="value" onChange={this.handleChange} value={this.state.value} />
              <input type="submit" value="Trimite"/>
            </form>
          </>)
    else // Votul nu exista
        output = "Nu exista nicio sesiune de vot"

    // S-a terminat


    return (
      <div className="App">
        <h1>Mio alegeros electoralis!</h1>
        <cite>MetaMask: {accounts[0]}</cite>
        <br/>
        <cite>Contract: {contract._address} </cite>
        <br/>
        {output}

        
      </div>
    );
  }
}

export default App;
