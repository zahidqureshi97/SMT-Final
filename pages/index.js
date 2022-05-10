import {ethers} from 'ethers'
import {useEffect, useState} from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'

import {
	marketplaceAddress
} from '../config'

import SMTMarketplace from '../artifacts/contracts/SMTMarketplace.sol/SMTMarketplace.json'

export default function Home() {
	const [nfts, setNfts] = useState([]);
	const [filteredNfts, setFilteredNfts] = useState([]);
	const [groupedNfts, setGroupedNfts] = useState({});
	const [categoryNames, setCategoryNames] = useState([]);
	const [search, setSearch] = useState('');
	const [loadingState, setLoadingState] = useState('not-loaded')
	useEffect(() => {
		loadNFTs()
	}, [])

	useEffect(() => {
		if (search.length == 0) {
			setFilteredNfts(nfts);
		}

		const newList = nfts.filter(nft => {
			return nft.name.toLowerCase().includes(search.toLowerCase());
		});

		setFilteredNfts(newList);
	}, [search]);

	async function loadNFTs() {
		/* create a generic provider and query for unsold market items */
		const provider = new ethers.providers.JsonRpcProvider()
		const contract = new ethers.Contract(marketplaceAddress, SMTMarketplace.abi, provider)
		const data = await contract.fetchMarketTokens()

		/*
		*  map over items returned from smart contract and format
		*  them as well as fetch their token metadata
		*/
		const items = await Promise.all(data.map(async i => {
			const tokenUri = await contract.tokenURI(i.tokenID)
			const meta = await axios.get(tokenUri)
			let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
			let item = {
				price,
				tokenID: i.tokenID.toNumber(),
				seller: i.seller,
				owner: i.owner,
				image: meta.data.image,
				name: meta.data.name,
				description: meta.data.description,
				category: meta.data.category
			}
			return item
		}))
		setNfts(items)
		setFilteredNfts(items);

		const groupedList = items.reduce((hashMap, curr) => {
			if (hashMap[curr.category]) {
				hashMap[curr.category].push(curr);
			} else {
				hashMap[curr.category] = [curr];
			}

			return hashMap;
		}, {});

		setGroupedNfts(groupedList);
		setCategoryNames(Object.getOwnPropertyNames(groupedList));
		console.log(groupedList);
		console.log(Object.getOwnPropertyNames(groupedList));

		setLoadingState('loaded')
	}

	async function buyNft(nft) {
		/* needs the user to sign the transaction, so will use Web3Provider and sign it */
		const web3Modal = new Web3Modal()
		const connection = await web3Modal.connect()
		const provider = new ethers.providers.Web3Provider(connection)
		const signer = provider.getSigner()
		const contract = new ethers.Contract(marketplaceAddress, SMTMarketplace.abi, signer)

		/* user will be prompted to pay the asking proces to complete the transaction */
		const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
		const transaction = await contract.createSale(nft.tokenID, {
			value: price
		})
		await transaction.wait()
		loadNFTs()
	}

	if (loadingState === 'loaded' && !nfts.length) return (
		<h1 className="px-20 py-10 text-3xl">No NFTs in marketplace</h1>)
	return (
		<div className="flex justify-center">
			<div className="px-4" style={{maxWidth: '1600px'}}>
				<div>
					<input
						type="search"
						value={search}
						onChange={e => setSearch(e.target.value)}
						placeholder={"Search NFTs..."}
						className={'border border-gray-500 rounded p-3 w-full mt-4'}
					/>
				</div>
				<div className={`flex ${search.length === 0 ? 'flex-col' : 'gap-4'} pt-4`}>
					{search.length == 0 ?
						categoryNames.map((category, i) => (
							<div className={'w-full flex flex-col gap-4'} key={category}>
								<div className={'text-3xl font-medium'}>{category}</div>
								<div className={'flex mb-4 gap-4'}>
									{groupedNfts[category].map((nft, i) => (
										<div key={nft.name} className="border shadow rounded-xl overflow-hidden w-1/4">
											<img src={nft.image}/>
											<div className="p-4">
												<p style={{height: '64px'}}
												   className="text-2xl font-semibold">{nft.name}</p>
												<div style={{height: '70px', overflow: 'hidden'}}>
													<p className="text-gray-400">{nft.description}</p>
													<p className="text-gray-400">{nft.category}</p>
												</div>
											</div>
											<div className="p-4 bg-black">
												<p className="text-2xl font-bold text-white">{nft.price} ETH</p>
												<button
													className="mt-4 w-full bg-yellow-500 text-white font-bold py-2 px-12 rounded"
													onClick={() => buyNft(nft)}>Buy
												</button>
											</div>
										</div>
									))}
								</div>
							</div>
						))
						: filteredNfts.map((nft, i) => (
							<div key={nft.name} className="border shadow rounded-xl overflow-hidden w-1/4">
								<img src={nft.image}/>
								<div className="p-4">
									<p style={{height: '64px'}}
									   className="text-2xl font-semibold">{nft.name}</p>
									<div style={{height: '70px', overflow: 'hidden'}}>
										<p className="text-gray-400">{nft.description}</p>
										<p className="text-gray-400">{nft.category}</p>
									</div>
								</div>
								<div className="p-4 bg-black">
									<p className="text-2xl font-bold text-white">{nft.price} ETH</p>
									<button
										className="mt-4 w-full bg-yellow-500 text-white font-bold py-2 px-12 rounded"
										onClick={() => buyNft(nft)}>Buy
									</button>
								</div>
							</div>
						))}
				</div>
			</div>
		</div>
	)
}
