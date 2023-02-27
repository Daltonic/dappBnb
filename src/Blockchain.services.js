import abi from "./abis/src/contracts/DappBnb.sol/DappBnb.json";
import address from "./abis/contractAddress.json";
import { getGlobalState, setGlobalState } from "./store";
import { ethers } from "ethers";

const { ethereum } = window;
const contractAddress = address.address;
const contractAbi = abi.abi;
let tx

const toWei = (num) => ethers.utils.parseEther(num.toString());

const getEtheriumContract = () => {
  const connectedAccount = getGlobalState("connectedAccount");

  if (connectedAccount) {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractAbi, signer);

    return contract;
  } else {
    return getGlobalState("contract");
  }
};

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
  const connectedAccount = getGlobalState("connectedAccount");
  const contract = getEtheriumContract();
  price = toWei(price);
  tx = await contract.createAppartment(name, description, images, rooms, price, {
    from: connectedAccount,
  });
  tx.wait()
};

const updateAppartment = async ({
  id,
  name,
  description,
  rooms,
  images,
  price,
}) => {
  const connectedAccount = getGlobalState("connectedAccount");
  const contract = getEtheriumContract();
  price = toWei(price);
  tx = await contract.updateAppartment(id, name, description, images, rooms, price, {
    from: connectedAccount,
  });
  tx.wait()
};

const deleteAppartment = async (id) => {
  const connectedAccount = getGlobalState("connectedAccount");
  const contract = getEtheriumContract();
  tx = await contract.deleteAppartment(id, {
    from: connectedAccount,
  });
  tx.wait()
};

const loadAppartments = async () => {
  const contract = getEtheriumContract();
  const appartments = await contract.getApartments();
  setGlobalState("appartments", structureAppartments(appartments));
};

const loadAppartment = async (id) => {
  try{
    const contract = getEtheriumContract();
    const appartment = await contract.apartments(id);
    setGlobalState("appartment", structureAppartments([appartment])[0]);
  }catch (error) {
    console.log(error)  
  }
};


const reportError = (error) => {
  console.log(error.message);
  throw new Error("No ethereum object.");
};

const structureAppartments = (appartments) =>
  appartments.map((appartment) => ({
    id: Number(appartment.id),
    name: appartment.name,
    owner: appartment.owner.toLowerCase(),
    description: appartment.description,
    price: parseInt(appartment.price._hex) / 10 ** 18,
    deleted: appartment.deleted,
    images: appartment.images,
    rooms: Number(appartment.rooms),
    timestamp: new Date(appartment.timestamp * 1000).toDateString(),
    booked: appartment.booked,
  }));

export {
  isWallectConnected,
  connectWallet,
  createAppartment,
  loadAppartments,
  loadAppartment,
  updateAppartment,
  deleteAppartment,
};
