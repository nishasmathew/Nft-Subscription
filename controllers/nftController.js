const dotenv = require("dotenv");
const { isBooleanObject } = require("util/types");

dotenv.config();

const Web3 = require('web3');

const ETx = require("ethereumjs-tx").Transaction;
const TRXHash = require("../models/transaction");
const web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/v3/0480f6f61a2c48d18ca1365c7de71013"));

const nftContractABI = require("../Contract/smartcontract.json");

const tetherTokenABI = require("../Contract/TetherToken.json");

const contractABI = nftContractABI.abi;

const tetherABI = tetherTokenABI.abi;

const contractAddress = nftContractABI.networks[3].address;

const tetherTokenAddress = tetherTokenABI.networks[3].address;

const contract = new web3.eth.Contract(contractABI, contractAddress);

const { Web3Storage, getFilesFromPath } = require('web3.storage');

const tetherContract = new web3.eth.Contract(tetherABI, tetherTokenAddress);

const token = process.env.IPFS;

const client = new Web3Storage({ token });
/**
 * @dev userBalance function to display details of number of NFT user have in specified account
  @param {user,tokenID} req gets parameters for user balance of NFT which are  user address and token ID
  @param {success,balance} res displays transaction state for userBalance transaction and NFT balance
 */
//userBalance api will display NFT collection available at particular address
const userBalance = async(req, res) =>{
    try{

        const {user, tokenID} = req.query;
        const num=Number(tokenID);
      
        const balance = await contract.methods.balanceOf(user, num).call(); //enableabi, calculate nounce, value of gas, network name
        
        res.status(200).send({success:true, balance});
        
    }
    catch(e){
        res.status(500).send({success: false, staus: "API Failed to Fetch Data"})
    }
 
}
/**
 * @dev nftDetailsArray function to fetch data from NFT array and display
  @param {index} req gets parameters for displaying NFT details using index of array parameter
  @param {success,balance} res NFT details from array using index value
 */
//nftDetailsArray will access NFT array to fetch data of NFT at that particular index.
const nftDetailsArray = async(req, res) =>{
    try{

        const {index} = req.query;

        const balance = await contract.methods.nftDetailsArray(index).call();

        res.status(200).send({success: true, balance});

    }
    catch(e){
        res.status(500).send({success: false, status: "API Failed to Fetch Data"})
    }
   
}
/**
 * @dev nftData function to display details of NFT for specified tokenID
  @param {tokenID} req gets parameters for displaying NFT detail using tokenID of NFT
  @param {status, info} res NFT info transaction status and NFTinfo 
 */
//nftData will display details of NFT for a particular token ID
const nftData = async(req, res) =>{
    try{

        const {tokenID} = req.query;
       
        const num=Number(tokenID);
      
        const info = await contract.methods.nftInfo(num).call();
      
        res.status(200).send({success: true,info});

    }
    catch(e){
      
        res.status(500).send({success: false, status: "API Failed to Fetch Data"})
    }
    
}
/**
 * @dev wholeList function to display details of NFTs minted by address using ERC1155 smart contract
  @param {list} res complete NFT list  with of NFTs minted by owner of smart contract
 */
//wholeList api will display complate list of NFT and related data
const wholeList = async(req,res) =>{
    try{

        const list = await contract.methods.wholeList().call();
      ;
        res.status(200).send({list});
        
    }
    catch(e){
        res.status(500).send({success: false, status: "API Failed to Fetch Data"})
    }
    
}
/**
 * @dev owner function to cto display address details of smart contract owner
 *  @param {ownerAddress} res displays address of smart contract owner
 */
//owner api will display owner of smart contract
const owner = async(req,res) =>{
    try{

        const ownerAddress = await contract.methods.owner().call();
       
        res.status(200).send({ ownerAddress});
        
    }
    catch(e){
        res.status(500).send({success: false, status: "API Failed to Fetch Data"})
    }
    
}
/**
 * @dev pause function to get state of smart contract ERC1155(paused or unpaused)
 *  @param {state,data} res response denotes state of smart contract
 */
//pause api will display current state of smart contract, as in if it is paused or not.
const pause = async(req,res) =>{
    try{

        const success = await contract.methods.paused().call();
     
        res.status(200).send({ state: "is Contract is in paused state ?", data: success});
        
    }
    catch(e){ 
       
        res.status(500).send({success: false, status: "API Failed to Fetch Data"})
    }
    
}
/**
 * @dev ownerNFTInfo function to fetch details of NFTs owned by owner at specific address using ERC1155 smart contract
  @param {tokenID,ownerAdress} req gets parameters for fetching information of NFTs which are token ID and NFT owner address
  @param {state} res to display data of the NFT owned by owner
 */
//ownerNFTInfo will show data of NFTs owned by owner
const ownerNFTInfo = async(req,res) =>{
    try{
        const {tokenID,ownerAdress} = req.query;
        const state = await contract.methods.getOwnerNFTData(tokenID,ownerAdress).call();
        
        res.status(200).send({ state});
        
    }
    catch(e){
        console.log(e);
        res.status(500).send({success: false, status: "API Failed to Fetch Data"})
    }
    
}


//Write APIs
/**
 * @dev batchMinting function to create  NFT collection using ERC1155 smart contract
  @param {images,nftName[0],prices[0],totalAmountOfNFTsCreating,amounts[0],description[0],publicKey , privateKey} req gets parameters for creating new NFT batch which are NFT image, NFT name,
   NFT price for minted NFT, total number of NFT created, amount of NFTs to be created,NFT description, public key and private key of user carrying out transaction.
  @param {success, minter,trxHASH,data} res NFT creation transaction status ,minter address , transaction hash along with complete transaction data.
 */
//batchMinting api is to mint NFTs in batches

const batchMinting = async (req, res) => {

    try {
        const { nftName, prices, totalAmountOfNFTsCreating, amounts, description } = req.body;
        
        const ids = [];
        
        let totalNFTsCreated = await contract.methods.totalNFTsMinted().call();//to take count of total NFTs minted 
      
        for (let i = 1; i <= totalAmountOfNFTsCreating; i++) {

            await ids.push(Number(totalNFTsCreated) + i);

        }
        let numbPrices = []

         for(let i=0; i<amounts.length;i++){
           let num = Number(amounts[i]);
            numbPrices.push(num)
          }
        console.log(nftName, prices, ids, numbPrices, description);

        let uris = [];

        for (let i = 0; i < req.files.length; i++) {
            const files = await getFilesFromPath(req.files[i].path);

            const cid = await client.put(files);

            uris.push(`https://ipfs.io/ipfs/${cid}/${req.files[0].filename}`);
        }
        const publicKey = req.body.publicKey;

        const privateKey = req.body.privateKey;

        let nonce = await web3.eth.getTransactionCount(publicKey, 'pending');
   
        const NetworkId = await web3.eth.net.getId();
        let strBigNumVal = 0;
        let amountToSend = [];
        for (let i = 0; i < prices.length; i++) {
            strBigNumVal = prices[i].toString();
            amountToSend[i] = web3.utils.toWei(strBigNumVal);
        }

        const userPrivKeyBuffered = Buffer.from(privateKey, "hex");
        const transferFunction = await contract.methods.mintBatchNFTs(nftName, amountToSend, ids, numbPrices, uris, description).encodeABI();
      
        const rawTx = {
            from: publicKey,
            to: contractAddress,
            data: transferFunction,
            nonce: nonce,
            value: "0x00000000000000",
            gas: web3.utils.toHex(3000000),
            gasPrice: web3.utils.toHex(30000000000),
            chainId: NetworkId,
        };

        let trans = new ETx(rawTx, { chain: "rinkeby", hardfork: "petersburg" });

        trans.sign(userPrivKeyBuffered);

        web3.eth.sendSignedTransaction("0x" + trans.serialize().toString("hex"))
            .on("receipt", async (data) => {
             
                console.log("data",data);
                res.status(200).send({ success: true, minter: data.from, trxHASH: data.logs[0].transactionHash, data: data });
            })
            .on("error", async (data) => {
                console.log("data",data);
                res.status(404).send({ status: 'data not found', data: data });
            })

        //ids.splice(0, ids.length);
    }
    catch (error) {
        res.status(404).send({ status: 'data not found', errorStatus: error });
    }
}
/**
 * @dev transferPayment function to transafer payment for NFT using ERC1155 smart contract to transfer payment from buyer account to seller account , owning NFT.
  @param {seller,buyer,price,privateKey,transactionStatus,totaltoken,id} req gets parameters for transferring payment which are NFT seller's address, 
  NFT buyer's address, NFT price, privateKey , status of transaction, total number of tokens for which amount getting transferred, NFT token ID.
  @param {status,data} res transfer of payment transaction status and transferPayment related Data.
  */

const transferPayment = async (req, res) => {
    let {buyer, seller, price, privateKey, transactionStatus} = req.body;
  
    const nonce = await web3.eth.getTransactionCount(buyer, 'pending');
   

    const networkID = await web3.eth.net.getId();

    const privateKeyBuffered = await Buffer.from(privateKey, 'hex');

    const transferFunction = await contract.methods.transferPayment(buyer, seller,req.body.totaltoken, req.body.id).encodeABI();
 
    const rawTx = {
        from: buyer,
        to: contractAddress,
        data: transferFunction,
        nonce: nonce,
        value: web3.utils.toWei(web3.utils.toBN(price), 'ether'),
        gas: web3.utils.toHex(1500000),
        gasPrice: web3.utils.toHex(30000000000 * 2),
        chainId: networkID,
    }

    let trans = new ETx(rawTx, {

        chain: "rinkeby",

    });

    trans.sign(privateKeyBuffered);

    await web3.eth.sendSignedTransaction("0x" + trans.serialize().toString("hex"))

        .on("receipt", async (data) => {

           
            console.log(data);
            transactionStatus = true;
            res.status(200).send({status:"success" , data: data} );
            console.log('transaction status ', transactionStatus);
        })
        .on("error", async (data) => {
            console.log(data);
            console.log('transaction status ', transactionStatus);
            transactionStatus = false;
        });
    
}
/**
 * @dev burnNFT function to  burn any NFT/NFT batch as per owner's need using ERC721 smart contract
  @param {_ids,_amounts,publicKey,privateKey} req gets parameters for burning NFT/NFT batch which are NFT id, NFT amount to be burned,
   public key and private key of account through which carrying out transaction.
  @param {success,NFTburner,trxHASH} res NFT burning transaction status, address of account via which we are burning NFT and transactionhash.
 */

const burnNFT = async (req, res) => {
   
    try {
   
        const _ids = 1;
        const _amounts = 1;
        
         const ids = [];
    
        for (let i = 1; i <= ids; i++) {
           let num1 = Number(_ids[i]);
            ids.push(num1);

        }
        let amounts = []
         for(let i=0; i<_amounts.length;i++){
           let num = Number(_amounts[i]);
           amounts.push(num)
          }
     

        const publicKey = req.body.publicKey;
     
        const privateKey = req.body.privateKey;
      

        let nonce = await web3.eth.getTransactionCount(publicKey, 'pending');
       
        const NetworkId = await web3.eth.net.getId();

        const userPrivKeyBuffered = Buffer.from(privateKey, "hex");
        const transferFunction = await contract.methods.burnBatchNFTs(ids,amounts).encodeABI();
      
        const rawTx = {
            from: publicKey,
            to: contractAddress,
            data: transferFunction,
            nonce: nonce,
            value: "0x00000000000000",
            gas: web3.utils.toHex(3000000),
            gasPrice: web3.utils.toHex(30000000000),
            chainId: NetworkId,
        };

        let trans = new ETx(rawTx, { chain: "rinkeby", hardfork : "petersburg"});

        trans.sign(userPrivKeyBuffered);
       
        web3.eth.sendSignedTransaction("0x" + trans.serialize().toString("hex"))

            .on("receipt", async (data) => {
                console.log("Response from blockchain : ", data);
             res.status(200).send({ success: true, NFTburner: data.from, trxHASH: data.logs[0].transactionHash });
            })

            .on("error", async (data) => {
             res.status(404).send({ status: 'data not found', data: data });
            })

       
    }
    catch (error) {
        console.log(error)
        res.status(404).send({ status: 'data not found', errorStatus: error });
    }
}

/**
 * @dev pauseContract function to pause contract using ERC1155 smart contract
  @param {publicKey, privateKey} req gets parameters for pausing smart contract 
  which are public and private key of account carrying out transaction.
  @param {status,data} res pauseContract function for displaying status and data regarding transaction.
 */
//pauseContract to pause contract
const pauseContract = async (req, res) => {

    try {

        const publicKey = req.body.publicKey;
       
        const privateKey = req.body.privateKey;

        let nonce = await web3.eth.getTransactionCount(publicKey, 'pending');
       
        const NetworkId = await web3.eth.net.getId();

        const userPrivKeyBuffered = Buffer.from(privateKey, "hex");
        const transferFunction = await contract.methods._pause().encodeABI();
        
        const rawTx = {
            from: publicKey,
            to: contractAddress,
            data: transferFunction,
            nonce: nonce,
            value: "0x00000000000000",
            gas: web3.utils.toHex(3000000),
            gasPrice: web3.utils.toHex(30000000000),
            chainId: NetworkId,
        };

        let trans = new ETx(rawTx, { chain: "rinkeby", hardfork: "petersburg" });

        trans.sign(userPrivKeyBuffered);

        web3.eth.sendSignedTransaction("0x" + trans.serialize().toString("hex"))

            .on("receipt", async (data) => {
             res.status(200).send({ success: true, pauserOfContract: data.from, trxHASH: data.logs[0].transactionHash });
            })

            .on("error", async (data) => {
             res.status(404).send({ status: 'data not found', data: data });
            });
    }
    catch (error) {
        res.status(404).send({ status: 'data not found', errorStatus: error });
    }
}
/**
 * @dev unpauseContract function to unpause ERC1155 smart contract
  @param {publicKey,privateKey} req gets parameters for creating new NFT which are NFT name, NFT price, NFT creator name, NFT image url path, creator wallet mnemonic
  @param {status,restarterOfContract,trxHASH} res pauseContract function for displaying status and account address of user who unpaused contract and transaction hash.
  */
//unpauseContract to bring smart contract in state to run various functions again
const unpauseContract = async (req, res) => {

    try {

        const publicKey = req.body.publicKey;
        
        const privateKey = req.body.privateKey;

        let nonce = await web3.eth.getTransactionCount(publicKey, 'pending');
        
        const NetworkId = await web3.eth.net.getId();
       

        const userPrivKeyBuffered = Buffer.from(privateKey, "hex");
        const transferFunction = await contract.methods._unpause().encodeABI();
        console.log(transferFunction);
        const rawTx = {
            from: publicKey,
            to: contractAddress,
            data: transferFunction,
            nonce: nonce,
            value: "0x00000000000000",
            gas: web3.utils.toHex(3000000),
            gasPrice: web3.utils.toHex(30000000000),
            chainId: NetworkId,
        };

        let trans = new ETx(rawTx, { chain: "rinkeby", hardfork: "petersburg" });

        trans.sign(userPrivKeyBuffered);

        web3.eth.sendSignedTransaction("0x" + trans.serialize().toString("hex"))

            .on("receipt", async (data) => {
             res.status(200).send({ success: true, restarterOfContract: data.from, trxHASH: data.logs[0].transactionHash });

            })

            .on("error", async (data) => {
             res.status(404).send({ status: 'data not found', data: data });
            })


    }
    catch (error) {
        res.status(404).send({ status: 'data not found', errorStatus: error });
    }
}
/**
 * @dev function will avail user to transfer NFT from owner to buyer using Smart contract, once payment is transferred
  @param {seller,buyerName,buyer,privateKey,transactionStatus,totaltoken,id} req gets parameters for transferring  NFT which are NFT seller address, NFT buyer name,
   NFT buyer address, privatekey of account carrying out transaction,total number of NFT tokens to be transferred and token ID.
  @param {status,data} res transferNFT transaction status and related data
 */

const transferNFT= async (req,res) =>{

    let {seller, buyerName, buyer, privateKey,transactionStatus} = req.body;
  
    const nonce = await web3.eth.getTransactionCount(seller, 'pending');

    const networkID = await web3.eth.net.getId();

    const privateKeyBuffered = await Buffer.from(privateKey, 'hex');

    const transferFunction = await contract.methods.transferNFT(seller, buyerName, buyer,req.body.totaltoken, req.body.id).encodeABI();
   
    const rawTx = {
        from: seller,
        to: contractAddress,
        data: transferFunction,
        nonce: nonce,
        value: "0x000000000000",
        gas: web3.utils.toHex(1500000),
        gasPrice: web3.utils.toHex(30000000000 * 2),
        chainId: networkID,
    }

    let trans = new ETx(rawTx, {

        chain: "rinkeby",

        hardfork: "petersburg",

    });

    trans.sign(privateKeyBuffered);

    
    await web3.eth.sendSignedTransaction("0x" + trans.serialize().toString("hex"))

        .on("receipt", async (data) => {

            console.log("data",data);
            transactionStatus = true;
            res.status(200).send({status:"success" , data: data} );
            console.log('transaction status ', transactionStatus);
        })
        .on("error", async (data) => {
            console.log(data);
            console.log('transaction status ', transactionStatus);
            transactionStatus = false;
        });

}
const USDTPaymentTransfer = async (req, res) => {
    let {from,to, value,privateKey} = req.body;//
  
    const nonce = await web3.eth.getTransactionCount(from.toLowerCase(), 'pending');
   

    const networkID = await web3.eth.net.getId();

    const privateKeyBuffered = await Buffer.from(privateKey, 'hex');

    const transferFunction = await tetherContract.methods.transfer(to, value).encodeABI();//
  console.log(transferFunction);
    const rawTx = {
        from: from,//
        to: tetherTokenAddress,//
        data: transferFunction,
        nonce: nonce,
        value: "0x00000000000000",
        gas: web3.utils.toHex(1500000),
        gasPrice: web3.utils.toHex(30000000000 * 2),
        chainId: networkID,
    }

    let trans = new ETx(rawTx, {

        chain: "rinkeby",
        hardfork: "petersburg"

    });

    trans.sign(privateKeyBuffered);

    await web3.eth.sendSignedTransaction("0x" + trans.serialize().toString("hex"))

        .on("receipt", async (data) => {

           
            console.log(data);
            transactionStatus = true;
            res.status(200).send({status:"success" , data: data} );
            console.log('transaction status ', transactionStatus);
        })
        .on("error", async (data) => {
            console.log(data);
            console.log('transaction status ', transactionStatus);
            transactionStatus = false;
        });
    
}

module.exports = {userBalance, nftDetailsArray,nftData, wholeList, owner,pause,ownerNFTInfo,batchMinting, transferPayment, burnNFT,pauseContract,unpauseContract,transferNFT,USDTPaymentTransfer}