const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat")

describe("FundMe", async () => {
    let fundMe, deployer, mockV3Aggregator;
    const sendValue = ethers.utils.parseEther("1") //1 eth
    beforeEach(async () => {
        // const accounts = await ethers.getSigners()
        // deployer = accounts[0]
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )

    })

    describe("constructor", async function () {
        it("set the Aggregator addresses correctly", async () => {
            const response = await fundMe.priceFeed();
            assert.equal(response, mockV3Aggregator.address);
        })
    })

    describe("fund", async () => {
        it("Fails if you don't send enough Ethers", async () => {
            await expect(fundMe.fund()).to.be.revertedWith("Didn't Send enough")
        })
        it("updated the amount funded data structure", async () => {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.addressToAmountFunded(deployer);
            assert.equal(response.toString(), sendValue.toString())
        })
        it("Adds funders to array of funders", async () => {
            await fundMe.fund({ value: sendValue });
            const funder = await fundMe.funders(0);
            assert.equal(funder, deployer)
        })
    })

    describe("withdraw", async () => {
        beforeEach(async () => {
            await fundMe.fund({ value: sendValue })
        })

        it("withdraw ETH from a single founder", async () => {
            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
            const startingDeployerBalance = await fundMe.provider.getBalance(deployer);

            const transactionResponse = await fundMe.withdraw();
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt;
            const gasCost = gasUsed.mul(effectiveGasPrice);  

            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);

            const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

            assert.equal(endingFundMeBalance, 0);
            assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())
        })
        it("allows us to withdraw with multiple funders", async () =>{
            const accounts = await ethers.getSigners()
            for(let i = 1; i<6; i++){
                const FundMeConnectedContract = await fundMe.connect(accounts[i]);
                await FundMeConnectedContract.fund({value: sendValue});
            }
            
            const a = 1;
            
            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
            const startingDeployerBalance = await fundMe.provider.getBalance(deployer);
            
            const transactionResponse = await fundMe.withdraw();
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt;
            const gasCost = gasUsed.mul(effectiveGasPrice);  

            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);

            const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

            assert.equal(endingFundMeBalance, 0);
            assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())

            await expect(fundMe.funders(0)).to.be.reverted;

            for (i= 1; i<6; i++){
                assert.equal(await fundMe.addressToAmountFunded(accounts[1].address), 0);
            }

        })
        it("Only allows the owner to withdraw", async () => {
            const accounts = await ethers.getSigners();
            const attacker = accounts[1];
            const attackerConnectedContract = await fundMe.connect(attacker);
            await expect(attackerConnectedContract.withdraw()).to.be.reverted;

        })
    })
}) 