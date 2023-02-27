import { useEffect } from 'react'
import { FaEthereum, FaStar } from 'react-icons/fa'
import { CiEdit } from 'react-icons/ci'
import { FiCalendar } from 'react-icons/fi'
import { MdDeleteOutline } from 'react-icons/md'
import { BiBookOpen, BiMedal } from 'react-icons/bi'
import { useGlobalState } from '../store'
import Identicon from 'react-identicons'
import { Link, useParams } from 'react-router-dom'
import { deleteAppartment, loadAppartment } from '../Blockchain.services'

const Room = () => {
  const { id } = useParams()
  const [comments] = useGlobalState('comments')
  const [appartment] = useGlobalState('appartment')

  useEffect(async () => {
    await loadAppartment(id)
  }, [])
  return (
    <div className="py-8 px-10 sm:px-20 md:px-32">
      <RoomHeader
        name={appartment?.name}
        id={appartment?.id}
        owner={appartment?.owner}
      />

      <RoomGrid
        first={appartment?.images.split(',')[0]}
        second={appartment?.images.split(',')[1]}
        third={appartment?.images.split(',')[2]}
        forth={appartment?.images.split(',')[3]}
        fifth={appartment?.images.split(',')[4]}
      />

      <RoomDeescription
        description={appartment?.description}
        rooms={appartment?.rooms}
        price={appartment?.price}
      />

      <RoomReviews />

      <div className="flex justify-between flex-wrap">
        {comments.map((comment, i) => (
          <RoomComments key={i} comment={comment} />
        ))}
      </div>
    </div>
  )
}

const RoomHeader = ({ name, id, owner }) => {
  const [connectedAccount] = useGlobalState('connectedAccount')

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete?')) {
      await deleteAppartment(id)
      alert('Room Deleted')
    } else {
      console.log('Not deleted')
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold"> {name}</h1>
      <div className="flex justify-between">
        <div className="flex items-center mt-2 space-x-2 text-xl font-lg">
          6 reviews
        </div>
        {connectedAccount == owner ? (
          <div className="text-xl flex items-center space-x-4">
            <Link
              to={'/editRoom/' + id}
              className="flex items-center justify-center space-x-1"
            >
              <CiEdit />
              <span>Edit</span>
            </Link>
            <div
              onClick={handleDelete}
              className="flex items-center justify-center space-x-1 text-red-500 cursor-pointer"
            >
              <MdDeleteOutline />
              <span>Delete</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

const RoomGrid = ({ first, second, third, forth, fifth }) => {
  return (
    <div className="mt-8 flex rounded-2xl overflow-hidden">
      <div className="md:w-1/2 w-full">
        <img src={first} alt="" className="object-cover h-full" />
      </div>
      <div className="w-1/2 md:flex hidden flex-wrap">
        <img src={second} alt="" className="object-cover w-1/2 h-64 pl-2 pb-1 pr-1" />
        <img src={third} alt="" className="object-cover w-1/2 h-64 pl-1 pb-1" />
        <img src={forth} alt="" className="object-cover w-1/2 h-64 pt-1 pl-2 pr-1" />
        <img src={fifth} alt="" className="object-cover sm:w-2/5 md:w-1/2 h-64 pl-1 pt-1" />
      </div>
    </div>
  )
}

const RoomDeescription = ({ description, rooms, price }) => {
  return (
    <>
      <div className="py-10 border-b-2 border-b-slate-200 w-3/4">
        <div className="flex space-x-4 text-xl mt-2">
          <p>{rooms} rooms</p>
          <p className="flex items-center">
            <FaEthereum />
            {price}
          </p>
        </div>
      </div>
      <div className="py-10 border-b-2 border-b-slate-200 space-y-4">
        <div className=" flex space-x-4 ">
          <div>
            <p className="text-slate-500 text-lg">{description}</p>
          </div>
        </div>
        <div className=" flex space-x-4 ">
          <BiBookOpen className="text-4xl" />
          <div>
            <h1 className="text-xl font-semibold">Featured in</h1>
            <p>Condé Nast Traveler, June 2021</p>
          </div>
        </div>
        <div className=" flex space-x-4">
          <BiMedal className="text-4xl" />
          <div>
            <h1 className="text-xl font-semibold">
              Vittorio Emanuele is a Superhost
            </h1>
            <p>
              Superhosts are experienced, highly rated hosts who are committed
              to providing great stays for guests.
            </p>
          </div>
        </div>
        <div className=" flex space-x-4">
          <FiCalendar className="text-4xl" />
          <div>
            <h1 className="text-xl font-semibold">
              Free cancellation before Oct 17.
            </h1>
          </div>
        </div>
      </div>
    </>
  )
}

const RoomReviews = () => {
  return (
    <>
      <div className="pt-10 flex items-center space-x-2 text-2xl font-semibold">
        <h4>5.0 · 47 reviews </h4>
        <FaStar />
      </div>
    </>
  )
}

const RoomComments = ({ comment }) => {
  return (
    <div className="w-1/2 pr-5 space-y-5">
      <div className="pt-10 flex items-center space-x-5">
        <Identicon
          string={comment.name}
          size={30}
          className="rounded-full shadow-black shadow-sm"
        />
        <div>
          <p className="text-xl font-semibold">{comment.name} </p>
          <p className="text-slate-500 text-lg">{comment.date}</p>
        </div>
      </div>
      <p className="text-xl">{comment.text}</p>
    </div>
  )
}

export default Room
