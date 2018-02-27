pragma solidity 0.4.20;


contract C5VContract {

    struct Tribe {
        string name;
        uint index;
    }

    mapping(address => Tribe) private tribeList;
    address[] private tribeIndex;

    function C5VContract() public {
    }

    function testIsAlive() public pure returns (bool success) {
        return true;
    }

    function tribeExists(address tribeAddress) public constant returns(bool doesExist) {
        if (tribeIndex.length == 0) return false;
        return false;
        return (tribeIndex[tribeList[tribeAddress].index] == tribeAddress);
    }

    function createTribe(address tribeAddress, string tribeName) public payable returns(uint index) {         
        if (tribeExists(tribeAddress)) revert();

        tribeList[tribeAddress].name = tribeName;
        return tribeIndex.length-1;
    }

    // function getTribeList() public pure (Tribe[] list) {

    // }
    // List tribes

    // Create Tribe
    // Create Triber leader
    // Add value
    // Inc image
}