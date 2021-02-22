const SHA256 = require('crypto-js/sha256')

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

    createTransaction(transaction){
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
}

let myBlockChain = new BlockChain();

myBlockChain.createTransaction(new Transaction('Jon', 'Brad', 220));
myBlockChain.createTransaction(new Transaction('Brad', 'Augustus', 20));
myBlockChain.minePendingTransactions('Harsh');
console.log(JSON.stringify(myBlockChain));
myBlockChain.createTransaction(new Transaction('Whitney', 'Augustus', 100));
myBlockChain.minePendingTransactions('Cooper');
console.log(JSON.stringify(myBlockChain));
