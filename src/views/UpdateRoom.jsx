import { FaTimes } from 'react-icons/fa'
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { loadAppartment, updateApartment } from '../Blockchain.services'
import { truncate, useGlobalState } from '../store'
import { toast } from 'react-toastify'

const UpdateRoom = () => {
  const { id } = useParams()
  const [appartment] = useGlobalState('appartment')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [rooms, setRooms] = useState('')
  const [images, setImages] = useState('')
  const [price, setPrice] = useState('')
  const [links, setLinks] = useState([])
  const navigate = useNavigate()

  useEffect(async () => {
    await loadAppartment(id)
    if (!name) {
      setName(appartment?.name.split(',')[0])
      setLocation(appartment?.name.split(',')[1])
      setDescription(appartment?.description)
      setRooms(appartment?.rooms)
      setPrice(appartment?.price)
      setLinks(appartment?.images)
    }
  }, [appartment])

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (
      !name ||
      !location ||
      !description ||
      !rooms ||
      links.length != 5 ||
      !price
    )
      return
    const params = {
      id,
      name: `${name}, ${location}`,
      description,
      rooms,
      images: links.slice(0, 5).join(','),
      price,
    }

    await toast.promise(
      new Promise(async (resolve, reject) => {
        await updateApartment(params)
          .then(async () => {
            onReset()
            loadAppartment(id)
            navigate(`/room/${id}`)
            resolve()
          })
          .catch(() => reject())
      }),
      {
        pending: 'Approve transaction...',
        success: 'apartment updated successfully 👌',
        error: 'Encountered error 🤯',
      }
    )
    console.log(links)
  }

  const onReset = () => {
    setName('')
    setDescription('')
    setLocation('')
    setRooms('')
    setPrice('')
    setImages('')
  }

  return (
    <div className="h-screen flex justify-center mx-auto">
      <div className="w-11/12 md:w-2/5 h-7/12 p-6">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex justify-center items-center">
            <p className="font-semibold text-black">Edit Room</p>
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
              value={name || ''}
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
              value={price || ''}
              required
            />
          </div>

          <div className="flex flex-row justify-between items-center border border-gray-300 p-2 rounded-xl mt-5">
            <input
              className="block text-sm flex-1
                text-slate-500 bg-transparent border-0
                focus:outline-none focus:ring-0"
              type="url"
              name="images"
              placeholder="Images"
              onChange={(e) => setImages(e.target.value)}
              value={images || ''}
            />
            {links?.length != 5 ? (
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
            {links?.map((link, i) => (
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
              value={location || ''}
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
              value={rooms || ''}
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
              value={description || ''}
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
            Update Appartment
          </button>
        </form>
      </div>
    </div>
  )
}

export default UpdateRoom
