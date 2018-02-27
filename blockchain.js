var Web3 = require('web3');
var fs = require('fs');
var solc = require('solc');
var EventedArray = require('array-events');
var Promise = require('promise');
var waitUntil = require('wait-until');

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

function getTribeList() {

}

function createTribe(newTribeName) {
    console.log('createTribe: ENTER');

    var contractInstance = blockchainObject.ContractClass.at(blockchainObject.ContractAddress);

    contractInstance.createTribe({ from: blockchainObject.web3Instance.eth.coinbase, tribeName: newTribeName }, function(err, res) {
        if (err) {
            console.log('createTribe: Call failed for ' + blockchainObject.contractName + ' -> ' + err);
        } else {
            console.log('createTribe: Call to createTribe is OK for ' + blockchainObject.contractName);
            console.log('createTribe: Result -> ' + res);
        }
    })

    console.log('createTribe: LEAVE');
    return {tribeList: [
        {tribeID: 1, tribeName: newTribeName}
    ]}
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
blockchainObject.GetTribeList = function() {
    return {tribeList: [
        {tribeID: 1, tribeName: 'Tribe1'},
        {tribeID: 2, tribeName: 'Tribe2'},
        {tribeID: 3, tribeName: 'Tribe3'}
    ]};
}
blockchainObject.CreateNewTribe = function(newTribeName) {
    console.log('BCJS - CreateNewTribe: Adding new Tribe' + newTribeName);
    var tribeList = createTribe(newTribeName);
    console.log('BCJS - CreateNewTribe: New tribe added ' + newTribeName);
    return tribeList;
}

module.exports = blockchainObject;