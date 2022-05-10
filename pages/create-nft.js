import { useState } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

import {
  marketplaceAddress
} from '../config'

import SMTMarketplace from '../artifacts/contracts/SMTMarketplace.sol/SMTMarketplace.json'

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null)
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '', category: '' })
  const router = useRouter()

  async function onChange(e) {
    /* upload image to IPFS */
    const file = e.target.files[0]
    try {
      const added = await client.add(
        file,
        {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      )
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      setFileUrl(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }
  }
  async function uploadToIPFS() {
    const { name, description, category, price } = formInput
    if (!name || !description || !category || !price || !fileUrl) return
    /* first, upload metadata to IPFS */
    const data = JSON.stringify({
      name, description, category, image: fileUrl
    })
    try {
      const added = await client.add(data)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      /* after metadata is uploaded to IPFS, return the URL to use it in the transaction */
      return url
    } catch (error) {
      console.log('Error uploading file: ', error)
    }
  }

  async function listNFTInMarket() {
    const url = await uploadToIPFS()
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    /* create the NFT */
    const price = ethers.utils.parseUnits(formInput.price, 'ether')
    let contract = new ethers.Contract(marketplaceAddress, SMTMarketplace.abi, signer)
    let listPrice = await contract.getListPrice()
    listPrice = listPrice.toString()
    let transaction = await contract.createToken(url, price, { value: listPrice })
    await transaction.wait()

    router.push('/')
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input
          placeholder="Asset Name"
          className="mt-8 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
        />
        <textarea
          placeholder="Asset Description"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
        />
        {/*<textarea*/}
        {/*  placeholder="Asset Category"*/}
        {/*  className="mt-2 border rounded p-4"*/}
        {/*  onChange={e => updateFormInput({ ...formInput, category: e.target.value })}*/}
        {/*/>*/}

        <select
            className={'mt-2 border rounded p-4'}
            onChange={e => updateFormInput({...formInput, category: e.target.value})}
        >
          <option value="" selected={true} disabled={true}>Select file type...</option>
          <option value="image">Image</option>
          <option value="video">Video</option>
          <option value="audio">Audio</option>
        </select>

        <input
          placeholder="Asset Price in Eth"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
        />
        <input
          type="file"
          name="Asset"
          className="my-4"
          onChange={onChange}
        />
        {
          fileUrl && (
            <img className="rounded mt-4" width="350" src={fileUrl} />
          )
        }
        <button
            onClick={listNFTInMarket}
            className={`
            font-bold mt-4 bg-green-500 text-white rounded p-4 shadow-lg disabled:opacity-75 disabled:cursor-not-allowed
            `}
            disabled={formInput.name.length === 0 || formInput.category.length === 0 || formInput.price.length === 0 || !fileUrl}
        >
          Create NFT
        </button>
      </div>
    </div>
  )
}
