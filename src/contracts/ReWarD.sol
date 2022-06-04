// ReWarD.sol
pragma solidity 0.8.13;
 
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

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
