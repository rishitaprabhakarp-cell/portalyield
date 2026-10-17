// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./YieldToken.sol";

/**
 * @title CrossChainBridge
 * @notice Simplified cross-chain bridge for PYT tokens leveraging Portaldot V3.0
 * @dev Demonstrates Portaldot's multi-chain capabilities.
 *      In production, this integrates with Portaldot's native cross-chain messaging.
 *
 * Flow:
 *   Portaldot → Other Chain: lock PYT on Portaldot, emit event → relayer mints on destination
 *   Other Chain → Portaldot: relayer calls `receiveFromChain()` to mint PYT on Portaldot
 *
 * Portaldot V3.0 Integration:
 * - Uses Portaldot's cross-chain event system for trustless message passing
 * - Supports EVM↔WASM chain bridging via Portaldot's modular bridge layer
 * - Relayer can be replaced by Portaldot's native XCM/IBC adapter in production
 */
contract CrossChainBridge is Ownable, ReentrancyGuard {

    YieldToken public pytToken;

    // Trusted relayers authorized to process cross-chain messages
    mapping(address => bool) public trustedRelayers;

    // Chain ID => supported status
    mapping(uint256 => bool) public supportedChains;

    // Nonce for outbound messages (prevent replay)
    uint256 public outboundNonce;

    // Track processed inbound nonces (chainId => nonce => processed)
    mapping(uint256 => mapping(uint256 => bool)) public processedInbound;

    // Bridge stats
    uint256 public totalBridgedOut;
    uint256 public totalBridgedIn;

    // Events (indexed for cross-chain relayers)
    event BridgeOutInitiated(
        uint256 indexed nonce,
        address indexed sender,
        uint256 indexed destinationChainId,
        address destinationAddress,
        uint256 amount,
        uint256 timestamp
    );
    event BridgeInCompleted(
        uint256 indexed sourceNonce,
        uint256 indexed sourceChainId,
        address indexed recipient,
        uint256 amount
    );
    event RelayerUpdated(address indexed relayer, bool status);
    event ChainSupported(uint256 indexed chainId, bool status);

    modifier onlyRelayer() {
        require(trustedRelayers[msg.sender], "Bridge: not a trusted relayer");
        _;
    }

    constructor(address _pytToken) Ownable(msg.sender) {
        pytToken = YieldToken(_pytToken);
    }

    /**
     * @notice Bridge PYT tokens out to another chain
     * @param destinationChainId Target chain ID
     * @param destinationAddress Recipient address on destination chain
     * @param amount PYT amount to bridge (18 decimals)
     */
    function bridgeOut(
        uint256 destinationChainId,
        address destinationAddress,
        uint256 amount
    ) external nonReentrant {
        require(supportedChains[destinationChainId], "Bridge: chain not supported");
        require(destinationAddress != address(0), "Bridge: zero destination");
        require(amount > 0, "Bridge: zero amount");
        require(
            pytToken.balanceOf(msg.sender) >= amount,
            "Bridge: insufficient PYT balance"
        );

        // Lock PYT on this chain by burning (relayer will mint on destination)
        pytToken.burnFrom(msg.sender, amount);

        outboundNonce++;
        totalBridgedOut += amount;

        emit BridgeOutInitiated(
            outboundNonce,
            msg.sender,
            destinationChainId,
            destinationAddress,
            amount,
            block.timestamp
        );
    }

    /**
     * @notice Process an inbound bridge message from another chain
     * @dev Called by trusted relayer after verifying source chain event
     * @param sourceChainId Chain ID of the source chain
     * @param sourceNonce Nonce from the source chain event
     * @param recipient Address to receive PYT on this chain
     * @param amount PYT amount to mint
     */
    function bridgeIn(
        uint256 sourceChainId,
        uint256 sourceNonce,
        address recipient,
        uint256 amount
    ) external onlyRelayer nonReentrant {
        require(!processedInbound[sourceChainId][sourceNonce], "Bridge: already processed");
        require(recipient != address(0), "Bridge: zero recipient");
        require(amount > 0, "Bridge: zero amount");

        processedInbound[sourceChainId][sourceNonce] = true;
        totalBridgedIn += amount;

        pytToken.mint(recipient, amount);

        emit BridgeInCompleted(sourceNonce, sourceChainId, recipient, amount);
    }

    // ─── Admin ─────────────────────────────────────────────────────────────────

    function setRelayer(address relayer, bool status) external onlyOwner {
        trustedRelayers[relayer] = status;
        emit RelayerUpdated(relayer, status);
    }

    function setSupportedChain(uint256 chainId, bool status) external onlyOwner {
        supportedChains[chainId] = status;
        emit ChainSupported(chainId, status);
    }

    /**
     * @notice Get bridge stats
     */
    function getBridgeStats() external view returns (
        uint256 bridgedOut,
        uint256 bridgedIn,
        uint256 nonce
    ) {
        return (totalBridgedOut, totalBridgedIn, outboundNonce);
    }
}
