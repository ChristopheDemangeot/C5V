var Web3 = require('web3');
var fs = require('fs');
var solc = require('solc');
var EventedArray = require('array-events');
var Promise = require('promise');

var isLocalBlockchain = true;
var localBlockchainUrl = 'http://localhost:8545';
var remoteBlockchainUrl = 'https://blabla.azure.net:8545'; // Clearly needs to be updated
var defaultGas = 90000;
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
blockchainObject.ContractArray = new EventedArray();
blockchainObject.ContractArray.on('add', function (event) {
    console.log('|----> New contract READY: ' + event.ContractName + ' at ' + event.ContractAddress);
});

function testContract(contractName, contractType, contractAddress) {
    // Reference to the deployed contract
    var testInstance = contractType.at(contractAddress);

    // We assume that call contract have a method called: testIsAlive
    testInstance.testIsAlive({ from: blockchainObject.web3Instance.eth.coinbase }, (err, res) => {
        if (err) {
            console.log('|----> Test call failed for ' + contractName + ': ' + err);
            return false;
        } else {
            console.log('|----> Test call to testIsAlive is OK for ' + contractName);
            console.log('|------> Result: ' + res);
            blockchainObject.ContractArray.push({ 'ContractName': contractName, 'ContractAddress': contractAddress });
            return true;
        }
    });

    // Call the transfer function - old test code based on .ref Contract
    // token.transfer(dest_account, 100, {from: web3.eth.coinbase}, (err, res) => {
    //     // Log transaction, in case you want to explore
    //     console.log('tx: ' + res);
    //     // Assert destination account balance, should be 100 
    //     const balance2 = token.balances.call(dest_account);
    //     console.log(balance2 == 100);
    // });
}

function prepareSmartContracts(fulfill, reject) {
    blockchainObject.IsContractDeployed = false;

    var fileList = fs.readdirSync(smartContractFolder);
    for (var i = 0; i < fileList.length; i++) {
        if (fileList[i].indexOf('.sol') > 0) {
            console.log('|--> Processing: ' + fileList[i]);
            var contractFile = fs.readFileSync(smartContractFolder + '/' + fileList[i]);
            console.log('|----> Contract read from file');
            var compiledContract = solc.compile(contractFile.toString(), 1);

            if (compiledContract.errors === undefined) {
                console.log('|----> Contract compiled OK with solc version ' + solc.version());

                // We are now making the STRONG assumption that the contract name is the name of the .sol file
                var contractName = fileList[i].replace('.sol', '');
                blockchainObject.ContractName = contractName;
                console.log('|----> Processing contract: ' + contractName);

                var bytecode = compiledContract.contracts[':' + contractName].bytecode;
                console.log('|----> Processed bytecode');
                var abi = JSON.parse(compiledContract.contracts[':' + contractName].interface);
                console.log('|----> Processed ABI');
                var contractClass = blockchainObject.web3Instance.eth.contract(abi);
                blockchainObject.ContractClass = contractClass;
                console.log('|----> Contract class created');

                var instanceCreationCallback = function(err, res) {
                    if (err) {
                        console.log('|----> Contract instance could not be created: ' + err);
                        reject(err);
                    } else {
                        // Log the tx, you can explore status with eth.getTransaction()
                        console.log('|----> Contract instance hash: ' + res.transactionHash);
                        blockchainObject.ContractTransactionHash = res.transactionHash;

                        // If we have an address property, the contract was deployed
                        if (res.address) {
                            console.log('|----> Contract deployed SUCCESSFULLY!');
                            console.log('|----> Contract instance address: ' + res.address);
                            blockchainObject.ContractAddress = res.address;
                            blockchainObject.IsContractDeployed = true;
                            fulfill();
                        } else {
                            console.log('|----> Awaiting deployment confirmation...');
                        }
                    }
                };

                var contractInstance = contractClass.new({
                    data: '0x' + bytecode,
                    from: blockchainObject.web3Instance.eth.coinbase,
                    gas: defaultGas * 2
                }, instanceCreationCallback);

            } else {
                console.log('|----> Contract DID NOT compile OK with solc version ' + solc.version());
                console.log('|----> Error(s): ' + compiledContract.errors);
                reject(compiledContract.errors);
            }
        }
    }
}

blockchainObject.BlockchainUrl = function () {
    return getBlockchainUrl();
}
blockchainObject.IsBlockchainRunning = function () {
    return blockchainObject.web3Instance.isConnected();
}
blockchainObject.DeployContracts = function () {
    console.log('DEPLOY: Checking Blockchain available...');
    if (blockchainObject.IsBlockchainRunning()) {
        console.log('DEPLOY: Blockchain is OK on ' + blockchainObject.BlockchainUrl());

        var promisePrepareSmartContracts = new Promise(function (fulfill, reject) {
            prepareSmartContracts(fulfill, reject);
        });

        return promisePrepareSmartContracts.done(function (err) {
            console.log('DEPLOY: Call back results ->' + err);
            return blockchainObject.GetInformation();
        });
    } else {
        console.log('DEPLOY: Could not connect to Blockchain on ' + blockchain.BlockchainUrl());
        console.log('DEPLOY: Nothing further to do. App will not work');
        return blockchainObject.GetInformation();
    }
}
blockchainObject.GetInformation = function () {
    return {
        BCUrl: getBlockchainUrl(),
        BCIsRunning: blockchainObject.IsBlockchainRunning(),
        BCContractDeployed: blockchainObject.IsContractDeployed,
        BCContractName: blockchainObject.ContractName,
        BCContractAddress: blockchainObject.ContractAddress,
        BCContractTransactionHash: blockchainObject.ContractTransactionHash
    };
}

module.exports = blockchainObject;