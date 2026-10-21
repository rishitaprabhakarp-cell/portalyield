// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "./RWAAsset.sol";
import "./YieldToken.sol";

/**
 * @title PortalYieldVault
 * @notice Core vault for PortalYield — stake RWA NFTs, earn PYT yield tokens
 * @dev The vault:
 *   1. Accepts RWA NFT deposits (ERC-721)
 *   2. Mints PYT (ERC-20) proportional to the NFT's face value
 *   3. Accumulates yield from the underlying RWA pool
 *   4. Allows PYT holders to claim yield and withdraw
 *
 * Portaldot V3.0 Integration:
 * - Showcases EVM + ERC-721 + ERC-20 stack on Portaldot's EVM layer
 * - Pool architecture enables cross-chain liquidity via Portaldot bridges
 * - Modular vault design aligns with Portaldot's modular architecture
 *
 * PYT Minting Ratio: 1 USD cent of face value = 1 PYT (1e16 wei)
 * Example: $1,000 T-Bill (100000 cents) = 100,000 PYT
 */
contract PortalYieldVault is ReentrancyGuard, Pausable, Ownable, IERC721Receiver {

    RWAAsset public rwaAsset;
    YieldToken public yieldToken;

    // PYT minted per USD cent of face value: 1e16 wei (= 0.01 PYT per cent)
    uint256 public constant PYT_PER_CENT = 1e16;

    struct Stake {
        uint256 tokenId;
        address staker;
        uint256 stakedAt;
        uint256 faceValue;       // USD cents at time of staking
        uint256 annualYieldBPS;  // locked-in yield rate
        uint256 pytMinted;       // PYT minted for this stake
        uint256 lastClaimAt;     // timestamp of last yield claim
        uint256 maturityDate;    // yield stops accruing here
        bool isStaked;
    }

    struct Position {
        uint256 tokenId;
        uint256 faceValue;
        uint256 annualYieldBPS;
        uint256 pytMinted;
        uint256 stakedAt;
        uint256 lastClaimAt;
        uint256 maturityDate;
        uint256 pendingYield;
    }

    // tokenId => Stake info
    mapping(uint256 => Stake) public stakes;

    // staker => list of staked tokenIds
    mapping(address => uint256[]) public stakerTokens;
    mapping(address => mapping(uint256 => bool)) private _inStakerList;

    // Total PYT minted across all stakes
    uint256 public totalPYTMinted;

    // Yield claims distributed (in PYT wei)
    uint256 public totalYieldDistributed;

    // Events
    event NFTStaked(
        uint256 indexed tokenId,
        address indexed staker,
        uint256 faceValue,
        uint256 pytMinted
    );
    event NFTUnstaked(
        uint256 indexed tokenId,
        address indexed staker,
        uint256 pytBurned
    );
    event YieldClaimed(
        uint256 indexed tokenId,
        address indexed staker,
        uint256 yieldAmount
    );

    constructor(address _rwaAsset, address _yieldToken) Ownable(msg.sender) {
        rwaAsset = RWAAsset(_rwaAsset);
        yieldToken = YieldToken(_yieldToken);
    }

    /**
     * @notice Stake an RWA NFT to receive PYT tokens
     * @param tokenId The RWA NFT tokenId to stake
     */
    function stake(uint256 tokenId) external nonReentrant whenNotPaused {
        require(rwaAsset.ownerOf(tokenId) == msg.sender, "Vault: not NFT owner");
        require(!stakes[tokenId].isStaked, "Vault: already staked");

        RWAAsset.AssetMetadata memory meta = rwaAsset.getAssetData(tokenId);
        require(meta.isActive, "Vault: asset not active");
        require(meta.maturityDate > block.timestamp, "Vault: asset matured");

        // Transfer NFT to vault
        rwaAsset.safeTransferFrom(msg.sender, address(this), tokenId);

        // Mint PYT proportional to face value
        uint256 pytAmount = meta.faceValue * PYT_PER_CENT;
        yieldToken.mint(msg.sender, pytAmount);

        stakes[tokenId] = Stake({
            tokenId: tokenId,
            staker: msg.sender,
            stakedAt: block.timestamp,
            faceValue: meta.faceValue,
            annualYieldBPS: meta.annualYieldBPS,
            pytMinted: pytAmount,
            lastClaimAt: block.timestamp,
            maturityDate: meta.maturityDate,
            isStaked: true
        });

        if (!_inStakerList[msg.sender][tokenId]) {
            _inStakerList[msg.sender][tokenId] = true;
            stakerTokens[msg.sender].push(tokenId);
        }
        totalPYTMinted += pytAmount;

        emit NFTStaked(tokenId, msg.sender, meta.faceValue, pytAmount);
    }

    /**
     * @notice Claim accrued yield for a staked NFT (paid in PYT)
     * @param tokenId The staked NFT tokenId
     */
    function claimYield(uint256 tokenId) external nonReentrant whenNotPaused {
        Stake storage s = stakes[tokenId];
        require(s.isStaked, "Vault: not staked");
        require(s.staker == msg.sender, "Vault: not staker");

        uint256 yieldPYT = _pendingYield(tokenId);
        require(yieldPYT > 0, "Vault: no yield to claim");

        s.lastClaimAt = block.timestamp;
        totalYieldDistributed += yieldPYT;

        yieldToken.mint(msg.sender, yieldPYT);

        emit YieldClaimed(tokenId, msg.sender, yieldPYT);
    }

    /**
     * @notice Unstake NFT — returns NFT, burns PYT principal, claims pending yield
     * @param tokenId The staked NFT tokenId
     */
    function unstake(uint256 tokenId) external nonReentrant {
        Stake storage s = stakes[tokenId];
        require(s.isStaked, "Vault: not staked");
        require(s.staker == msg.sender, "Vault: not staker");

        // Claim pending yield first
        uint256 yieldPYT = _pendingYield(tokenId);
        if (yieldPYT > 0) {
            yieldToken.mint(msg.sender, yieldPYT);
            totalYieldDistributed += yieldPYT;
            emit YieldClaimed(tokenId, msg.sender, yieldPYT);
        }

        // Burn principal PYT
        uint256 pytToBurn = s.pytMinted;
        yieldToken.burnFrom(msg.sender, pytToBurn);
        totalPYTMinted -= pytToBurn;

        // Return NFT
        s.isStaked = false;
        rwaAsset.safeTransferFrom(address(this), msg.sender, tokenId);

        emit NFTUnstaked(tokenId, msg.sender, pytToBurn);
    }

    /**
     * @notice Get pending yield for a staked token (in PYT wei)
     */
    function pendingYield(uint256 tokenId) external view returns (uint256) {
        return _pendingYield(tokenId);
    }

    /**
     * @notice Get all stakes for a given staker
     */
    function getStakerTokens(address staker) external view returns (uint256[] memory) {
        return stakerTokens[staker];
    }

    /**
     * @notice Open positions for `staker`, with yield pending as of this block
     */
    function getPositions(address staker) external view returns (Position[] memory) {
        uint256[] storage ids = stakerTokens[staker];
        uint256 open;
        for (uint256 i = 0; i < ids.length; i++) {
            Stake storage s = stakes[ids[i]];
            if (s.isStaked && s.staker == staker) open++;
        }

        Position[] memory out = new Position[](open);
        uint256 n;
        for (uint256 i = 0; i < ids.length && n < open; i++) {
            Stake storage s = stakes[ids[i]];
            if (!s.isStaked || s.staker != staker) continue;
            out[n++] = Position({
                tokenId: s.tokenId,
                faceValue: s.faceValue,
                annualYieldBPS: s.annualYieldBPS,
                pytMinted: s.pytMinted,
                stakedAt: s.stakedAt,
                lastClaimAt: s.lastClaimAt,
                maturityDate: s.maturityDate,
                pendingYield: _pendingYield(s.tokenId)
            });
        }
        return out;
    }

    /**
     * @notice Get vault stats
     */
    function getVaultStats() external view returns (
        uint256 totalStaked,
        uint256 totalPYT,
        uint256 totalYield
    ) {
        return (
            rwaAsset.balanceOf(address(this)),
            totalPYTMinted,
            totalYieldDistributed
        );
    }

    // ─── Internal ──────────────────────────────────────────────────────────────

    function _pendingYield(uint256 tokenId) internal view returns (uint256) {
        Stake storage s = stakes[tokenId];
        if (!s.isStaked) return 0;

        uint256 end = block.timestamp < s.maturityDate ? block.timestamp : s.maturityDate;
        if (end <= s.lastClaimAt) return 0;
        uint256 elapsed = end - s.lastClaimAt;
        // yield = pytMinted * annualYieldBPS / 10000 * (elapsed / 365 days)
        // pytMinted already represents face value in PYT
        return (s.pytMinted * s.annualYieldBPS * elapsed) / (10000 * 365 days);
    }

    // ─── Admin ─────────────────────────────────────────────────────────────────

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    // Required for ERC721 safeTransferFrom
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
