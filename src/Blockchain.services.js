import abi from "./abis/src/contracts/DappBnb.sol/DappBnb.json";
import address from "./abis/contractAddress.json";
import { getGlobalState, setGlobalState } from "./store";
import { ethers } from "ethers";

const { ethereum } = window;
const contractAddress = address.address;
const contractAbi = abi.abi;
let tx

const toWei = (num) => ethers.utils.parseEther(num.toString());

const getEthereumContract = async () => {
  const connectedAccount = getGlobalState('connectedAccount')

  if (connectedAccount) {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const contracts = new ethers.Contract(contractAddress, contractAbi, signer)

    return contracts
  } else {
    return getGlobalState('contract')
  }
}

const isWallectConnected = async () => {
  try {
    if (!ethereum) return alert("Please install Metamask");
    const accounts = await ethereum.request({ method: "eth_accounts" });

    window.ethereum.on("chainChanged", (chainId) => {
      window.location.reload();
    });

    window.ethereum.on("accountsChanged", async () => {
      setGlobalState("connectedAccount", accounts[0]);
      await isWallectConnected();
    });

    if (accounts.length) {
      setGlobalState("connectedAccount", accounts[0]);
    } else {
      alert("Please connect wallet.");
      console.log("No accounts found.");
    }
  } catch (error) {
    reportError(error);
  }
};

const connectWallet = async () => {
  try {
    if (!ethereum) return alert("Please install Metamask");
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    setGlobalState("connectedAccount", accounts[0]);
  } catch (error) {
    reportError(error);
  }
};

const createAppartment = async ({
  name,
  description,
  rooms,
  images,
  price,
}) => {
  try{
    const connectedAccount = getGlobalState("connectedAccount");
    const contract = await getEthereumContract();
    price = toWei(price);
    tx = await contract.createAppartment(name, description, images, rooms, price, {
      from: connectedAccount,
    });
    tx.wait()
    await loadAppartments()
  }catch(err) {
    reportError(err)
  }
};

const updateApartment = async ({
  id,
  name,
  description,
  rooms,
  images,
  price,
}) => {
  try{

   const connectedAccount = getGlobalState("connectedAccount");
   const contract = await getEthereumContract();
   price = toWei(price);
   tx = await contract.updateAppartment(id, name, description, images, rooms, price, {
     from: connectedAccount,
   });
   tx.wait()
   await loadAppartments()
  }catch(err) {
    reportError(err)
  }
};

const deleteAppartment = async (id) => {
  try{
    const connectedAccount = getGlobalState("connectedAccount");
    const contract = await getEthereumContract();
    tx = await contract.deleteAppartment(id,{
      from: connectedAccount,
    });

    tx.wait()
    await loadAppartments()

  }catch(err) {
    reportError(err)
  }
};

const loadAppartments = async () => {
  try{
    const contract = await getEthereumContract();
    const appartments = await contract.getApartments();
    setGlobalState("appartments", structureAppartments(appartments));

  }catch(err) {
    reportError(err)
  }
};

const loadAppartment = async (id) => {
  try{
    const contract = await getEthereumContract();
    const appartment = await contract.getApartment(id);
    setGlobalState("appartment", structureAppartments([appartment])[0]);
  }catch (error) {
    reportError(error)  
  }
};

const appartmentBooking = async (id,datesArray,startDate)=> {
  try{
    const contract = await getEthereumContract()
    const connectedAccount = getGlobalState('connectedAccount')

    tx = await contract.bookApartment(id, datesArray, startDate, {
      from: connectedAccount, 
    })

  }catch(err) {
    console.log(err)
  }

}


const addReview = async ({id,reviewText}) => {
   
    try{
      if (!ethereum) return alert("Please install Metamask")
      const contract = await getEthereumContract()
      tx = await contract.addReview(id,reviewText)
      tx.wait()

      await loadReviews(id)
      
      
    }catch(err) {
        reportError(err)
    }
    
}

const loadReviews = async (id) => {
  try{
    const contract = await getEthereumContract();
    const reviews = await contract.getReviews(id)
    setGlobalState("reviews",structuredReviews(reviews))
  }catch (error) {
    console.log(error)  
  }
}

const structureAppartments = (appartments) =>
  appartments.map((appartment) => ({
    id: Number(appartment.id),
    name: appartment.name,
    owner: appartment.owner.toLowerCase(),
    description: appartment.description,
    price: parseInt(appartment.price._hex) / 10 ** 18,
    deleted: appartment.deleted,
    images: appartment.images.split(','),
    rooms: Number(appartment.rooms),
    timestamp: new Date(appartment.timestamp * 1000).toDateString(),
    booked: appartment.booked,
  }));

  const structuredReviews = (reviews) =>
    reviews.map((review) => ({
      id:review.id.toNumber(),
      appartmentId:review.appartmentId.toNumber(),
      reviewText:review.reviewText,
      owner: review.owner.toLowerCase(),
      timestamp: new Date(review.timestamp * 1000).toDateString()
  }))

export {
  isWallectConnected,
  connectWallet,
  createAppartment,
  loadAppartments,
  loadAppartment,
  updateApartment,
  deleteAppartment,
  appartmentBooking,
  loadReviews,
  addReview
};
