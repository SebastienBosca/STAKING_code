import React, { Component } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Staking from "./contracts/Staking.json";
import ReWarD from "./contracts/ReWarD.json";
import ChainlinkETHprice from "./contracts/ChainlinkETHprice.json";
import getWeb3 from "./getWeb3";
import "./App.css"; 


class App extends Component {
  state = { web3: null, accounts: null, contract1: null, contract2: null, contract3: null }; 

  componentWillMount = async () => {
    try {
      // Récupérer le provider web3
      const web3 = await getWeb3();
  
      // Utiliser web3 pour récupérer les comptes de l’utilisateur (MetaMask dans notre cas) 
      const accounts = await web3.eth.getAccounts();

      // Récupérer l’instance du smart contract “Staking” avec web3 et les informations du déploiement du fichier (client/src/contracts/Staking.json)
  
        const instance1 = new web3.eth.Contract(
        Staking.abi,
        "0xeD1dD142c33d45Ed8803634b31A22E0ad3b34199", 
      );
        const instance2 = new web3.eth.Contract(
        ChainlinkETHprice.abi,
        "0x57EF9887279a27F1a895918defC2a0443113ff93", 
      );
        const instance3 = new web3.eth.Contract(
        ReWarD.abi,
        "0xF230C7E192374C6a5421CD6286862d73472C8E0a", 
      );
 
      this.setState({ web3, accounts, contract1: instance1, contract2: instance2, contract3: instance3 }, this.runInit);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Non-Ethereum browser detected. Can you please try to install MetaMask before starting.`,
      );
      console.error(error);
    }
  };

  runInit = async() => {
    const { accounts, contract1, contract2, contract3 } = this.state;
  
    // récupérer la TVL
    const ETHTVL = await contract1.methods.getETHTVL().call();

    // récupérer le nombre d'ETH sur le contrat
    const ContractBalance = await contract1.methods.getVaultBalance().call(); 

    // récupérer le montant déposé
    const balance = await contract1.methods.getStakedBalance(accounts[0]).call()/1000000000000000000;
 

    // récupérer le prix de l'ETH avec Chainlink
    const price = await contract2.methods.getLatestPrice().call();

    //récupérer le montant de récompenses acquis 
    const OldRewards= await contract1.methods.getOldRewards(accounts[0]).call()/1000000000000000000;

    //récupérer la balance en jetons RWD du portefeuille
    const walletBalance = await contract3.methods.balanceOf(accounts[0]).call()/1000000000000000000;

    // Mettre à jour le state 
   this.setState({ETHTVL:ETHTVL, ContractBalance:ContractBalance, balance:balance, price:price, OldRewards:OldRewards, walletBalance:walletBalance });
  }; 



  DEPOSIT = async() => {
    const { accounts, contract1, web3 } = this.state;
    const DamountWei = web3.utils.toWei(this.Damount.value, 'ether');   
  await contract1.methods.deposit().send({from: accounts[0], value: DamountWei});
  this.runInit();
}
  
  WITHDRAW = async() => {
    const { accounts, contract1, web3 } = this.state;
    const WamountWei = web3.utils.toWei(this.Wamount.value, 'ether');  
    await contract1.methods.withdrawal(WamountWei).send({from: accounts[0]});
    this.runInit();
  }

  UPDATE = async() => {
    const { accounts, contract1, web3 } = this.state;
    await contract1.methods.UpdateReward().send({from: accounts[0]});
    this.runInit();
  }

  CLAIM = async() => {
    const { accounts, contract1, web3 } = this.state;
    await contract1.methods.ClaimRewards().send({from: accounts[0]});
    this.runInit();
  }


  WACR = async() => {
    const { accounts, contract1, web3 } = this.state;
    await contract1.methods.WithdrawAllAndClaimRewards().send({from: accounts[0]});
    this.runInit();
  }

 

  render() {
    const { ETHTVL, ContractBalance, balance, price, OldRewards, walletBalance} = this.state;
   
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    return (
      <div className="App">

        <div>
            <h2 className="text-center">ETH Vault 19.6% APY </h2>
            <hr></hr>
            <br></br>
        </div>

        <div style={{display: 'flex', justifyContent: 'center'}}>
          <Card style={{ width: '50rem' }}>
            <Card.Header><strong> ETH price : {price} $ </strong></Card.Header>
            <Card.Header><strong>TVL : {ETHTVL/1000000000000000000} ETH </strong></Card.Header>
            <Card.Header><strong>Contract Balance: {ContractBalance/1000000000000000000} ETH </strong></Card.Header>
            <Card.Header><strong>Your staked balance: {balance} ETH </strong></Card.Header>
            <Card.Header><strong>Your rewards stored on-chain: {OldRewards} RWD </strong></Card.Header>
            <Card.Header><strong>In your wallet: {walletBalance} RWD </strong></Card.Header>     
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
    
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <Card style={{ width: '50rem' }}>
            <Card.Header><strong> Recalculing your rewards until now: </strong></Card.Header>
            <Card.Body>
                <Button onClick={ this.UPDATE } variant="dark" > Update Rewards </Button>     
            </Card.Body>
          </Card>
        </div>

        <br></br>

        <div style={{display: 'flex', justifyContent: 'center'}}>
          <Card style={{ width: '50rem' }}>
            <Card.Header><strong> Sending rewards to your wallet: </strong></Card.Header>
            <Card.Body>
                <Button onClick={ this.CLAIM } variant="dark" > Claim Rewards </Button>     
            </Card.Body>
          </Card>
        </div>
       
        <br></br>

        <div style={{display: 'flex', justifyContent: 'center'}}>
          <Card style={{ width: '50rem' }}>
            <Card.Header><strong> Sending staked ETH + rewards to your wallet: </strong></Card.Header>
            <Card.Body>
                <Button onClick={ this.WACR } variant="dark" > Withdraw All and Claim Rewards </Button>     
            </Card.Body>
          </Card>
        </div>

      </div>
    );

  }
}

export default App;
