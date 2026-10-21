// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RWAAsset
 * @notice ERC-721 contract for tokenizing Real World Assets on Portaldot Network V3.0
 * @dev Deployed on Portaldot EVM-compatible layer. Each NFT represents a unique RWA
 *      (e.g., T-Bill, corporate bond, real estate deed) with verifiable metadata.
 *
 * Portaldot V3.0 Integration:
 * - Leverages Portaldot's EVM compatibility for seamless Solidity deployment
 * - Asset data anchored on-chain via Portaldot's modular storage layer
 * - Cross-chain asset visibility via Portaldot multi-chain infrastructure
 */
contract RWAAsset is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    // Asset types supported
    enum AssetType {
        TREASURY_BILL,
        CORPORATE_BOND,
        REAL_ESTATE,
        COMMODITY,
        EQUITY
    }

    struct AssetMetadata {
        AssetType assetType;
        string issuer;
        uint256 faceValue;       // In USD cents (e.g., 100000 = $1,000)
        uint256 maturityDate;    // Unix timestamp
        uint256 annualYieldBPS;  // Yield in basis points (e.g., 500 = 5%)
        bool isActive;
        uint256 mintedAt;
        address originalOwner;
    }

    // tokenId => metadata
    mapping(uint256 => AssetMetadata) public assetData;

    // Whitelisted asset issuers (KYC'd entities)
    mapping(address => bool) public whitelistedIssuers;

    // Track total face value locked
    uint256 public totalFaceValueLocked;

    bool public demoMode;
    mapping(address => mapping(uint8 => bool)) public demoClaimed;

    // Events
    event AssetMinted(
        uint256 indexed tokenId,
        address indexed owner,
        AssetType assetType,
        string issuer,
        uint256 faceValue,
        uint256 annualYieldBPS
    );
    event IssuerWhitelisted(address indexed issuer, bool status);
    event AssetDeactivated(uint256 indexed tokenId);
    event DemoModeUpdated(bool enabled);

    modifier onlyWhitelistedIssuer() {
        require(
            whitelistedIssuers[msg.sender] || msg.sender == owner(),
            "RWAAsset: not a whitelisted issuer"
        );
        _;
    }

    constructor() ERC721("PortalYield RWA Asset", "PYRWA") Ownable(msg.sender) {
        // Whitelist deployer as initial issuer
        whitelistedIssuers[msg.sender] = true;
    }

    /**
     * @notice Tokenize a real-world asset as an NFT
     * @param to Recipient address
     * @param uri IPFS/Arweave metadata URI
     * @param assetType Type of real-world asset
     * @param issuer Name of the issuing entity
     * @param faceValue Face value in USD cents
     * @param maturityDate Unix timestamp of maturity
     * @param annualYieldBPS Annual yield in basis points
     */
    function mintAsset(
        address to,
        string calldata uri,
        AssetType assetType,
        string calldata issuer,
        uint256 faceValue,
        uint256 maturityDate,
        uint256 annualYieldBPS
    ) external onlyWhitelistedIssuer returns (uint256) {
        return _mintAsset(to, uri, assetType, issuer, faceValue, maturityDate, annualYieldBPS);
    }

    /**
     * @notice Testnet-only: anyone can claim one of three sample assets while demo mode is on.
     * @param kind 0 = T-Bill ($1,000 @ 5.2%), 1 = corporate bond ($5,000 @ 7.5%), 2 = real estate ($10,000 @ 8%)
     */
    function claimDemoAsset(uint8 kind) external returns (uint256) {
        require(demoMode, "RWAAsset: demo mode is off");
        require(kind <= 2, "RWAAsset: unknown demo asset");
        require(!demoClaimed[msg.sender][kind], "RWAAsset: demo asset already claimed");
        demoClaimed[msg.sender][kind] = true;

        if (kind == 0) {
            return _mintAsset(msg.sender, "ipfs://portalyield/demo/tbill", AssetType.TREASURY_BILL, "US Treasury", 100000, block.timestamp + 365 days, 520);
        }
        if (kind == 1) {
            return _mintAsset(msg.sender, "ipfs://portalyield/demo/bond", AssetType.CORPORATE_BOND, "Apple Inc.", 500000, block.timestamp + 730 days, 750);
        }
        return _mintAsset(msg.sender, "ipfs://portalyield/demo/reit", AssetType.REAL_ESTATE, "Manhattan REIT", 1000000, block.timestamp + 730 days, 800);
    }

    function setDemoMode(bool enabled) external onlyOwner {
        demoMode = enabled;
        emit DemoModeUpdated(enabled);
    }

    /// @notice Token IDs currently held by `account`. Linear scan; intended for off-chain reads.
    function tokensOfOwner(address account) external view returns (uint256[] memory) {
        uint256[] memory ids = new uint256[](balanceOf(account));
        uint256 found;
        for (uint256 id = 1; id <= _tokenIdCounter && found < ids.length; id++) {
            if (_ownerOf(id) == account) ids[found++] = id;
        }
        return ids;
    }

    function _mintAsset(
        address to,
        string memory uri,
        AssetType assetType,
        string memory issuer,
        uint256 faceValue,
        uint256 maturityDate,
        uint256 annualYieldBPS
    ) internal returns (uint256) {
        require(faceValue > 0, "RWAAsset: face value must be positive");
        require(maturityDate > block.timestamp, "RWAAsset: invalid maturity date");
        require(annualYieldBPS <= 10000, "RWAAsset: yield cannot exceed 100%");

        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        assetData[tokenId] = AssetMetadata({
            assetType: assetType,
            issuer: issuer,
            faceValue: faceValue,
            maturityDate: maturityDate,
            annualYieldBPS: annualYieldBPS,
            isActive: true,
            mintedAt: block.timestamp,
            originalOwner: to
        });

        totalFaceValueLocked += faceValue;

        emit AssetMinted(tokenId, to, assetType, issuer, faceValue, annualYieldBPS);
        return tokenId;
    }

    /**
     * @notice Whitelist or revoke an asset issuer
     */
    function setIssuerWhitelist(address issuer, bool status) external onlyOwner {
        whitelistedIssuers[issuer] = status;
        emit IssuerWhitelisted(issuer, status);
    }

    /**
     * @notice Deactivate an asset (e.g., upon maturity)
     */
    function deactivateAsset(uint256 tokenId) external {
        require(
            ownerOf(tokenId) == msg.sender || msg.sender == owner(),
            "RWAAsset: not authorized"
        );
        require(assetData[tokenId].isActive, "RWAAsset: already inactive");

        assetData[tokenId].isActive = false;
        totalFaceValueLocked -= assetData[tokenId].faceValue;

        emit AssetDeactivated(tokenId);
    }

    /**
     * @notice Calculate accrued yield for a token
     * @return Accrued yield in USD cents
     */
    function accruedYield(uint256 tokenId) external view returns (uint256) {
        AssetMetadata storage asset = assetData[tokenId];
        if (!asset.isActive) return 0;

        uint256 elapsed = block.timestamp - asset.mintedAt;
        // yield = faceValue * annualYieldBPS / 10000 * (elapsed / 365 days)
        return (asset.faceValue * asset.annualYieldBPS * elapsed) / (10000 * 365 days);
    }

    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @notice Get full asset metadata struct for a tokenId
     */
    function getAssetData(uint256 tokenId) external view returns (AssetMetadata memory) {
        return assetData[tokenId];
    }

    // Required overrides
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
