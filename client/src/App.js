import React, { Component } from "react";
import Election from "./build/Election.json";
import getWeb3 from "./getWeb3";

import "./App.css";

const initState = { value: '', storageValue: null, web3: null, accounts: null, contract: null, options: null, result: null}

class App extends Component {

  constructor(props){
    super(props)
    this.state = initState

    this.handleSubmit = this.handleSubmit.bind(this)
  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // web3.setProvider("http://localhost:8545")

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();

      const deployedNetwork = Election.networks[networkId];
    
      // console.log(web3, accounts, networkId )
      const instance = new web3.eth.Contract(
        Election.abi,
        deployedNetwork && deployedNetwork.address
      );

      instance.options.address="0xCca6eb1f8B7dDca23efD78025d9490D65883a33E"
      instance.options.from = accounts[0]
      // instance.options.gas  = 21064
        

      this.setState({ web3: web3, accounts: accounts, contract: instance}, this.runExample);
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
    this.setState({ loading: true });

    // Luam rezultate
    
    // Avem aici optiunile de vot
    let options = await contract.methods.viewOptions().call()
    console.log("candidati: ", options)

    // Se voteaza?
    let isVotingOpen = await contract.methods.isVotingOpen().call()
    console.log("isVotingOpen: ", isVotingOpen)

    let resultObject = null

    // Pentru cine a votat
    let votedFor = await contract.methods.votedAlready(accounts[0]).call()
    console.log("votedFor", votedFor)

    // Rezultate, in cazul in care voturile s-au terminat
    if(!isVotingOpen){
      let results = await contract.methods.viewResults().call()
      console.log("res", results)
      resultObject = {
        name: results[0],
        votesFor: results[1],
        votesTotal: results[2]
      }
    }

    // Deadline
    let deadline = await contract.methods.getDeadline().call()
    console.log("deadline", deadline)

    // Timpul curent pe blochain
    let time = await contract.methods.getBlockStamp().call()
    console.log("time", time)

    this.setState({loading: false, votedFor: votedFor, options: options, result: resultObject, isVotingOpen: isVotingOpen });
  };


  // Vote
  async handleSubmit(e){
    e.preventDefault()
    const {contract, value, accounts} = this.state
    // Loading
    this.setState({ loading: true  });
    
    // Votam
    await contract.methods.vote(value).send({from: accounts[0]})
      .then(a => this.setState({ value: '', votedFor: {voted: true, optionId: value}, loading: false, message: null  }) )
      .catch( err => {
        this.setState({message: "Ceva nu a mers bine", loading: false})
      })
  }

  // Incepe sesiune de votare; Nu se poate folosi pentru ca trebuie sa avem contul ownerului
  startVoting = async () => {
    const {contract, accounts} = this.state

    await contract.methods.startVoting(100).send({from: accounts[0]})
  }
  
  // Inchide sesiunea de votare -> la fel ca la start
  async stopVoting(){
    const {contract} = this.state

    await contract.methods.stopVoting().call()
  }

  // Pentru input
  handleChange = e => {
    this.setState({ value: e.target.value });    
  }

  generateOutput = () => {
    const {accounts, votedFor, message, loading,  isVotingOpen, contract, options, result} = this.state

    let output;
    
    if(!loading && !isVotingOpen && !result) // Daca votul nu este deschis si nu exista rezultate, deci nu exista vot
      output = 
        <>
          Nu exista nicio sesiune de vot
        </>
    else if(result) // Votul s-a terminat, afisam rezultate
      output = 
        <>
          {/* Ai votat? daca da, arata cu cine, daca nu spune ca nu */}
          {votedFor.voted ? <p>Ai votat cu {options[parseInt(votedFor.optionId)]}</p> : <p>Nu ai votat...</p> }
          Castigator: {result.name}
          <br/>
          {result.votesFor} / {result.votesTotal}

        </>
    else if(options && options.length > 0) // Votul se desfasoara, afisam optiuni si formular
      output = (
          <>
            {/* Ai votat? daca da, arata cu cine, daca nu spune ca nu */}
            {votedFor.voted ? <p>Ai votat cu {options[parseInt(votedFor.optionId)]}</p> : <p>Nu ai votat...</p> }
            {/* LISTA OPTIUNI */}
            Optiunile: {options.map((o,i) => <div key={i}>{i}: {o}</div>)}
            {/* FORMULAR DE ALEGERE */}
            <form onSubmit={this.handleSubmit}>
              <input type="text" name="value" onChange={this.handleChange} value={this.state.value} />
              <input type="submit" value="Trimite"/>
            </form>
          </>)

    return output;
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    const {accounts, votedFor, message, loading,  isVotingOpen, contract, options, result} = this.state


    let output = this.generateOutput()
    // S-a terminat


    return (
      <div className="App">
        <h1>Mio alegeros electoralis!</h1>
        {/* ADRESA CONT */}
        <cite>MetaMask: {accounts[0]}</cite>
        <br/>
        {/* ADRESA CONTRACT */}
        <cite>Contract: {contract._address} </cite>
        <br/>
        {/* MESAJ DE EROARE  */}
        {message && <h2 style={{color: "red"}}>{message}</h2>}
        {/* LOADING */}
        {loading && <div>Loading...<br/></div>}
        {/* OUTPUT */}
        {output}
      </div>
    );
  }
}

export default App;
