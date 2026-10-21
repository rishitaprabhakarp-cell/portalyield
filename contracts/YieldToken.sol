// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title YieldToken
 * @notice PYT (PortalYield Token), the ERC-20 minted against staked RWA NFTs on Portaldot.
 * @dev Supply is controlled by owner-approved minters: the vault (principal + yield)
 *      and the cross-chain bridge (burn on exit, mint on entry).
 */
contract YieldToken is ERC20, Ownable {
    mapping(address => bool) public minters;

    event MinterUpdated(address indexed minter, bool allowed);

    modifier onlyMinter() {
        require(minters[msg.sender], "YieldToken: caller is not a minter");
        _;
    }

    constructor() ERC20("PortalYield Token", "PYT") Ownable(msg.sender) {}

    function setMinter(address minter, bool allowed) external onlyOwner {
        require(minter != address(0), "YieldToken: zero address");
        minters[minter] = allowed;
        emit MinterUpdated(minter, allowed);
    }

    function mint(address to, uint256 amount) external onlyMinter {
        _mint(to, amount);
    }

    /// @dev Minters only burn from the account that initiated the call into them
    ///      (an unstaking user or a user bridging out).
    function burnFrom(address from, uint256 amount) external onlyMinter {
        _burn(from, amount);
    }
}
