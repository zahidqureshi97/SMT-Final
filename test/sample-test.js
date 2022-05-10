describe("SMTMarket", function() {
  it("Should create and execute market sales", async function() {
    /* deploy the marketplace */
    const SMTMarketplace = await ethers.getContractFactory("SMTMarketplace")
    const smtMarketplace = await SMTMarketplace.deploy()
    await smtMarketplace.deployed()

    let listPrice = await smtMarketplace.getListPrice()
    listPrice = listPrice.toString()

    const auctionPrice = ethers.utils.parseUnits('1', 'ether')

    /* create two tokens */
    await smtMarketplace.createToken("https://www.mytokenlocation.com", auctionPrice, { value: listPrice })
    await smtMarketplace.createToken("https://www.mytokenlocation2.com", auctionPrice, { value: listPrice })

    const [_, buyerAddress] = await ethers.getSigners()

    /* execute sale of token to another user */
    await smtMarketplace.connect(buyerAddress).createSale(1, { value: auctionPrice })

    /* resell a token */
    await smtMarketplace.connect(buyerAddress).reListToken(1, auctionPrice, { value: listPrice })

    /* query for and return the unsold items */
    items = await smtMarketplace.fetchMarketTokens()
    items = await Promise.all(items.map(async i => {
      const tokenUri = await smtMarketplace.tokenURI(i.tokenID)
      let item = {
        price: i.price.toString(),
        tokenID: i.tokenID.toString(),
        seller: i.seller,
        owner: i.owner,
        tokenUri
      }
      return item
    }))
    console.log('items: ', items)
  })
})
