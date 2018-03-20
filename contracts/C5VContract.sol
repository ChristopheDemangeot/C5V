pragma solidity ^0.4.21;


contract C5VContract {

    address public contractOwner;

    struct DataEntry {
        address userID;
        string eacTypeID;
        string dataDBH;
        string dataTClass;
        uint dataTCount;
        uint dataTHeight;
        string dataTMorality;
        string dataTLoc;
        string dataGLoc;
        string timeStamp;
    }

    struct Tribe {
        uint index;
        string name;
        string location;
        uint population;
        string area;
        DataEntry[] dataList;
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
                    break;
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
        public payable {
            if (doesTribeExistsByAddress(msg.sender)) revert();
            tribeList[msg.sender].name = tName;
            tribeList[msg.sender].location = tLocation;
            tribeList[msg.sender].population = tPopulation;
            tribeList[msg.sender].area = tArea;
            tribeList[msg.sender].index = tribeAccounts.push(msg.sender)-1;
        }

    function updateTribe(address tAddress, string tName, string tLocation, uint tPopulation, string tArea)
        public payable {
            if (!doesTribeExistsByAddress(tAddress)) revert();
            tribeList[tAddress].name = tName;
            tribeList[tAddress].location = tLocation;
            tribeList[tAddress].population = tPopulation;
            tribeList[tAddress].area = tArea;
        }

    function deleteTribe(address tAddress)
        public payable {
            if (!doesTribeExistsByAddress(tAddress)) revert();
            for (uint index = 0; index < tribeAccounts.length; index++) {
                if (tribeAccounts[index] == tAddress) {
                    delete tribeList[tAddress];
                    delete tribeAccounts[index];
                    break;
                }
            }
        }

    function getTribeAddressList()
        public view
        returns(address[]) {
            return tribeAccounts;
        }

    function getTribeByAddress(address tAddress)
        public view
        returns(uint, string, string, uint, string) {
            if (!doesTribeExistsByAddress(tAddress)) revert(); 
            return (tribeList[tAddress].index, tribeList[tAddress].name,
                tribeList[tAddress].location, tribeList[tAddress].population, tribeList[tAddress].area);
        }
}