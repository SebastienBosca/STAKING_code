import React, { Component } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Table from 'react-bootstrap/Table';
import Staking from "./contracts/Staking.json";
import ChainlinkETHprice from "./contracts/ChainlinkETHprice.json";
import getWeb3 from "./getWeb3";
import "./App.css"; 


class App extends Component {
  state = { web3: null, accounts: null, contract1: null, contract2: null }; 

  componentWillMount = async () => {
    try {
      // Récupérer le provider web3
      const web3 = await getWeb3();
  
      // Utiliser web3 pour récupérer les comptes de l’utilisateur (MetaMask dans notre cas) 
      const accounts = await web3.eth.getAccounts();

      // Récupérer l’instance du smart contract “Staking” avec web3 et les informations du déploiement du fichier (client/src/contracts/Staking.json)
  
      const instance1 = new web3.eth.Contract(
        Staking.abi,
        "0x160b5C307bB8570050D67cc97dD6f50DB89F661D", 
      );
        const instance2 = new web3.eth.Contract(
        ChainlinkETHprice.abi,
        "0x57EF9887279a27F1a895918defC2a0443113ff93", 
      );
 
      this.setState({ web3, accounts, contract1: instance1, contract2: instance2 }, this.runInit);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Non-Ethereum browser detected. Can you please try to install MetaMask before starting.`,
      );
      console.error(error);
    }
  };

  runInit = async() => {
    const { accounts, contract1, contract2 } = this.state;
  
    // récupérer la TVL
    const ETHTVL = await contract1.methods.getETHTVL().call();
    const TVL = ETHTVL/1000000000000000000;

    // récupérer le nombre d'ETH sur le contrat
    const ContractBalance = await contract1.methods.getVaultBalance().call(); 

    // récupérer le montant déposé
    const balance = await contract1.methods.getStakedBalance(accounts[0]).call();
 

    // récupérer le prix de l'ETH avec Chainlink
    const price = await contract2.methods.getLatestPrice().call();
 

    // Mettre à jour le state 
   this.setState({ETHTVL:ETHTVL, ContractBalance:ContractBalance, balance:balance, price:price });
  }; 



  DEPOSIT = async() => {
    const { accounts, contract, web3 } = this.state;
    const DamountWei = web3.utils.toWei(this.Damount.value, 'ether');   
  await contract.methods.deposit().send({from: accounts[0], value: DamountWei});
  this.runInit();
}
  
  WITHDRAW = async() => {
    const { accounts, contract, web3 } = this.state;
    const WamountWei = web3.utils.toWei(this.Wamount.value, 'ether');  
    await contract.methods.withdrawal(WamountWei).send({from: accounts[0]});
    this.runInit();
  }
 
  //CLAIM = async() => {
  //  const { accounts, contract } = this.state;
  //  const propo = this.propo.value;
  //  await contract.methods.RegisterProposal(propo).send({from: accounts[0]});
  //  this.runInit();
  //}


  render() {
    const { ETHTVL, ContractBalance, balance, price} = this.state;
   
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    return (
      <div className="App">
        <div>
            <h2 className="text-center">ETH Vault</h2>
            <hr></hr>
            <br></br>
        </div>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <Card style={{ width: '50rem' }}>
            <Card.Header><strong> ETH price : {price} $ </strong></Card.Header>
            <Card.Header><strong>TVL : {ETHTVL/1000000000000000000} ETH </strong></Card.Header>
            <Card.Header><strong>Contract Balance: {ContractBalance/1000000000000000000} </strong></Card.Header>
            <Card.Header><strong>Number of active users: kl  </strong></Card.Header>
            <Card.Header><strong>Your staked balance: {balance/1000000000000000000}  </strong></Card.Header>
            <Card.Header><strong>Your index: blob </strong></Card.Header>
          </Card>
        </div>
        <br></br>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <Card style={{ width: '50rem' }}>
            <Card.Header><strong> I want to deposit: </strong></Card.Header>
            <Card.Body>   
                <Form.Group controlId="formAddress">
                <Form.Control type="text" id="Damount"
                ref={(input) => { this.Damount = input }}
                />
                </Form.Group>    
              <Button onClick={ this.DEPOSIT } variant="dark" > DEPOSIT </Button>
            </Card.Body>
          </Card>
          </div>
          <div style={{display: 'flex', justifyContent: 'center'}}>
          <Card style={{ width: '50rem' }}>
            <Card.Header><strong> I want to withdraw: </strong></Card.Header>
            <Card.Body>
                <Form.Group controlId="formAddress">
                <Form.Control type="text" id="Wamount"
                ref={(input) => { this.Wamount = input }}
                />
                </Form.Group>
            <Button onClick={ this.WITHDRAW } variant="dark" > WITHDRAW </Button>     
            </Card.Body>
          </Card>
          </div>
        <br></br>
      </div>
    );

  }
}

export default App;
