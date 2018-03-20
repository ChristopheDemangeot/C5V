pragma solidity ^0.4.19;


contract C5VContract {

    address public contractOwner;

    struct Tribe {
        uint index;
        string name;
        string location;
        uint population;
        string area;
    }

    mapping(address => Tribe) private tribeList;
    address[] private tribeAccounts;

    function C5VContract() public {
        contractOwner = msg.sender;
    }

    function isAlive()
        public pure
        returns (bool success) {
            return true;
        }

    function areStringsEqual (string a, string b)
        public pure
        returns (bool) {
            return keccak256(a) == keccak256(b);
        }

    function getTribeCount()
        public constant
        returns(uint count) {
            return tribeAccounts.length;
        }

    function doesTribeExistsByName(string tName)
        public view
        returns(bool) {
            if (tribeAccounts.length == 0) return false;
            bool exists = false;
            for (uint index = 0; index < tribeAccounts.length; index++) {
                if (areStringsEqual(tribeList[tribeAccounts[index]].name, tName)) {
                    exists = true;
                }
            }
            return exists;
        }

    function doesTribeExistsByAddress(address tAddress)
        public view
        returns(bool) {
            if (tribeAccounts.length == 0) return false;
            return (tribeAccounts[tribeList[tAddress].index] == tAddress);
        }

    function createTribe(string tName, string tLocation, uint tPopulation, string tArea)
        public payable
        returns(uint) {
            // if (doesTribeExistsByAddress(msg.sender)) revert();
            tribeList[msg.sender].name = tName;
            tribeList[msg.sender].location = tLocation;
            tribeList[msg.sender].population = tPopulation;
            tribeList[msg.sender].area = tArea;
            tribeList[msg.sender].index = tribeAccounts.push(msg.sender)-1;
            return tribeAccounts.length-1;
        }

    function getTribeAddressList()
        public view
        returns(address[]) {
            return tribeAccounts;
        }

    // function getTribeList()
    //     public view
    //     returns(Tribe[]) {
    //         return tribeAccounts;
    //     }

    function getTribeByAddress(address tAddress)
        public constant
        returns(uint, string) {
            if (!doesTribeExistsByAddress(tAddress)) revert(); 
            return (tribeList[tAddress].index, tribeList[tAddress].name);
        }

    function getTribeByIndex(uint index)
        public constant
        returns(uint, string) {
            return (tribeList[tribeAccounts[index]].index, tribeList[tribeAccounts[index]].name);
        }
}