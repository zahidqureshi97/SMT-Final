const hre = require("hardhat");
const fs = require('fs');

async function main() {
  const SMTMarketplace = await hre.ethers.getContractFactory("SMTMarketplace");
  const smtMarketplace = await SMTMarketplace.deploy();
  await smtMarketplace.deployed();
  console.log("smtMarketplace deployed to:", smtMarketplace.address);

  fs.writeFileSync('./config.js', `
  export const marketplaceAddress = "${smtMarketplace.address}"
  `)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
