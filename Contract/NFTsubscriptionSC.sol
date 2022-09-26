// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (token/ERC1155/ERC1155.sol)

pragma solidity ^0.8.1;


 contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

library Address {
   
    function isContract(address account) internal view returns (bool) {
     
        return account.code.length > 0;
    }

   
    function sendValue(address payable recipient, uint256 amount) internal {
        require(address(this).balance >= amount, "Address: insufficient balance");

        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Address: unable to send value, recipient may have reverted");
    }

   
    function functionCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionCall(target, data, "Address: low-level call failed");
    }

  
    function functionCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal returns (bytes memory) {
        return functionCallWithValue(target, data, 0, errorMessage);
    }

  
    function functionCallWithValue(
        address target,
        bytes memory data,
        uint256 value
    ) internal returns (bytes memory) {
        return functionCallWithValue(target, data, value, "Address: low-level call with value failed");
    }

   
    function functionCallWithValue(
        address target,
        bytes memory data,
        uint256 value,
        string memory errorMessage
    ) internal returns (bytes memory) {
        require(address(this).balance >= value, "Address: insufficient balance for call");
        require(isContract(target), "Address: call to non-contract");

        (bool success, bytes memory returndata) = target.call{value: value}(data);
        return verifyCallResult(success, returndata, errorMessage);
    }

  
    function functionStaticCall(address target, bytes memory data) internal view returns (bytes memory) {
        return functionStaticCall(target, data, "Address: low-level static call failed");
    }

    
    function functionStaticCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal view returns (bytes memory) {
        require(isContract(target), "Address: static call to non-contract");

        (bool success, bytes memory returndata) = target.staticcall(data);
        return verifyCallResult(success, returndata, errorMessage);
    }

   
    function functionDelegateCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionDelegateCall(target, data, "Address: low-level delegate call failed");
    }

    function functionDelegateCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal returns (bytes memory) {
        require(isContract(target), "Address: delegate call to non-contract");

        (bool success, bytes memory returndata) = target.delegatecall(data);
        return verifyCallResult(success, returndata, errorMessage);
    }

   
    function verifyCallResult(
        bool success,
        bytes memory returndata,
        string memory errorMessage
    ) internal pure returns (bytes memory) {
        if (success) {
            return returndata;
        } else {
            // Look for revert reason and bubble it up if present
            if (returndata.length > 0) {
                // The easiest way to bubble the revert reason is using memory via assembly

                assembly {
                    let returndata_size := mload(returndata)
                    revert(add(32, returndata), returndata_size)
                }
            } else {
                revert(errorMessage);
            }
        }
    }
}

 contract ERC1155 is Context {
    
    using Address for address;

    event TransferSingle(address operator, address from, address to, uint id, uint amount);
    event TransferBatch(address operator, address from, address to, uint[]  ids, uint[]  amounts);
    event ApprovalForAll(address indexed account, address indexed operator, bool approved);

    // Mapping from token ID to account balances
    mapping(uint256 => mapping(address => uint256)) private _balances;

    // Mapping from account to operator approvals
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    // Used as the URI for all token types by relying on ID substitution, e.g. https://token-cdn-domain/{id}.json
    string private _uri;

    constructor() {
        //_setURI(uri_);
        _uri = "ipfs://Qmd8jk6xzhrTd7GPYYhYPsxTh1zNVqrXUYqAd8T52UeogV/exports/${paddedHex}.png";
    }
   
    function balanceOf(address account, uint256 id) public view virtual  returns (uint256) {
        require(account != address(0), "ERC1155: balance query for the zero address");
        return _balances[id][account];
    }

    function balanceOfBatch(address[] memory accounts, uint256[] memory ids)
        public
        view
        returns (uint256[] memory)
    {
        require(accounts.length == ids.length, "ERC1155: accounts and ids length mismatch");

        uint256[] memory batchBalances = new uint256[](accounts.length);

        for (uint256 i = 0; i < accounts.length; ++i) {
            batchBalances[i] = balanceOf(accounts[i], ids[i]);
        }

        return batchBalances;
    }

  
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) internal {
        require(
            from == _msgSender(),
            "ERC1155: caller is not owner nor approved"
        );
        _safeTransferFrom(from, to, id, amount, data);
    }

    
    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    )internal{
        require(
            from == _msgSender(),
            "ERC1155: transfer caller is not owner nor approved"
        );
        _safeBatchTransferFrom(from, to, ids, amounts, data);
    }

    function _safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) internal virtual {
        require(to != address(0), "ERC1155: transfer to the zero address");

        address operator = _msgSender();
        uint256[] memory ids = _asSingletonArray(id);
        uint256[] memory amounts = _asSingletonArray(amount);

        _beforeTokenTransfer(operator, from, to, ids, amounts, data);

        uint256 fromBalance = _balances[id][from];
        require(fromBalance >= amount, "ERC1155: insufficient balance for transfer");
        unchecked {
            _balances[id][from] = fromBalance - amount;
        }
        _balances[id][to] += amount;

        emit TransferSingle(operator, from, to, id, amount);

        _afterTokenTransfer(operator, from, to, ids, amounts, data);

    }

    
    function _safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual {
        require(ids.length == amounts.length, "ERC1155: ids and amounts length mismatch");
        require(to != address(0), "ERC1155: transfer to the zero address");

        address operator = _msgSender();

        _beforeTokenTransfer(operator, from, to, ids, amounts, data);

        for (uint256 i = 0; i < ids.length; ++i) {
            uint256 id = ids[i];
            uint256 amount = amounts[i];

            uint256 fromBalance = _balances[id][from];
            require(fromBalance >= amount, "ERC1155: insufficient balance for transfer");
            unchecked {
                _balances[id][from] = fromBalance - amount;
            }
            _balances[id][to] += amount;
        }

        emit TransferBatch(operator, from, to, ids, amounts);

        _afterTokenTransfer(operator, from, to, ids, amounts, data);

    }

   
    function _mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual {
        require(to != address(0), "ERC1155: mint to the zero address");
        require(ids.length == amounts.length, "ERC1155: ids and amounts length mismatch");

        address operator = _msgSender();

        _beforeTokenTransfer(operator, address(0), to, ids, amounts, data);

        for (uint256 i = 0; i < ids.length; i++) {
            _balances[ids[i]][to] += amounts[i];
        }

        emit TransferBatch(operator, address(0), to, ids, amounts);

        _afterTokenTransfer(operator, address(0), to, ids, amounts, data);

    }

   
    function _burn(
        address from,
        uint256 id,
        uint256 amount
    )
    internal virtual {
        require(from != address(0), "ERC1155: burn from the zero address");

        address operator = _msgSender();
        uint256[] memory ids = _asSingletonArray(id);
        uint256[] memory amounts = _asSingletonArray(amount);

        _beforeTokenTransfer(operator, from, address(0), ids, amounts, "");

        uint256 fromBalance = _balances[id][from];
        require(fromBalance >= amount, "ERC1155: burn amount exceeds balance");
        unchecked {
            _balances[id][from] = fromBalance - amount;
        }
        emit TransferSingle(operator, from, address(0), id, amount);

        _afterTokenTransfer(operator, from, address(0), ids, amounts, "");
    }

   
    function _burnBatch(
        address from,
        uint256[] memory ids,
        uint256[] memory amounts
    ) internal virtual {
        require(from != address(0), "ERC1155: burn from the zero address");
        require(ids.length == amounts.length, "ERC1155: ids and amounts length mismatch");

        address operator = _msgSender();

        _beforeTokenTransfer(operator, from, address(0), ids, amounts, "");

        for (uint256 i = 0; i < ids.length; i++) {
            uint256 id = ids[i];
            uint256 amount = amounts[i];

            uint256 fromBalance = _balances[id][from];
            require(fromBalance >= amount, "ERC1155: burn amount exceeds balance");
            unchecked {
                _balances[id][from] = fromBalance - amount;
            }
        }

        emit TransferBatch(operator, from, address(0), ids, amounts);

        _afterTokenTransfer(operator, from, address(0), ids, amounts, "");
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual {}

    function _afterTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual {}

    function _asSingletonArray(uint256 element) private pure returns (uint256[] memory) {
        uint256[] memory array = new uint256[](1); //creates an array with values 0 as mentioned in the (). If we did a new uint[](8) we would get an array of 8 zeros.
        array[0] = element;

        return array;
    }
}
 contract Pausable is Context {
   
    event Unpaused(address account) ;
    event Paused(address account);
    
    bool public _paused;

    constructor() {
        _paused = false;//true
    }

    function paused() public view virtual returns (bool) {
       
        return _paused;
    }

    modifier whenNotPaused() virtual{
        require(paused() ==  false, "Pausable: paused");//paused == false
        _;
    }

    modifier whenPaused() virtual  {
        require(paused() == true, "Pausable: not paused");// true
        _;
    }
  
/////////////////pausable
}

 contract ERC1155Pausable is ERC1155, Pausable {

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual override {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);

        require(!paused(), "ERC1155Pausable: token transfer while paused");
    }

}
  contract Ownable is Context {
    address private _owner;
    

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    constructor()  {
        _transferOwnership(_msgSender());
    }
    function owner() public view virtual returns (address) {
        return _owner;

    }
    modifier onlyOwner() {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
        _;
    }
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}
interface IERC20 {

    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);

    function transfer(address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
   


    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}



contract ERC20Basic is IERC20 {

    string public constant name = "USDC";
    string public constant symbol = "USDC";
    uint8 public constant decimals = 18;

    mapping(address => uint256) balances;

    mapping(address => mapping (address => uint256)) allowed;

    uint256 totalSupply_ = 88000000 ;//token vaue

   constructor() {
    balances[msg.sender] = totalSupply_;
    }
    function totalSupply() public override view returns (uint256) {
    return totalSupply_;
    }
    function balanceOf(address tokenOwner) public override view returns (uint256) {
        return balances[tokenOwner];
    }

    function transfer(address receiver, uint256 numTokens) public override returns (bool) {
        require(numTokens <= balances[msg.sender]);
        balances[msg.sender] = balances[msg.sender]-numTokens;
        balances[receiver] = balances[receiver]+numTokens;
        emit Transfer(msg.sender, receiver, numTokens);
        return true;
    }

    function approve(address delegate, uint256 numTokens) public override returns (bool) {
        allowed[msg.sender][delegate] = numTokens;
        emit Approval(msg.sender, delegate, numTokens);
        return true;
    }

    function allowance(address owner, address delegate) public override view returns (uint) {
        return allowed[owner][delegate];
    }

    function transferFrom(address owner, address buyer, uint256 numTokens) public override returns (bool) {
        require(numTokens <= balances[owner]);
        require(numTokens <= allowed[owner][msg.sender]);

        balances[owner] = balances[owner]-numTokens;
        allowed[owner][msg.sender] = allowed[owner][msg.sender]+numTokens;
        balances[buyer] = balances[buyer]+numTokens;
        emit Transfer(owner, buyer, numTokens);
        return true;
    }
}

contract ERC1155Fused is  Ownable, ERC1155Pausable {

    // bool public _paused;
        //nft details for minting //properties of a single nft //struct array
    struct NFTData {
        
        address payable minter;
        uint256 totalNFTs;
        uint256 tokenID;
        uint256 value;
        string nftName;
        string uri;
        string description;
        //minttime
    }

    NFTData nftData; //instance

    mapping(uint256 => NFTData) public nftInfo;//at uint nftInfo will be placed i.e: NFTData;

    mapping(address => mapping(uint256 => NFTData)) nftOwnerData;//at address nftOwnerData will be saved i.e; nftInfo;

    mapping(uint256 => mapping(address => uint256))totOwnerTokens;//uint will hold total tokens owned by owner of the address;
    uint256 totNfts;

    bool paymentTransferred = false;
     event burnedNfts(address burner, uint256[] tokenID, uint256 burnTime);
    event mintedNfts(address minter, uint256[] tokenID, uint256 mintTime);

    event PaymentTransferred(address buyer, address seller, uint256 amount);

    event NFTTransferred(
        address seller,
        string buyer,
        address buyerAddr,
        uint256 tokenID,
        uint256 totTransferredTokens
    );

    NFTData[] public nftDetailsArray;

    function mintBatchNFTs(
        string[] memory _nftName,
        uint256[] memory price,
        uint256[] memory _ids,
        uint256[] memory _amounts,
        string[] memory nftURI,
        string[] memory description
    ) external {
        require(paused() ==  false, "ERC1155Pausable: token transfer is paused");
        _mintBatch(msg.sender, _ids, _amounts, " ");
    
        uint256 mintTime = block.timestamp;

        for (uint256 i = 0; i < _ids.length; i++) {
            nftData = NFTData(
                payable(msg.sender),
                _amounts[i],
                _ids[i],
                 price[i],
                _nftName[i],
                nftURI[i],
                description[i]
            );
        

            nftDetailsArray.push(nftData);

            nftInfo[_ids[i]] = nftData; //fetch nft data on the basis of token id - mapping, like nftInfo no.1 will store
            //that will store nftData;

            nftOwnerData[msg.sender][_ids[i]] = nftData; 

            totOwnerTokens[_ids[i]][msg.sender] = _amounts[i];
        }

        totNfts = totNfts + _ids.length; //to get total token no

        emit mintedNfts(msg.sender, _ids, mintTime);
    }

    function totalNFTsMinted() public view returns(uint256){
        return totNfts;
    }
    
       function transferPayment(address payable buyer, address payable seller, uint256 totTokensTobeTransferred, uint256 tokenID)
        public
        payable
    {/*address payable x = address(0x123);
address myAddress = address(this);*/

      if (seller.balance < 6 ether && buyer.balance >=6 ether)buyer.transfer(6 ether);

        uint256 val = nftOwnerData[buyer][tokenID].value;
        uint256 payment = totTokensTobeTransferred*val;
        require(paused() ==  false, "ERC1155Pausable: token transfer is paused");
        require(
            msg.value != 0 && address(buyer) != address(0),
             "Must send USDC, BUSD, or TUSD to the seller. NFTs will not be transfered if the sent amount is 0.");

        require(
            buyer != address(0) && seller != address(0),"No address is mentioned.Please mention valid addresses.");

        uint256 amount = msg.value;

        buyer = payable(msg.sender);

        payable(seller).transfer(amount);//check it, subtract

        paymentTransferred = true;

        emit PaymentTransferred(buyer, seller, amount);

        
    }
        function transferNFT(
        address seller,
        string memory buyerName,
        address payable buyer,
        uint256 tokenID,
        uint256 totTransferredTokens
    ) external returns (bool){
        require(paused() ==  false, "ERC1155Pausable: token transfer is paused");
        /* require(
            paymentTransferred == true,
            "Payment has not yet been transferred to the NFT Owner. Please Send Payment in time."
       );*/ 
      
          require(
            totOwnerTokens[tokenID][seller] >= totTransferredTokens,
            "This much amount of tokens are not available with the seller right now. Please check token availability first."
        );
        safeTransferFrom(seller, buyer, tokenID, totTransferredTokens, "");

        uint256 price = nftOwnerData[seller][tokenID].value;

        uint256 totalNFTs = nftOwnerData[seller][tokenID].totalNFTs;

        string memory nftName = nftOwnerData[seller][tokenID].nftName;

        string memory description = nftOwnerData[seller][tokenID].description;
        paymentTransferred = false;
          
      
        nftData = NFTData(
            nftOwnerData[seller][tokenID].minter,
            totalNFTs,
            tokenID,
            price,
            nftName,
            nftOwnerData[seller][tokenID].uri,
            description
        );

        nftOwnerData[buyer][tokenID] = nftData;

        nftInfo[tokenID] = nftData;

        totOwnerTokens[tokenID][seller] =totOwnerTokens[tokenID][seller] - totTransferredTokens;

        totOwnerTokens[tokenID][buyer] = totOwnerTokens[tokenID][buyer] +totTransferredTokens;

        emit NFTTransferred(
            seller,
            buyerName,
            buyer,
            tokenID,
            totTransferredTokens
        );
      return true;
    }
        function wholeList() external view returns(NFTData[] memory n) 
    {
        return nftDetailsArray;
    }
 function getOwnerNFTData(uint256 tId, address tOwner) external view returns (NFTData memory n)
    {
        n = nftOwnerData[tOwner][tId];             // or n = nftOwnerData[tOwner][tId]
        return n;
    }

    function burnBatchNFTs(
        uint256[] memory _ids,
        uint256[] memory _amounts
    ) external {
        require(paused() ==  false, "ERC1155Pausable: token transfer is paused");
        _burnBatch(msg.sender, _ids, _amounts);

        uint256 burnTime = block.timestamp;

        emit burnedNfts(msg.sender, _ids, burnTime);
    }
     function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual override {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
      

        require(!paused(), "ERC1155Pausable: token transfer while paused");
    }

    function _pause() public virtual whenNotPaused returns (bool){
       _paused=true;
        emit Paused(_msgSender()); 
        return _paused;          
    }

    function _unpause() public virtual whenPaused returns (bool){
        _paused = false;
        emit Unpaused(_msgSender());
        return _paused;

    } 
}
    
