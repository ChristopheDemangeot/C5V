// Some refs
// http://hypernephelist.com/2016/12/13/compile-deploy-ethereum-smart-contract-web3-solc.html
// https://gist.github.com/tomconte/4edb83cf505f1e7faf172b9252fff9bf
// https://github.com/ethereum/solc-js#from-version-021
// https://www.npmjs.com/package/array-events

// https://www.npmjs.com/package/ethereumjs-testrpc

var appStart = new Object();
var Web3 = require('web3');
var fs = require('fs');
var solc = require('solc');
var EventedArray = require('array-events');

var isLocalBlockchain = true;
var localBlockchainUrl = 'http://localhost:8545';
var remoteBlockchainUrl = 'https://blabla.azure.net:8545'; // Clearly needs to be updated
var defaultGas = 90000;

var smartContractFolder = './contracts';

var web3Instance;

function getBlockchainUrl() {
    if(isLocalBlockchain)
        return localBlockchainUrl;
    else
        return remoteBlockchainUrl;
}

function createWeb3() {
    return new Web3(new Web3.providers.HttpProvider(getBlockchainUrl()));
}

function testBlockchainIsRunning() {
    return web3Instance.isConnected();
}

function testContract(contractName, contractType, contractAddress) {
    // Reference to the deployed contract
    var testInstance = contractType.at(contractAddress);

    // We assume that call contract have a method called: testIsAlive
    testInstance.testIsAlive({from: web3Instance.eth.coinbase}, (err, res) => {
        if (err) {
            console.log('|----> Test call failed for ' + contractName + ': ' + err);
            return false;
        } else {
            console.log('|----> Test call to testIsAlive is OK for ' + contractName);
            console.log('|------> Result: ' + res);
            appStart.ContractArray.push({ 'ContractName': contractName, 'ContractAddress': contractAddress });
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

function prepareSmartContracts() {
    console.log('Preparing smart contracts...');
    fs.readdir(smartContractFolder, function(err, fileList) {
        for (var i=0; i<fileList.length; i++) {
            if(fileList[i].indexOf('.sol') > 0) {
                console.log('|--> Processing: ' + fileList[i]);
                var contractFile = fs.readFileSync(smartContractFolder + '/' + fileList[i]);
                console.log('|----> Contract read from file');
                var compiledContract = solc.compile(contractFile.toString(), 1);

                if(compiledContract.errors === undefined) {
                    console.log('|----> Contract compiled OK with solc version ' + solc.version());

                    // We are now making the STRONG assumption that the contract name is the name of the .sol file
                    var contractName = fileList[i].replace('.sol', '');
                    console.log('|----> Processing contract: ' + contractName);
                    
                    var bytecode = compiledContract.contracts[':' + contractName].bytecode;
                    console.log('|----> Processed bytecode');
                    var abi = JSON.parse(compiledContract.contracts[':' + contractName].interface);
                    console.log('|----> Processed ABI');
                    var contractClass = web3Instance.eth.contract(abi);
                    console.log('|----> Contract class created');
    
                    var contractInstance = contractClass.new({
                        data: '0x' + bytecode,
                        from: web3Instance.eth.coinbase,
                        gas: defaultGas * 2
                    }, (err, res) => {
                        if (err) {
                            console.log('|----> Contract instance could not be created: ' + err);
                        } else {
                            // Log the tx, you can explore status with eth.getTransaction()
                            console.log('|----> Contract instance hash: ' + res.transactionHash);
                        
                            // If we have an address property, the contract was deployed
                            if (res.address) {
                                console.log('|----> Contract deployed SUCCESSFULLY!');
                                console.log('|----> Contract instance address: ' + res.address);
                                // Let's test the deployed contract
                                testContract(contractName, contractClass, res.address);
                            } else {
                                console.log('|----> Awaiting deployment confirmation...');                       
                            }
                        }
                    });
    
                } else {
                    console.log('|----> Contract DID NOT compile OK with solc version ' + solc.version());
                    console.log('|----> Error(s): ' + compiledContract.errors);
                }
            }
        }
    });
}

appStart.ContractArray = new EventedArray();
appStart.ContractArray.on('add', function(event) {
    console.log('|----> New contract READY: ' + event.ContractName + ' at ' + event.ContractAddress);
});

appStart.InitialiseBlockchain = function() {
    web3Instance = createWeb3();
    console.log('Checking Blockchain available...');
    if(testBlockchainIsRunning()) {
        console.log('|--> Blockchain is OK on: ' + getBlockchainUrl());
        prepareSmartContracts();
    } else {
        console.log('|--> Could not connect to Blockchain on: ' + getBlockchainUrl());
        console.log('|--> Nothing further to do. App will not work');
    }
};

module.exports = appStart;