const { network } = require("hardhat");
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify");
require("dotenv").config()

// const {getNamedAccounts, deployments} =hre;
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    let ethUsdPriceFeedAddress;
    if(developmentChains.includes(network.name)){
        const ethUsdAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    }

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress],
        log: true,
        waitConfirmation: network.config.blockConfirmations || 1
    })
    //verify
    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        await  verify(fundMe.address, [ethUsdPriceFeedAddress]);
    }

    log("-------------------------------------------------------------------")
    //when going for localhost or hardhat network we want to use mock
} 

module.exports.tags =["all", "fundMe"]

