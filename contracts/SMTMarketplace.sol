// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract SMTMarketplace is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIDs;
    Counters.Counter private _itemsSold;

    uint256 listPrice = 0.025 ether;
    address payable owner;

    mapping(uint256 => MarketToken) private idToMarketToken;

    struct MarketToken {
      uint256 tokenID;
      address payable seller;
      address payable owner;
      uint256 price;
      bool sold;
    }

    event MarketTokenCreated (
      uint256 indexed tokenID,
      address seller,
      address owner,
      uint256 price,
      bool sold
    );

    constructor() ERC721("Something", "SMT") {
      owner = payable(msg.sender);
    }

    /* Updates the listing price of the contract */
    function updateListPrice(uint _listPrice) public payable {
      require(owner == msg.sender, "Only marketplace owner can update listing price.");
      listPrice = _listPrice;
    }

    /* Returns the listing price of the contract */
    function getListPrice() public view returns (uint256) {
      return listPrice;
    }

    /* Mints a token and lists it in the marketplace */
    function createToken(string memory tokenURI, uint256 price) public payable returns (uint) {
      _tokenIDs.increment();
      uint256 newTokenID = _tokenIDs.current();

      _mint(msg.sender, newTokenID);
      _setTokenURI(newTokenID, tokenURI);
      createMarketToken(newTokenID, price);
      return newTokenID;
    }

    function createMarketToken(
      uint256 tokenID,
      uint256 price
    ) private {
      require(price > 0, "Price must be at least 1 wei");
      require(msg.value == listPrice, "Price must be equal to listing price");

      idToMarketToken[tokenID] =  MarketToken(
        tokenID,
        payable(msg.sender),
        payable(address(this)),
        price,
        false
      );

      _transfer(msg.sender, address(this), tokenID);
      emit MarketTokenCreated(
        tokenID,
        msg.sender,
        address(this),
        price,
        false
      );
    }

    /* allows someone to resell a token they have purchased */
    function reListToken(uint256 tokenID, uint256 price) public payable {
      require(idToMarketToken[tokenID].owner == msg.sender, "Only item owner can perform this operation");
      require(msg.value == listPrice, "Price must be equal to listing price");
      idToMarketToken[tokenID].sold = false;
      idToMarketToken[tokenID].price = price;
      idToMarketToken[tokenID].seller = payable(msg.sender);
      idToMarketToken[tokenID].owner = payable(address(this));
      _itemsSold.decrement();

      _transfer(msg.sender, address(this), tokenID);
    }

    /* Creates the sale of a marketplace item */
    /* Transfers ownership of the item, as well as funds between parties */
    function createSale(
      uint256 tokenID
      ) public payable {
      uint price = idToMarketToken[tokenID].price;
      address seller = idToMarketToken[tokenID].seller;
      require(msg.value == price, "Please submit the asking price in order to complete the purchase");
      idToMarketToken[tokenID].owner = payable(msg.sender);
      idToMarketToken[tokenID].sold = true;
      idToMarketToken[tokenID].seller = payable(address(0));
      _itemsSold.increment();
      _transfer(address(this), msg.sender, tokenID);
      payable(owner).transfer(listPrice);
      payable(seller).transfer(msg.value);
    }

    /* Returns all unsold market items */
    function fetchMarketTokens() public view returns (MarketToken[] memory) {
      uint tokenCount = _tokenIDs.current();
      uint unsoldTokenCount = _tokenIDs.current() - _itemsSold.current();
      uint currInd = 0;

      MarketToken[] memory items = new MarketToken[](unsoldTokenCount);
      for (uint i = 0; i < tokenCount; i++) {
        if (idToMarketToken[i + 1].owner == address(this)) {
          uint currentId = i + 1;
          MarketToken storage currToken = idToMarketToken[currentId];
          items[currInd] = currToken;
          currInd += 1;
        }
      }
      return items;
    }

    /* Returns only items that a user has purchased */
    function fetchMyNFTs() public view returns (MarketToken[] memory) {
      uint totalTokenCount = _tokenIDs.current();
      uint tokenCount = 0;
      uint currInd = 0;

      for (uint i = 0; i < totalTokenCount; i++) {
        if (idToMarketToken[i + 1].owner == msg.sender) {
          tokenCount += 1;
        }
      }

      MarketToken[] memory items = new MarketToken[](tokenCount);
      for (uint i = 0; i < totalTokenCount; i++) {
        if (idToMarketToken[i + 1].owner == msg.sender) {
          uint currentId = i + 1;
          MarketToken storage currToken = idToMarketToken[currentId];
          items[currInd] = currToken;
          currInd += 1;
        }
      }
      return items;
    }

    /* Returns only items a user has listed */
    function fetchTokensListed() public view returns (MarketToken[] memory) {
      uint totalTokenCount = _tokenIDs.current();
      uint tokenCount = 0;
      uint currInd = 0;

      for (uint i = 0; i < totalTokenCount; i++) {
        if (idToMarketToken[i + 1].seller == msg.sender) {
          tokenCount += 1;
        }
      }

      MarketToken[] memory items = new MarketToken[](tokenCount);
      for (uint i = 0; i < totalTokenCount; i++) {
        if (idToMarketToken[i + 1].seller == msg.sender) {
          uint currentId = i + 1;
          MarketToken storage currToken = idToMarketToken[currentId];
          items[currInd] = currToken;
          currInd += 1;
        }
      }
      return items;
    }
}
