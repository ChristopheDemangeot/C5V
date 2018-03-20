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
var smartContractFolder = './contracts';

// http://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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
blockchainObject.MustUseBlockchain = true;

async function waitBlock(transactionHash) {
    while (true) {
      let receipt = blockchainObject.web3Instance.eth.getTransactionReceipt(transactionHash);
      if (receipt && receipt.contractAddress) {
        blockchainObject.ContractAddress = receipt.contractAddress;
        console.log('prepareSmartContract: Contract deployed SUCCESSFULLY!');
        console.log('prepareSmartContract: Contract instance address: ' + receipt.contractAddress);
        console.log("prepareSmartContract: Smart contract mined!");
        break;
      }
      console.log("prepareSmartContract: Waiting a mined block to include contract... currently in block " + blockchainObject.web3Instance.eth.blockNumber);
      await sleep(1000);
    }
  }

function testContract() {
    console.log('testContract: ENTER');
    if(blockchainObject.IsContractDeployed) {
        var contractInstance = blockchainObject.ContractClass.at(blockchainObject.ContractAddress);
        // We assume that call contract have a method called: testIsAlive   
        var result = contractInstance.isAlive();
        console.log('testContract: LEAVE - Result: ' + result);
        return result;
    } else {
        console.log('testContract: LEAVE - Result: false');
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

                contractInstance = blockchainObject.ContractClass.new({
                    data: '0x' + bytecode,
                    from: blockchainObject.web3Instance.eth.coinbase,
                    gas: 1000000
                });
                console.log('prepareSmartContract: Contract instance created');

                if(contractInstance.transactionHash != undefined) {
                    blockchainObject.ContractTransactionHash = contractInstance.transactionHash;
                    console.log('prepareSmartContract: Contract instance hash: ' + blockchainObject.ContractTransactionHash);
                    waitBlock(blockchainObject.ContractTransactionHash);
                    blockchainObject.IsContractDeployed = true;
                } else {
                    blockchainObject.IsContractDeployed = false;
                }
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

/* EAC Types */
var localEACTypeList = {
    objectList: [],
    transactionHash: getRamdomHash(),
    gasPrice: getRandomWei()
};
localEACTypeList.objectList.push({ objectID: getRamdomHash(), objectName: 'Illegal Logging' });
localEACTypeList.objectList.push({ objectID: getRamdomHash(), objectName: 'Traditional Use' });
localEACTypeList.objectList.push({ objectID: getRamdomHash(), objectName: 'Clearing' });
localEACTypeList.objectList.push({ objectID: getRamdomHash(), objectName: 'PSP Measurement' });
localEACTypeList.objectList.push({ objectID: getRamdomHash(), objectName: 'Climate Monitoring' });
localEACTypeList.objectList.push({ objectID: getRamdomHash(), objectName: 'Fire' });
localEACTypeList.objectList.push({ objectID: getRamdomHash(), objectName: 'Soil Erosion' });

blockchainObject.GetEACTypeList = function() {
    console.log('BCJS - GetEACTypeList: ' + localEACTypeList.objectList.length);
    return localEACTypeList;
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

blockchainObject.GetUserTypeList = function() {
    console.log('BCJS - GeUserTypeList: ' + localUserTypeList.objectList.length);
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
    var list = blockchainObject.GetUserTypeList();
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
    console.log('BCJS - GetTribeList: ENTER');

    if(blockchainObject.MustUseBlockchain) {
        var res = {
            objectList: [],
            transactionHash: getRamdomHash(),
            gasPrice: getRandomWei()
        };
    
        if(blockchainObject.IsContractDeployed) {
            var contractInstance = blockchainObject.ContractClass.at(blockchainObject.ContractAddress);
            // We assume that call contract have a method called: testIsAlive   
            var tribeAddressList = contractInstance.getTribeAddressList();
            var nbTribes = tribeAddressList.length;
            console.log('BCJS - GetTribeList: Number of Tribe addresses found: ' + tribeAddressList.length);
            if(nbTribes > 0) {
                for(var i=0; i<nbTribes; i++) {
                    var curTribe = contractInstance.getTribeByAddress(tribeAddressList[i]);
                    res.objectList.push(
                        {
                            objectID: tribeAddressList[i],
                            objectName: curTribe.name,
                            tribeLocation: 'TODO',
                            tribePopulation: 123,
                            tribeArea: 'TODO'
                        });
                }
            }
        } else {
            console.log('BCJS - GetTribeList: C5VContract not deployed');
        }
        console.log('BCJS - GetTribeList: LEAVE');
        return res;
    } else {
        console.log('BCJS - GetTribeList: ' + localTribeList.objectList.length);
        console.log('BCJS - GetTribeList: LEAVE');
        return localTribeList;
    }
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

    if(blockchainObject.MustUseBlockchain) {
        if(blockchainObject.IsContractDeployed) {
            var contractInstance = blockchainObject.ContractClass.at(blockchainObject.ContractAddress);

            // Create a new account
            var newAccountAddress = blockchainObject.web3Instance.personal.newAccount(body.objectName);
            console.log('BCJS - CreateNewTribe: New account created at ' + newAccountAddress);

            var gasPrice = Number(blockchainObject.web3Instance.eth.gasPrice);
            console.log('BCJS - CreateNewTribe: Gas Price currently at:  ' + gasPrice + ' wei');

            var callGas = Number(contractInstance.createTribe.estimateGas(body.objectName, body.tribeLocation, body.tribePopulation, body.tribeArea));
            console.log('BCJS - CreateNewTribe: Estimated Gas for call:  ' + callGas + ' units');

            var estCostWei = (gasPrice * callGas);
            var estCostEth = blockchainObject.web3Instance.fromWei(estCostWei, 'ether');
            console.log('BCJS - CreateNewTribe: Estimate cost:  ' + estCostWei + ' wei');
            console.log('BCJS - CreateNewTribe: Estimate cost:  ' + estCostEth + ' eth');
            var valueToTransfer = (estCostWei * 2);
            console.log('BCJS - CreateNewTribe: Value to transfer:  ' + valueToTransfer + ' wei');

            // http://www.bullraider.com/ethereum/tutorials/342-understanding-invalid-address-error-in-dapps-or-geth-console
            blockchainObject.web3Instance.personal.unlockAccount(newAccountAddress,body.objectName,100000);
            blockchainObject.web3Instance.eth.sendTransaction({from: blockchainObject.web3Instance.eth.coinbase, to: newAccountAddress, value: valueToTransfer});
            // blockchainObject.web3Instance.eth.defaultAccount = newAccountAddress;

            // Calls the method
            // blockchainObject.web3Instance.eth.defaultAccount = blockchainObject.web3Instance.eth.coinbase;
            var tribeIndex = contractInstance.createTribe(body.objectName, body.tribeLocation, body.tribePopulation, body.tribeArea, {from: newAccountAddress, gasPrice: 10}); // 9M

            console.log('BCJS - CreateNewTribe: New tribe index ' + tribeIndex);
            console.log('BCJS - CreateNewTribe: New tribe added ' + body.objectName);
        } else {
            console.log('BCJS - CreateNewTribe: C5VContract not deployed');
        }
        return blockchainObject.GetTribeList();
    } else {
        localTribeList.objectList.push(
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
        return localTribeList;
    }
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
    localUserList.transactionHash = getRamdomHash();
    localUserList.gasPrice = getRandomWei();
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
    result.transactionHash = getRamdomHash();
    result.gasPrice = getRandomWei();
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

/* Data structure */
var localDataList = {
    objectList: [],
    transactionHash: getRamdomHash(),
    gasPrice: getRandomWei()
};
blockchainObject.GetDataEntryList = function() {
    console.log('BCJS - GetDataEntryList: ' + localDataList.objectList.length);
    localDataList.transactionHash = getRamdomHash();
    localDataList.gasPrice = getRandomWei();
    return localDataList;
}
blockchainObject.CreateNewDataEntry = function(body) {
    console.log('BCJS - CreateNewDataEntry: Adding new Data Entry');
    localDataList.objectList.push(
        {
            objectID: getRamdomHash(),
            userID: body.userID,
            eacTypeID: body.eacTypeID,
            dataDBH: body.dataDBH,
            dataTClass: body.dataTClass,
            dataTCount: body.dataTCount,
            dataTHeight: body.dataTHeight,
            dataTMorality: body.dataTMorality,
            dataTLoc: body.dataTLoc,
            dataGLoc: body.dataGLoc,
            timeStamp: new Date().toISOString()
        });
        localDataList.transactionHash = getRamdomHash();
        localDataList.gasPrice = getRandomWei();
    console.log('BCJS - CreateNewDataEntry: New Data Entry added');
    return localDataList;
}

/* Export */
module.exports = blockchainObject;