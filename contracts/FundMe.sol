// Get funds from users
// Withdraw funds
// Set a minimum funding value

// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.18;

import "./PriceConverter.sol";

error FundMe__NotOwner();

contract FundMe {
    using PriceConverter for uint256;

    uint256 public constant MINIMUM_USD = 50 * 1e18;

    address[] public funders;
    mapping(address => uint256) public addressToAmountFunded;

    address public immutable i_owner;

    AggregatorV3Interface public priceFeed;

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function fund() public payable {
        require(
            msg.value.getConversionRate(priceFeed) >= MINIMUM_USD,
            "Didn't Send enough"
        );
        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] = msg.value;
    }

    function withdraw() public onlyOwner {
        // require(msg.sender == owner, "Sender is not a Owner!");
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }
        //reset the array
        funders = new address[](0);

        //transfer
        //payable(msg.sender).transfer(address(this).balance);
        //send
        //    bool sendSuccess = payable(msg.sender).send(address(this).balance);
        //    require(sendSuccess, "Send fail");
        // call
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    // function cheaperWithdraw() public payable onlyOwner{
    //     address[] memory funders = funders;
    //     for (
    //         uint256 funderIndex = 0;
    //         funderIndex < funders.length;
    //         funderIndex++
    //     ) {
    //         address funder = funders[funderIndex];
    //         addressToAmountFunded[funder] = 0;
    //     }
    //     funders = new address[](0);
    //     (bool callSuccess, ) = payable(msg.sender).call{
    //         value: address(this).balance
    //     }("");
    //     require(callSuccess, "Call failed");

    // }

    modifier onlyOwner() {
        // require(msg.sender == i_owner, "Sender is not a Owner!");
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return funders[index];
    }
    
    function getAddressToAmountFunded(address funder) public view returns (uint256) {
        return addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return priceFeed;
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }
}
