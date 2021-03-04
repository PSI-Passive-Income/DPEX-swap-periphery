// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.7.4;

import "./IDPexRouter02.sol";
// import "./IGovernable.sol";

interface IDPexRouter is IDPexRouter02 {
    function feeAggregator() external returns (address);

    function setfeeAggregator(address aggregator) external;
    function setRouter(address _router) external;
    function swapAggregatorToken(
        uint amountIn,
        address[] calldata path,
        address to
    ) external returns (uint256);
}