// SPDX-License-Identifier: MIT
 
pragma solidity 0.8.13;
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';


// thanks to Smart Contract Programmer on YouTube for the demo
pragma solidity 0.8.13;

contract ChainlinkETHprice {
  AggregatorV3Interface internal priceFeed;

  constructor() {
    // ETH/USD price
    priceFeed = AggregatorV3Interface(0x9326BFA02ADD2366b30bacB125260Af641031331);
  }

  function getLatestPrice() public view returns (int) {
    (
      uint80 roundID,
      int price,
      uint startedAt,
      uint timeStamp,
      uint80 answeredInRound
    ) = priceFeed.latestRoundData();
    // for ETH/USD price is scaled up by 10^8
    return price / 1e8;
  }
}

interface AggregatorV3Interface {
  function latestRoundData()
    external
    view
    returns (
      uint80 roundId,
      int answer,
      uint startedAt,
      uint updatedAt,
      uint80 answeredInRound
    );
}

contract ReWarD is ERC20, Ownable {
	constructor() ERC20('ReWarD', 'RWD') {} 

  Staking staking;

  function SetApprovedStakingAddress (Staking StakingAddress) public {
     require (msg.sender==owner(), "not owner");
     staking = StakingAddress;
  } 

	function Mint(address recipient, uint amount) external {
        require (msg.sender == owner() || msg.sender == address(staking), "not owner nor staking contract"); 
		_mint(recipient, amount);
	}
}


contract Staking is Ownable {

//Contracts called by this contract:
ReWarD reward; //contract of the reward token;
ChainlinkETHprice oracle; //contract fetching Chainlink Oracle prices of ETH on the Kovan tesnet;

uint ETHTVL;

//data[][0] = deposit; data[][1] = timestamp of last event (deposit or withdrawal); data[][2] = ETH price at the time of 
//last event given by Chainlink Oracle with contract 0x57EF9887279a27F1a895918defC2a0443113ff93 on Kovan; 
//data[][3] = rewards to be claimed
mapping (address => uint[4]) public data; 

event Deposit(address depositor, uint amount);
event Withdrawal(address withdrawer, uint amount);
event Update(address addr, uint amount);
event Claim(address addr, uint amount);


///Set Oracle address and reward token address:

function SetOracle (ChainlinkETHprice OracleAddress) public {
  require (msg.sender==owner(), "not owner");
  oracle = OracleAddress;
} 

function SetReWarD (ReWarD ReWarDaddress) public {
  require (msg.sender==owner(), "not owner");
  reward = ReWarDaddress;
} 

/// VIEW FUNCTIONS

function getStakedBalance(address addr) public view returns (uint) {return data[addr][0];}
     
function getETHTVL() public view returns (uint) {return ETHTVL;}

function getVaultBalance() public view returns (uint) {return address(this).balance;}

function getOldRewards(address addr) public view returns (uint){return data[addr][3];} 


/// PAYABLE FUNCTIONS 

function deposit() public payable {
   require (msg.value > 0, "no 0 deposit");
   UpdateReward();
   data[msg.sender][0] += msg.value;
   ETHTVL += msg.value;
   emit Deposit(msg.sender, msg.value);
  
}

function withdrawal(uint amount) public {
   require (amount > 0, "no 0 withdrawal");
   require (data[msg.sender][0] >=amount, "lack of funds");
   UpdateReward();
   data[msg.sender][0] -= amount;
   ETHTVL -= amount; 
   address payable addr = payable(msg.sender); 
   addr.transfer(amount);
   emit Withdrawal(msg.sender, amount);   
}

function WithdrawAllAndClaimRewards() public {
   uint bal = data[msg.sender][0];
   require (bal > 0, "no 0 withdrawal");
   UpdateReward();
   data[msg.sender][0] = 0;
   ETHTVL -= bal; 
   address payable addr = payable(msg.sender); 
   addr.transfer(bal);
   emit Withdrawal(msg.sender, bal);
   ClaimRewards();
   }


/// REWARDS FUNCTIONS

function UpdateReward() public {
     int price = oracle.getLatestPrice();
     uint price2 = uint(int(price));
     uint time2 = block.timestamp;
     uint bal = data[msg.sender][0];
     address addr = msg.sender;
   if (bal>0){
      uint price1 = data[addr][2];
      uint time1 = data[addr][1];
      //the calculation below makes leads to an APY of 19.6% assuming that the price of the reward token is 1$:
      data[addr][3] += bal*(price1+price2)*(time2-time1)*31/10000000000;
   }
   data[addr][2] = price2;
   data[addr][1] = time2;
   emit Update(addr, bal);
}

function ClaimRewards() public {
   UpdateReward();
   uint totalReward = data[msg.sender][3];
   data[msg.sender][3]=0;
   reward.Mint(msg.sender,totalReward);
   emit Claim(msg.sender, totalReward);
}


}
