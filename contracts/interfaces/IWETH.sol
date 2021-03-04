// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.7.4;

import '@passive-income/dpex-swap-core/contracts/interfaces/IBEP20.sol';

interface IWETH is IBEP20 {
    function deposit() external payable;
    function withdraw(uint) external;
}
