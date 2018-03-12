var Web3 = require('web3');
var fs = require('fs');
var solc = require('solc');
var EventedArray = require('array-events');
var Promise = require('promise');
var waitUntil = require('wait-until');
var crypto = require('crypto');

var isLocalBlockchain = true;
var localBlockchainUrl = 'http://localhost:8545';
var remoteBlockchainUrl = 'https://blabla.azure.net:8545'; // Clearly needs to be updated
var defaultGas = 1000000;
var smartContractFolder = './contracts';

function getBlockchainUrl() {
    if (isLocalBlockchain)
        return localBlockchainUrl;
    else
        return remoteBlockchainUrl;
}

var blockchainObject = new Object();
blockchainObject.IsContractDeployed = false;
blockchainObject.ContractName = '';
blockchainObject.ContractClass = '';
blockchainObject.ContractAddress = '';
blockchainObject.ContractTransactionHash = '';
blockchainObject.web3Instance = new Web3(new Web3.providers.HttpProvider(getBlockchainUrl()));

// function testContact(){
//     console.log('testContract: ENTER');
//     var testInstance = contractClass.at(contractAddress);

//     var testCallback = function(err, res) {
//         if (err) {
//             console.log('testContract: Test call failed for ' + contractName + ' -> ' + err);
//             reject(err);
//         } else {
//             console.log('testContract: Test call to testIsAlive is OK for ' + contractName);
//             console.log('testContract: Result -> ' + res);
//             fulfill(res);
//         }
//     }

//     // We assume that call contract have a method called: testIsAlive
//     testInstance.testIsAlive({ from: blockchainObject.web3Instance.eth.coinbase }, testCallback );
// }


function testContract() {
    console.log('testContract: ENTER');
    if(blockchainObject.IsContractDeployed) {
        var contractInstance = blockchainObject.ContractClass.at(blockchainObject.ContractAddress);
        // We assume that call contract have a method called: testIsAlive   
        var result = contractInstance.testIsAlive({ from: blockchainObject.web3Instance.eth.coinbase });
        console.log('testContract: LEAVE - Result: ' + result);
        return result;
    } else {
        return false;
    }
}

function prepareSmartContract() {
    console.log('prepareSmartContract: ENTER');

    blockchainObject.IsContractDeployed = false;
    blockchainObject.ContractAddress = '';

    var fileList = fs.readdirSync(smartContractFolder);
    for (var i = 0; i < fileList.length; i++) {
        if (fileList[i].indexOf('.sol') > 0) {
            console.log('prepareSmartContract: Processing: ' + fileList[i]);
            var contractFile = fs.readFileSync(smartContractFolder + '/' + fileList[i]);
            console.log('prepareSmartContract: Contract read from file');
            var compiledContract = solc.compile(contractFile.toString(), 1);

            if (compiledContract.errors === undefined) {
                console.log('prepareSmartContract: Contract compiled OK with solc version ' + solc.version());

                // We are now making the STRONG assumption that the contract name is the name of the .sol file
                var contractName = fileList[i].replace('.sol', '');
                blockchainObject.ContractName = contractName;
                console.log('prepareSmartContract: Processing contract: ' + contractName);

                var bytecode = compiledContract.contracts[':' + contractName].bytecode;
                console.log('prepareSmartContract: Processed bytecode');
                var abi = JSON.parse(compiledContract.contracts[':' + contractName].interface);
                console.log('prepareSmartContract: Processed ABI');
                var contractClass = blockchainObject.web3Instance.eth.contract(abi);
                blockchainObject.ContractClass = contractClass;
                console.log('prepareSmartContract: Contract class created');

                var instanceCreationCallback = function(err, res) {
                    if (err) {
                        console.log('prepareSmartContract: Contract instance could not be created: ' + err);
                    } else {
                        // Log the tx, you can explore status with eth.getTransaction()
                        console.log('prepareSmartContract: Contract instance hash: ' + res.transactionHash);
                        blockchainObject.ContractTransactionHash = res.transactionHash;

                        // If we have an address property, the contract was deployed
                        if (res.address) {
                            console.log('prepareSmartContract: Contract deployed SUCCESSFULLY!');
                            console.log('prepareSmartContract: Contract instance address: ' + res.address);
                            blockchainObject.ContractAddress = res.address;
                            blockchainObject.IsContractDeployed = true;
                        } else {
                            console.log('prepareSmartContract: Awaiting deployment confirmation...');
                        }
                    }
                };

                var contractInstance = contractClass.new({
                    data: '0x' + bytecode,
                    from: blockchainObject.web3Instance.eth.coinbase,
                    gas: defaultGas * 2
                }, instanceCreationCallback);

                // var contractInstance = contractClass.new({
                //     data: '0x' + bytecode,
                //     from: blockchainObject.web3Instance.eth.coinbase,
                //     gas: defaultGas * 2
                // });

                waitUntil().interval(500).times(50).condition(function() {
                    return blockchainObject.ContractAddress.length == 0;
                }).done(function(result) {
                    return;
                });

            } else {
                console.log('prepareSmartContract: Contract DID NOT compile OK with solc version ' + solc.version());
                console.log('prepareSmartContract: Error(s): ' + compiledContract.errors);
            }
        }
    }
}

/********************************************************************************** */
/*** API Calls ***/
/********************************************************************************** */
blockchainObject.GetBlockchainUrl = function () {
    var blockchainUrl = getBlockchainUrl();
    console.log('API - BlockchainUrl: ' + blockchainUrl);
    return blockchainUrl;
}
blockchainObject.IsBlockchainRunning = function () {
    var isRunning = blockchainObject.web3Instance.isConnected();
    console.log('API - IsBlockchainRunning: ' + isRunning);
    return isRunning;
}
blockchainObject.DeployContract = function () {
    console.log('BCJS - DeployContracts: Checking Blockchain available...');
    if (blockchainObject.IsBlockchainRunning()) {
        console.log('BCJS - DeployContract: Blockchain is OK on ' + getBlockchainUrl());
        prepareSmartContract();
        console.log('BCJS - DeployContract completed!');
        return blockchainObject.GetInformation();
    } else {
        console.log('BCJS - DeployContract: Could not connect to Blockchain on ' + getBlockchainUrl);
        console.log('BCJS - DeployContract: Nothing further to do. App will not work');
        return blockchainObject.GetInformation();
    }
}
blockchainObject.GetInformation = function () {
    console.log('API - GetInformation: retrieving information for: ' + blockchainObject.ContractName + ' on '+ blockchainObject.GetBlockchainUrl());
    return {
        BCUrl: getBlockchainUrl(),
        BCIsRunning: blockchainObject.IsBlockchainRunning(),
        BCContractDeployed: blockchainObject.IsContractDeployed,
        BCContractName: blockchainObject.ContractName,
        BCContractAddress: blockchainObject.ContractAddress,
        BCContractTransactionHash: blockchainObject.ContractTransactionHash
    };
}
blockchainObject.TestContract = function() {
    console.log('BCJS - TestContract: Test for ' + blockchainObject.ContractName + ' on '+ getBlockchainUrl());
    var result = testContract();
    console.log('BCJS - TestContract: Call back results -> ' + result);
    return {
        TestResult: result            
    };
}
 /* FAKE CALLS */

 /* Common */
function getRandomWei() {
    return (Math.floor(Math.random() * Math.floor(1000)) / 10000) + ' wei';
}
function getRamdomHash() {
    return crypto.randomBytes(20).toString('hex');
}

/* User Types */
var localUserTypeList = {
    objectList: [],
    transactionHash: getRamdomHash(),
    gasPrice: getRandomWei()
};
localUserTypeList.objectList.push({ objectID: getRamdomHash(), objectName: 'System Administrator' });
localUserTypeList.objectList.push({ objectID: getRamdomHash(), objectName: 'Project Manager' });
localUserTypeList.objectList.push({ objectID: getRamdomHash(), objectName: 'Project Superintendent of tribe' });
localUserTypeList.objectList.push({ objectID: getRamdomHash(), objectName: 'Local Bio Diversity Stewards of tribe' });
localUserTypeList.objectList.push({ objectID: getRamdomHash(), objectName: 'Local Community Stewards of tribe' });

blockchainObject.GeUserTypeList = function() {
    console.log('BCJS - GeUserTypeList: ' + localTribeList.objectList.length);
    return localUserTypeList;
}
blockchainObject.GetUserTypeByID = function(objectID) {
    console.log('BCJS - GetUserTypeByID: ' + objectID);
    var result = {
        objectList: [],
        transactionHash: getRamdomHash(),
        gasPrice: getRandomWei()
    };
    var selectedUserType = {
        objectID: -1,
        objectName: 'NOT FOUND'
    };
    var list = blockchainObject.GeUserTypeList();
    for(var i=0; i<list.objectList.length; i++) {
        var curUserType = list.objectList[i];
        if(curUserType.objectID.toString() == objectID) {
            selectedUserType = curUserType;
        }
    }
    result.objectList.push(selectedUserType);
    console.log('BCJS - GetUserTypeByID: Found ' + objectID);
    return result;
}
/* Tribes */
var localTribeList = {
    objectList: [],
    transactionHash: getRamdomHash(),
    gasPrice: getRandomWei()
};
blockchainObject.GetTribeList = function() {
    console.log('BCJS - GetTribeList: ' + localTribeList.objectList.length);
    return localTribeList;
}
blockchainObject.GetTribeByID = function(objectID) {
    console.log('BCJS - GetTribeByID: ' + objectID);
    var result = {
        objectList: [],
        transactionHash: getRamdomHash(),
        gasPrice: getRandomWei()
    };
    var selectedTribe = {
        objectID: -1,
        objectName: 'NOT FOUND',
        tribeLocation: 'NOT FOUND',
        tribePopulation: 'NOT FOUND',
        tribeArea: 'NOT FOUND'
    };
    var list = blockchainObject.GetTribeList();
    for(var i=0; i<list.objectList.length; i++) {
        var curTribe = list.objectList[i];
        if(curTribe.objectID.toString() == objectID) {
            selectedTribe = curTribe;
        }
    }
    result.objectList.push(selectedTribe);
    console.log('BCJS - GetTribeByID: Found ' + objectID);
    return result;
}
blockchainObject.CreateNewTribe = function(body) {
    console.log('BCJS - CreateNewTribe: Adding new Tribe ' + body.objectName);
    var list = blockchainObject.GetTribeList();
    list.objectList.push(
        {
            objectID: getRamdomHash(),
            objectName: body.objectName,
            tribeLocation: body.tribeLocation,
            tribePopulation: body.tribePopulation,
            tribeArea: body.tribeArea
        });
        list.transactionHash = getRamdomHash();
        list.gasPrice = getRandomWei();
    console.log('BCJS - CreateNewTribe: New tribe added ' + body.objectName);
    return list;
}
blockchainObject.UpdateTribe = function(body) {
    console.log('BCJS - UpdateTribe: Updating Tribe ' + body.objectName);
    var list = blockchainObject.GetTribeList();
    for(var i=0; i<list.objectList.length; i++) {
        var curTribe = list.objectList[i];
        if(curTribe.objectID.toString() == body.objectID) {
            list.objectList[i].objectName = body.objectName;
            list.objectList[i].tribeLocation = body.tribeLocation;
            list.objectList[i].tribePopulation = body.tribePopulation;
            list.objectList[i].tribeArea = body.tribeArea;
            break;
        }
    }
    list.transactionHash = getRamdomHash();
    list.gasPrice = getRandomWei();
    console.log('BCJS - UpdateTribe: Tribe updated ' + body.objectName);
    return list;
}
blockchainObject.DeleteTribe = function(objectID) {
    console.log('BCJS - DeleteTribe: Deleting Tribe ' + objectID);
    var list = blockchainObject.GetTribeList();
    for(var i=0; i<list.objectList.length; i++) {
        var curTribe = list.objectList[i];
        if(curTribe.objectID.toString() == objectID) {
            list.objectList.splice(i,1);
            break;
        }
    }
    list.transactionHash = getRamdomHash();
    list.gasPrice = getRandomWei();
    console.log('BCJS - DeleteTribe: Tribe deleted ' + objectID);
    return list;
}

/* Users */
var localUserList = {
    objectList: [],
    transactionHash: getRamdomHash(),
    gasPrice: getRandomWei()
};
blockchainObject.GetUserList = function() {
    console.log('BCJS - GetUserList: ' + localUserList.objectList.length);
    return localUserList;
}
blockchainObject.GetUserByID = function(objectID) {
    console.log('BCJS - GetUserByID: ' + objectID);
    var result = {
        objectList: [],
        transactionHash: getRamdomHash(),
        gasPrice: getRandomWei()
    };
    var selectedUser = {
        objectID: -1,
        objectName: 'NOT FOUND',
        userEmail: 'NOT FOUND',
        userPassword: 'NOT FOUND',
        userMobile: 'NOT FOUND',
        userTypeID: 'NOT FOUND',
        tribeID: 'NOT FOUND'
    };
    var list = blockchainObject.GetUserList();
    for(var i=0; i<list.objectList.length; i++) {
        var curUser = list.objectList[i];
        if(curUser.objectID.toString() == objectID) {
            selectedUser = curUser;
        }
    }
    result.objectList.push(selectedUser);
    console.log('BCJS - GetUserByID: Found ' + objectID);
    return result;
}
blockchainObject.CreateNewUser = function(body) {
    console.log('BCJS - CreateNewUser: Adding new User ' + body.objectName);
    var list = blockchainObject.GetUserList();
    list.objectList.push(
        {
            objectID: getRamdomHash(),
            objectName: body.objectName,
            userEmail: body.userEmail,
            userPassword: body.userPassword,
            userMobile: body.userMobile,
            userTypeID: body.userTypeID,
            tribeID: body.tribeID
        });
        list.transactionHash = getRamdomHash();
        list.gasPrice = getRandomWei();
    console.log('BCJS - CreateNewUser: New User added ' + body.objectName);
    return list;
}
blockchainObject.UpdateUser = function(body) {
    console.log('BCJS - UpdateUser: Updating User ' + body.objectName);
    var list = blockchainObject.GetUserList();
    for(var i=0; i<list.objectList.length; i++) {
        var curUser = list.objectList[i];
        if(curUser.objectID.toString() == body.objectID) {
            list.objectList[i].objectName = body.objectName;
            list.objectList[i].userEmail = body.userEmail;
            list.objectList[i].userPassword = body.userPassword;
            list.objectList[i].userMobile = body.userMobile;
            list.objectList[i].userTypeID = body.userTypeID;
            list.objectList[i].tribeID = body.tribeID;
            break;
        }
    }
    list.transactionHash = getRamdomHash();
    list.gasPrice = getRandomWei();
    console.log('BCJS - UpdateUser: User updated ' + body.objectName);
    return list;
}
blockchainObject.DeleteUser = function(objectID) {
    console.log('BCJS - DeleteUser: Deleting User ' + objectID);
    var list = blockchainObject.GetUserList();
    for(var i=0; i<list.objectList.length; i++) {
        var curUser = list.objectList[i];
        if(curUser.objectID.toString() == objectID) {
            list.objectList.splice(i,1);
            break;
        }
    }
    list.transactionHash = getRamdomHash();
    list.gasPrice = getRandomWei();
    console.log('BCJS - DeleteUser: User deleted ' + objectID);
    return list;
}

/* Export */
module.exports = blockchainObject;