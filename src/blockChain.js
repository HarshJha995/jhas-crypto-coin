const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Block{
    constructor(timestamp,transactions,previousHash){
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.counter = 0;
    }

    calculateHash(){
        return SHA256(this.index + this.timestamp + JSON.stringify(this.data) + this.previousHash + this.counter).toString();
    }

    mineBlock(difficulty){
        while(this.hash.substring(0,difficulty) !== Array(difficulty+1).join("0")){
            this.counter++;
            this.hash = this.calculateHash();
        }
    }

    hasValidTransactions(){
        for(const tx of this.transactions){
            if(!tx.isValid())
                return false;
        }
        return true;
    }
}

class BlockChain{
    constructor(){
        this.chain = [];
        this.difficulty = 3;
        this.createGenesis();
        this.pendingTranctions = [];
        this.miningReward = 100;
    }

    createGenesis(){
        this.chain.push(new Block('18/2/21 17:30','Genesis Block',null));
    }

    minePendingTransactions(miningRewardAdd){
        let currDate = Date.now();
        let block = new Block(currDate,this.pendingTranctions,this.chain[this.chain.length-1].hash);
        if(this.isChainValid()){
            block.mineBlock(this.difficulty);
            console.log('Block successfully mined');
            this.chain.push(block);
            this.pendingTranctions = [
                new Transaction(null,miningRewardAdd,this.miningReward)
            ];
        }
        else{
            console.log('Chain corrupted!')
        }
    }

    addTransaction(transaction){
        if(!transaction.srcAdd || !transaction.destAdd)
            throw new Error("Transaction must include from and to address!")
        
        if(!transaction.isValid())
            throw new Error("Cannot add invalid transaction!")

        this.pendingTranctions.push(transaction);
    }

    calculateBalance(address){
        let balance = 0;
        for(let block of this.chain){
            for(let transaction of block.transactions){
                if(transaction.destAdd == address)
                    balance += transaction.amount;
                if(transaction.srcAdd == address)
                    balance -= transaction.amount;
            }
        }
        return balance;
    }
    // addBlock(newBlock){
    //     if(this.isChainValid()){
    //         newBlock.previousHash = this.chain[this.chain.length-1].hash;
    //     }
    //     newBlock.mineBlock(this.difficulty);
    //     this.chain.push(newBlock);
    // }

    isChainValid(){
        for(let i=1; i< this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i-1];
            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }

            if(!currentBlock.hasValidTransactions()){
                return false;
            }
            if(currentBlock.previousHash !== previousBlock.hash){
                return false;
            }
        }
        return true;
    }
}

class Transaction{
    constructor(srcAdd, destAdd, amount){
        this.srcAdd = srcAdd;
        this.destAdd = destAdd;
        this.amount = amount;
    }

    calculateHash(){
        return SHA256(this.srcAdd + this.destAdd + this.amount).toString();
    }

    signTrans(signingKey){
        if(this.srcAdd !== signingKey.getPublic('hex')){
            throw new Error('You cannot sign transactions for other wallets!')
        }
        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }

    isValid(){
        if(this.srcAdd == null) return true;
        if(!this.signature || this.signature.length == 0)
            throw new Error('Signature not found!')

        const publicKey = ec.keyFromPublic(this.srcAdd, "hex");
        return publicKey.verify(this.calculateHash(), this.signature)
    }
}


module.exports.BlockChain = BlockChain;
module.exports.Transaction = Transaction