// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VaultToken
 * @dev ERC-20 token with mint/burn + owner-controlled supply cap
 */
contract VaultToken is ERC20, ERC20Burnable, Ownable {

    uint256 public constant MAX_SUPPLY = 1_000_000 * 10 ** 18; // 1 million tokens

    event TokensMinted(address indexed to, uint256 amount);
    event MaxSupplyReached(uint256 currentSupply);

    error ExceedsMaxSupply(uint256 requested, uint256 available);
    error ZeroAddress();
    error ZeroAmount();

    constructor(
        address initialOwner,
        uint256 initialSupply
    ) ERC20("VaultToken", "VTK") Ownable(initialOwner) {
        if (initialOwner == address(0)) revert ZeroAddress();
        if (initialSupply > MAX_SUPPLY) revert ExceedsMaxSupply(initialSupply, MAX_SUPPLY);

        _mint(initialOwner, initialSupply);
        emit TokensMinted(initialOwner, initialSupply);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();

        uint256 available = MAX_SUPPLY - totalSupply();
        if (amount > available) revert ExceedsMaxSupply(amount, available);

        _mint(to, amount);
        emit TokensMinted(to, amount);

        if (totalSupply() == MAX_SUPPLY) {
            emit MaxSupplyReached(totalSupply());
        }
    }

    function remainingSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }

    function decimals() public pure override returns (uint8) {
        return 18;
    }
}
