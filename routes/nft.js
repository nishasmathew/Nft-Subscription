const router = require("express").Router();
const bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: true });
const { userBalance, wholeList, nftDetailsArray, nftData, owner, pause,ownerNFTInfo,batchMinting, transferPayment,burnNFT,pauseContract,unpauseContract,transferNFT,USDTPaymentTransfer } = require("../controllers/nftController");

const { upload } = require('../services/multer');
router.get('/balanceOf', userBalance);
router.get('/allNFTs', wholeList);
router.get('/nftDetails', nftDetailsArray);
router.get('/nftInfo', nftData);
router.get('/owner', owner);
router.get('/paused', pause);
router.get('/getOwnerNFTData', ownerNFTInfo);
router.post('/mintBatchNFTs', upload.array('images'), urlencodedParser, batchMinting);
router.post('/transferPayment', urlencodedParser, transferPayment);
router.post('/burnBatchNFTs',urlencodedParser,burnNFT);
router.post('/_pause',pauseContract);
router.post('/_unpause',unpauseContract);
router.post('/transferNFT',urlencodedParser,transferNFT)
router.post('/USDTTransferPayment',USDTPaymentTransfer);
module.exports = router;