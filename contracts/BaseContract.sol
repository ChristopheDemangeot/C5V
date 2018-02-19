/**
Base contract implementation and using inheritance to support this
https://ethereumdev.io/inheritance-in-solidity/
 */

pragma solidity ^0.4.17;


contract BaseContract {

    function BaseContract() public {
    }

    function testIsAlive() public pure returns (bool success) {
        return true;
    }
}