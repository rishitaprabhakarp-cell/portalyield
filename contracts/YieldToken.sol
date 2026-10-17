// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title YieldToken
 * @notice ERC-20 yield-bearing token backed by RWA NFTs on Portaldot Network V3.0
 * @dev PYT (PortalYield Token) — fractional ownership of RWA yield streams.
 *      Users stake RWA NFTs into the PortalYieldVault to receive PYT tokens.
 *      PYT holders earn proportional yield from the underlying RWA pool.
 *
 * Portaldot V3.0 Integration:
 * - ERC-20 standard fully compatible with Portaldot EVM layer
 * - Token can be bridged across chains via Portaldot's cross-chain infrastructure
 * - Modular design allows easy integration with Portaldot ecosystem dApps
 */
contract YieldToken is ERC20, ERC20Burnable, Ownable {
    // Only the vault contract can mint/burn
    address public vault;

    uint8 private constant DECIMALS = 18;

    event VaultUpdated(address indexed oldVault, address indexed newVault);

    modifier onlyVault() {
        require(msg.sender == vault, "YieldToken: caller is not the vault");
        _;
    }

    constructor() ERC20("PortalYield Token", "PYT") Ownable(msg.sender) {}

    /**
     * @notice Set the vault address that controls minting
     */
    function setVault(address _vault) external onlyOwner {
        require(_vault != address(0), "YieldToken: zero address");
        address old = vault;
        vault = _vault;
        emit VaultUpdated(old, _vault);
    }

    /**
     * @notice Mint PYT tokens — only callable by the vault
     * @param to Recipient
     * @param amount Amount in 18-decimal wei
     */
    function mint(address to, uint256 amount) external onlyVault {
        _mint(to, amount);
    }

    /**
     * @notice Burn PYT tokens — only callable by the vault
     * @param from Token holder
     * @param amount Amount to burn
     */
    function burnFrom(address from, uint256 amount) public override onlyVault {
        _burn(from, amount);
    }

    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }
}
