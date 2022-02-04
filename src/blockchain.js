/**
 *                          Blockchain Class
 *  The Blockchain class contain the basics functions to create your own private blockchain
 *  It uses libraries like `crypto-js` to create the hashes for each block and `bitcoinjs-message`
 *  to verify a message signature. The chain is stored in the array
 *  `this.chain = [];`. Of course each time you run the application the chain will be empty because and array
 *  isn't a persisten storage method.
 *
 */

const SHA256 = require("crypto-js/sha256");
const BlockClass = require("./block.js");
const bitcoinMessage = require("bitcoinjs-message");

class Blockchain {
  /**
   * Constructor of the class, you will need to setup your chain array and the height
   * of your chain (the length of your chain array).
   * Also everytime you create a Blockchain class you will need to initialized the chain creating
   * the Genesis Block.
   * The methods in this class will always return a Promise to allow client applications or
   * other backends to call asynchronous functions.
   */
  constructor() {
    this.chain = [];
    this.height = -1;
    this.initializeChain();
  }

  /**
   * This method will check for the height of the chain and if there isn't a Genesis Block it will create it.
   * You should use the `addBlock(block)` to create the Genesis Block
   * Passing as a data `{data: 'Genesis Block'}`
   */
  async initializeChain() {
    if (this.height === -1) {
      let block = new BlockClass.Block({
        data: "Genesis block: The Times 03 Jan/2009 Chancellor on brink of second bailout for banks.",
      });
      await this._addBlock(block);
    }
  }

  /**
   * Utility method that return a Promise that will resolve with the height of the chain
   */
  getChainHeight() {
    return new Promise((resolve) => {
      resolve(this.height);
    });
  }

  /**
   * _addBlock(block) will store a block in the chain
   * @param {*} block
   * The method will return a Promise that will resolve with the block added
   * or reject if an error happen during the execution.
   * You will need to check for the height to assign the `previousBlockHash`,
   * assign the `timestamp` and the correct `height`...At the end you need to
   * create the `block hash` and push the block into the chain array. Don't for get
   * to update the `this.height`
   * Note: the symbol `_` in the method name indicates in the javascript convention
   * that this method is a private method.
   */
  _addBlock(block) {
    let self = this;
    return new Promise(async (resolve) => {
      try {
        // Get the previous block hash
        if (self.height != -1) {
          block.previousBlockHash = this.chain[self.height].hash;
        }

        // Block height
        block.height = self.height + 1;

        // UTC timestamp
        block.time = new Date().getTime().toString().slice(0, -3);

        // Get the hash of the block
        block.hash = SHA256(JSON.stringify(block)).toString();

        // Add block to chain
        self.chain.push(block);

        // Update the block height
        self.height = block.height;

        // Validate a block
        const valid = await self.validateChain();

        // Check if a block is valid, throw error if it's not
        if (!valid) {
          throw new Error("The block is not valid!");
        }

        resolve(block);
      } catch (e) {
        throw new Error(e);
      }
    });
  }

  /**
   * The requestMessageOwnershipVerification(address) method
   * will allow you  to request a message that you will use to
   * sign it with your Bitcoin Wallet (Electrum or Bitcoin Core)
   * This is the first step before submit your Block.
   * The method return a Promise that will resolve with the message to be signed
   * @param {*} address
   */
  requestMessageOwnershipVerification(address) {
    return new Promise((resolve) => {
      const messageTime = new Date().getTime().toString().slice(0, -3);
      const message = [address, messageTime, `starRegistry`];
      resolve(message);
    });
  }

  /**
   * The submitStar(address, message, signature, star) method
   * will allow users to register a new Block with the star object
   * into the chain. This method will resolve with the Block added or
   * reject with an error.
   * Algorithm steps:
   * 1. Get the time from the message sent as a parameter example: `parseInt(message.split(':')[1])`
   * 2. Get the current time: `let currentTime = parseInt(new Date().getTime().toString().slice(0, -3));`
   * 3. Check if the time elapsed is less than 5 minutes
   * 4. Veify the message with wallet address and signature: `bitcoinMessage.verify(message, address, signature)`
   * 5. Create the block and add it to the chain
   * 6. Resolve with the block added.
   * @param {*} address
   * @param {*} message
   * @param {*} signature
   * @param {*} star
   */
  submitStar(address, message, signature, star) {
    let self = this;
    return new Promise(async (resolve) => {
      try {
        const messageTimeStamp = parseInt(message.split(":")[1]);
        const currentTime = parseInt(
          new Date().getTime().toString().slice(0, -3)
        );

        // Check if time elapsed is less than 5 minutes
        if (currentTime - messageTimeStamp >= 5 * 60) {
          throw new Error(`You cannot add this star!`);
        }
        // Verify if false throw errror
        if (!bitcoinMessage.verify(message, address, signature)) {
          throw new Error(`Invalid signature!`);
        }

        const data = {
          owner: address,
          message: message.split(":")[0],
          star: star,
        };

        const block = new BlockClass.Block(data);
        resolve(self._addBlock(block));
      } catch (error) {
        throw new Error(error);
      }
    });
  }

  /**
   * This method will return a Promise that will resolve with the Block
   *  with the hash passed as a parameter.
   * Search on the chain array for the block that has the hash.
   * @param {*} hash
   */
  getBlockByHash(hash) {
    let self = this;
    return new Promise((resolve) => {
      let block = self.chain.find((b) => b.hash === hash);
      if (block) {
        resolve(block);
      }
    });
  }

  /**
   * This method will return a Promise that will resolve with the Block object
   * with the height equal to the parameter `height`
   * @param {*} height
   */
  getBlockByHeight(height) {
    let self = this;
    return new Promise((resolve, reject) => {
      if ((height) => 0 && height < self.chain.length) {
        resolve(self.chain[height]);
      }
    });
  }

  /**
   * This method will return a Promise that will resolve with an array of Stars objects existing in the chain
   * and are belongs to the owner with the wallet address passed as parameter.
   * Remember the star should be returned decoded.
   * @param {*} address
   */
  getStarsByWalletAddress(address) {
    let self = this;
    return new Promise((resolve) => {
      try {
        let starsByWalletList = self.chain
          .filter((b) => b.height > 0 && b.getBData().owner === address)
          .map((block) => block.getBData());
        resolve(starsByWalletList);
      } catch (e) {
        throw new Error(e);
      }
    });
  }

  /**
   * This method will return a Promise that will resolve with the list of errors when validating the chain.
   * Steps to validate:
   * 1. You should validate each block using `validateBlock`
   * 2. Each Block should check the with the previousBlockHash
   */
  validateChain() {
    let self = this;
    let errorLog = [];
    return new Promise(async (resolve) => {
      // Beginning of the chain
      let previousBlock = self.chain[0];
      // Loop through the blocks in the chain
      for (const block of self.chain) {
        console.log(block.height);
        try {
          if (block.height > 0) {
            let isValid = await block.validate();

            if (!isValid) {
              errorLog.push("invalid hash at " + block.height);
            }

            if (previousBlock.hash !== block.previousBlockHash) {
              errorLog.push("invalid previousBlockHash at " + block.height);
            }
          }
        } catch (e) {
          throw new Error(e);
        }
        previousBlock = block;
      }
      resolve(errorLog);
    });
  }
}

module.exports.Blockchain = Blockchain;
