const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const {BlockChain, Transaction} = require('./blockChain')

const myKey = ec.keyFromPrivate('65222979c13fc15b98157d3d5ef12d80b5d1081fce39e98185609421a69139f5');
const myWalletAdd = myKey.getPublic('hex');
// console.log(myWalletAdd)

let myBlockChain = new BlockChain();
const tx1 = new Transaction(myWalletAdd,"Someaddress", 10);

tx1.signTrans(myKey);

myBlockChain.addTransaction(tx1);

myBlockChain.minePendingTransactions(myWalletAdd);

console.log(myBlockChain.calculateBalance(myWalletAdd));

myBlockChain.minePendingTransactions(myWalletAdd);

console.log(myBlockChain.calculateBalance(myWalletAdd));