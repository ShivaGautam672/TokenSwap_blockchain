// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/interfaces/IERC20.sol";

contract writer {
    struct TokenStruct {
        IERC20 token;
        string name;
        address tokenAddress;
    }

    struct Pair {
        IERC20 token;
        uint256 reserve;
        uint256 reserveStandard;
        uint256 k;
        string name;
        address tokenAddress;
    }

    TokenStruct private standard;
    address[] public swaps;

    mapping(address => Pair) public pairs;

    constructor(address standardToken, string memory standardName) {
        standard = TokenStruct({
            token: IERC20(standardToken),
            name: standardName,
            tokenAddress: standardToken
        });
    }

    event TokenAdded(
        address indexed token,
        string name,
        address indexed tokenAddress
    );

    function addPair(address tokenAddress, string memory tokenName) external {
        require(
            tokenAddress != standard.tokenAddress,
            "Can't create swap for standard token with standard token"
        );

        Pair memory newPair = Pair({
            token: IERC20(tokenAddress),
            name: tokenName,
            reserve: 0,
            reserveStandard: 0,
            k: 0,
            tokenAddress: tokenAddress
        });

        pairs[tokenAddress] = newPair;
        swaps.push(tokenAddress);

        emit TokenAdded(tokenAddress, tokenName, tokenAddress);
    }

    event LiquidityAdded(
        address indexed token,
        uint256 amount,
        uint256 standardAmount
    );

    function addLiquidity(
        address token,
        uint256 amount,
        uint256 standardAmount
    ) external {
        Pair storage pair = pairs[token];

        require(pair.tokenAddress != address(0), "Swap not created");
        pair.token.transferFrom(msg.sender, address(this), amount);
        standard.token.transferFrom(msg.sender, address(this), standardAmount);

        pair.reserveStandard += standardAmount;
        pair.reserve += amount;
        pair.k = pair.reserve * pair.reserveStandard;

        emit LiquidityAdded(token, amount, standardAmount);
    }

    event TokensBuy(address indexed token, uint256 amount);

    function buy(address token, uint256 amount) external {
        Pair storage pair = pairs[token];

        require(
            pair.token.allowance(msg.sender, address(this)) >= amount,
            "Please approve allowances"
        );
        pair.token.transferFrom(msg.sender, address(this), amount);

        uint256 reserveA = pair.reserve;
        uint256 reserveB = pair.reserveStandard;
        uint256 k = pair.k;

        uint256 newReserveA = reserveA + amount;
        uint256 newReserveB = k / newReserveA;

        uint256 amountOut = reserveB - newReserveB;

        standard.token.transfer(msg.sender, amountOut);

        pair.reserve = newReserveA;
        pair.reserveStandard = newReserveB;
        pair.k = newReserveA * newReserveB;

        emit TokensBuy(token, amount);
    }

    event TokensSell(address indexed token, uint256 amount);
    
    function sell(address token, uint256 amount) external {
        Pair storage pair = pairs[token];
        require(
            allowance(msg.sender, address(this)) >= amount,
            "Please approve allowances"
        );
        transferFrom(msg.sender, address(this), amount);
        uint256 reserveA = pair.reserve;
        uint256 reserveB = pair.reserveStandard;
        uint256 k = pair.k;

        uint256 newReserveB = reserveB + amount;
        uint256 newReserveA = k / newReserveB;

        uint256 amountOut = reserveA - newReserveA;

        pair.token.transfer(msg.sender, amountOut);

        pair.reserve = newReserveA;
        pair.reserveStandard = newReserveB;
        pair.k = newReserveA * newReserveB;

        emit TokensSell(token, amount);
    }
}
