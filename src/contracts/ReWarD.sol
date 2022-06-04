// ReWarD.sol
pragma solidity 0.8.13;
 
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
 
contract ReWarD is ERC20, Ownable {
	constructor() ERC20('ReWarD', 'RWD') {} 

	// fonction Mint pour créer des tokens
	function Mint(address recipient, uint amount) external {
        require (msg.sender == owner(), "not owner"); 
		_mint(recipient, amount);
	}
}

