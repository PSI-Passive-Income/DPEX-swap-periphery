import { Wallet, Contract, providers } from 'ethers'
import { deployContract } from 'ethereum-waffle'

import { expandTo18Decimals } from './utilities'

import { DPexRouter, IBEP20, IWETH } from '../../typechain'
import { DPexFactory, IDPexPair } from '@passive-income/dpex-swap-core/typechain'

import DPexFactoryAbi from '@passive-income/dpex-swap-core/artifacts/contracts/DPexFactory.sol/DPexFactory.json'
import IDPexPairAbi from '@passive-income/dpex-swap-core/artifacts/contracts/interfaces/IDPexPair.sol/IDPexPair.json'

import ERC20Abi from '../../artifacts/contracts/test/ERC20.sol/ERC20.json'
import WETH9Abi from '../../artifacts/contracts/test/WETH9.sol/WETH9.json'
import DPexRouterAbi from '../../artifacts/contracts/DPexRouter.sol/DPexRouter.json'

const overrides = {
  gasLimit: 9999999
}

interface V2Fixture {
  token0: IBEP20
  token1: IBEP20
  WETH: IWETH
  WETHPartner: IBEP20
  factory: DPexFactory
  router: DPexRouter
  pair: IDPexPair
  WETHPair: IDPexPair
}

export async function v2Fixture([wallet]: Wallet[], provider: providers.Web3Provider): Promise<V2Fixture> {
  // deploy tokens
  const tokenA = await deployContract(wallet, ERC20Abi, [expandTo18Decimals(10000)], overrides) as IBEP20
  const tokenB = await deployContract(wallet, ERC20Abi, [expandTo18Decimals(10000)], overrides) as IBEP20
  const WETH = await deployContract(wallet, WETH9Abi, [], overrides) as IWETH
  const WETHPartner = await deployContract(wallet, ERC20Abi, [expandTo18Decimals(10000)], overrides) as IBEP20

  // deploy V2
  const factory = await deployContract(wallet, DPexFactoryAbi, [wallet.address], overrides) as DPexFactory

  // deploy routers
  const router = await deployContract(wallet, DPexRouterAbi, [factory.address, WETH.address, factory.address], overrides) as DPexRouter

  // initialize V2
  await factory.createPair(tokenA.address, tokenB.address)
  const pairAddress = await factory.getPair(tokenA.address, tokenB.address)
  const pair = new Contract(pairAddress, JSON.stringify(IDPexPairAbi.abi), provider).connect(wallet) as IDPexPair
 
  const token0Address = await pair.token0()
  const token0 = tokenA.address === token0Address ? tokenA : tokenB
  const token1 = tokenA.address === token0Address ? tokenB : tokenA

  await factory.createPair(WETH.address, WETHPartner.address)
  const WETHPairAddress = await factory.getPair(WETH.address, WETHPartner.address)
  const WETHPair = new Contract(WETHPairAddress, JSON.stringify(IDPexPairAbi.abi), provider).connect(wallet) as IDPexPair

  return {
    token0,
    token1,
    WETH,
    WETHPartner,
    factory,
    router: router,
    pair,
    WETHPair
  }
}
