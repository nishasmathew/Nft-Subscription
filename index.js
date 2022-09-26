const express = require("express");
const app = express();
const dotenv = require('dotenv');
const nftRoute = require("./routes/nft");
dotenv.config();

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.use("/nfts", nftRoute);
app.use('/public', express.static('./public'));
const PORT = process.env.PORT || 4111;
app.listen(PORT, console.log("Server started for port: " + PORT));