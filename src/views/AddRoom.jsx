import { useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import { createAppartment,loadAppartments } from '../Blockchain.services'
import { truncate } from '../store'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const AddRoom = () => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [rooms, setRooms] = useState('')
  const [images, setImages] = useState('')
  const [price, setPrice] = useState('')
  const [links, setLinks] = useState([])
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !location || !description || !rooms || links.length != 5 || !price)
      return
      
    const params = {
      name: `${name}, ${location}`,
      description,
      rooms,
      images: links.join(','),
      price,
    }

    await toast.promise(
      new Promise(async (resolve, reject) => {
        await createAppartment(params)
          .then(async () => {
            onReset();
            resolve();
            loadAppartments();
            navigate('/')
          })
          .catch(() => reject());
      }),
      {
        pending: "Approve transaction...",
        success: "apartment added successfully 👌",
        error: "Encountered error 🤯",
      }
    );
  }

  const addImage = () => {
    if (links.length != 5) {
      setLinks((prevState) => [...prevState, images])
    }
    setImages('')
  }

  const removeImage = (index) => {
    links.splice(index, 1)
    setLinks(() => [...links])
  }

  //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

  // const isValidImage = (url) => {
  //   let regex = /^https?:\/\/.*\/.*\.(png|gif|webp|jpeg|jpg)\??.*$/gim
  //   return url.match(regex) ? true : false
  // }

  const onReset = () => {
    setName('')
    setDescription('')
    setLocation('')
    setRooms('')
    setPrice('')
    setImages('')
    setLinks([])
  }

  return (
    <div className="h-screen flex justify-center mx-auto">
      <div className="w-11/12 md:w-2/5 h-7/12 p-6">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex justify-center items-center">
            <p className="font-semibold text-black">Add Room</p>
          </div>

          <div className="flex flex-row justify-between items-center border border-gray-300 p-2 rounded-xl mt-5">
            <input
              className="block w-full text-sm
                text-slate-500 bg-transparent border-0
                focus:outline-none focus:ring-0"
              type="text"
              name="name"
              placeholder="Room Name "
              onChange={(e) => setName(e.target.value)}
              value={name}
              required
            />
          </div>

          <div className="flex flex-row justify-between items-center border border-gray-300 p-2 rounded-xl mt-5">
            <input
              className="block w-full text-sm
                text-slate-500 bg-transparent border-0
                focus:outline-none focus:ring-0"
              type="number"
              step={0.01}
              min={0.01}
              name="price"
              placeholder="price (Eth)"
              onChange={(e) => setPrice(e.target.value)}
              value={price}
              required
            />
          </div>

          <div className="flex flex-row justify-between items-center border border-gray-300 p-2 rounded-xl mt-5">
            <input
              className="block flex-1 text-sm
                text-slate-500 bg-transparent border-0
                focus:outline-none focus:ring-0"
              type="url"
              name="images"
              placeholder="Images"
              onChange={(e) => setImages(e.target.value)}
              value={images}
            />
            {links.length != 5 ? (
              <button
                onClick={addImage}
                type="button"
                className="p-2 bg-[#ff385c] text-white rounded-full text-sm"
              >
                Add image link
              </button>
            ) : null}
          </div>
          <div className="flex flex-row justify-start items-center rounded-xl mt-5 space-x-1 flex-wrap">
            {links.map((link, i) => (
              <div
                key={i}
                className="p-2 rounded-full text-gray-500 bg-gray-200 font-semibold
                flex items-center w-max cursor-pointer active:bg-gray-300
                transition duration-300 ease space-x-2 text-xs"
              >
                <span>{truncate(link, 4, 4, 11)}</span>
                <button
                  onClick={() => removeImage(i)}
                  type="button"
                  className="bg-transparent hover focus:outline-none"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
          <div className="flex flex-row justify-between items-center border border-gray-300 p-2 rounded-xl mt-5">
            <input
              className="block w-full text-sm
                text-slate-500 bg-transparent border-0
                focus:outline-none focus:ring-0"
              type="text"
              name="location"
              placeholder="Location"
              onChange={(e) => setLocation(e.target.value)}
              value={location}
              required
            />
          </div>

          <div className="flex flex-row justify-between items-center border border-gray-300 p-2 rounded-xl mt-5">
            <input
              className="block w-full text-sm
                text-slate-500 bg-transparent border-0
                focus:outline-none focus:ring-0"
              type="text"
              name="rooms"
              placeholder="Number of room"
              onChange={(e) => setRooms(e.target.value)}
              value={rooms}
              required
            />
          </div>

          <div className="flex flex-row justify-between items-center border border-gray-300 p-2 rounded-xl mt-5">
            <textarea
              className="block w-full text-sm resize-none
                text-slate-500 bg-transparent border-0
                focus:outline-none focus:ring-0 h-20"
              type="text"
              name="description"
              placeholder="Room Description"
              onChange={(e) => setDescription(e.target.value)}
              value={description}
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="flex flex-row justify-center items-center
              w-full text-white text-md bg-[#ff385c]
              py-2 px-5 rounded-full drop-shadow-xl hover:bg-white
              border-transparent
              hover:hover:text-[#ff385c]
              hover:border-2 hover:border-[#ff385c]
              mt-5"
          >
            Add Appartment
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddRoom
