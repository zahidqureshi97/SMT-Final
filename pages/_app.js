import '../styles/globals.css'
import Link from 'next/link'
import Image from 'next/image'
import logo from '../img/logo.png'

function MyApp({ Component, pageProps }) {
  return (
    <div>
<nav className='flex items-center flex-wrap bg-blue-400 p-3 '>
        <Link href='/'>
          <a className='inline-flex items-center p-2 mr-4 '>
          <Image alt="SMT" src={logo} layout="fixed" width={75} height={75}/>
            <span className='text-xl text-white font-bold tracking-wide'>
              Something Marketplace
            </span>
          </a>
        </Link>
        <div className='hidden w-full lg:inline-flex lg:flex-grow lg:w-auto'>
          <div className='lg:inline-flex lg:flex-row lg:ml-auto lg:w-auto w-full lg:items-center items-start  flex flex-col lg:h-auto'>
            <Link href='/'>
              <a className='lg:inline-flex lg:w-auto w-full px-3 py-2 rounded text-white font-bold items-center justify-center hover:bg-blue-600 hover:text-white '>
                Home
              </a>
            </Link>
            <Link href='/create-nft'>
              <a className='lg:inline-flex lg:w-auto w-full px-3 py-2 rounded text-white font-bold items-center justify-center hover:bg-blue-600 hover:text-white'>
                Create NFT
              </a>
            </Link>
            <Link href='/my-nfts'>
              <a className='lg:inline-flex lg:w-auto w-full px-3 py-2 rounded text-white font-bold items-center justify-center hover:bg-blue-600 hover:text-white'>
                My NFTs
              </a>
            </Link>
            <Link href='/my-listings'>
              <a className='lg:inline-flex lg:w-auto w-full px-3 py-2 rounded text-white font-bold items-center justify-center hover:bg-blue-600 hover:text-white'>
                My Listings
              </a>
            </Link>
          </div>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp
