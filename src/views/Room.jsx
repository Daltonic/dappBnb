import { useEffect, useState } from 'react'
import { FaEthereum } from 'react-icons/fa'
import { CiEdit } from 'react-icons/ci'
import { FiCalendar } from 'react-icons/fi'
import { MdDeleteOutline } from 'react-icons/md'
import { BiBookOpen, BiMedal } from 'react-icons/bi'
import { BsChatLeft } from 'react-icons/bs'
import Identicon from 'react-identicons'
import { Link, useParams, useNavigate } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import { useGlobalState, setGlobalState, truncate } from '../store'
import AddReview from '../components/AddReview'
import moment from 'moment'
import { toast } from 'react-toastify'
import { loginWithCometChat, signUpWithCometChat } from '../services/Chat'
import {
  deleteAppartment,
  loadAppartment,
  loadReviews,
  loadAppartments,
  appartmentBooking,
  returnSecurityFee,
  getUnavailableDates,
} from '../Blockchain.services'

const Room = () => {
  const { id } = useParams()
  const [appartment] = useGlobalState('appartment')
  const [reviews] = useGlobalState('reviews')
  const [securityFee] = useGlobalState('securityFee')

  const handleReviewOpen = () => {
    setGlobalState('reviewModal', 'scale-100')
  }

  useEffect(async () => {
    await loadAppartment(id)
    await loadReviews(id)
    await returnSecurityFee()
  }, [])

  return (
    <div className="py-8 px-10 sm:px-20 md:px-32 space-y-8">
      <RoomHeader name={appartment?.name} rooms={appartment?.rooms} />

      <RoomGrid
        first={appartment?.images[0]}
        second={appartment?.images[1]}
        third={appartment?.images[2]}
        forth={appartment?.images[3]}
        fifth={appartment?.images[4]}
      />

      <RoomDescription description={appartment?.description} />
      <RoomCalendar price={appartment?.price} securityFee={securityFee} />
      <RoomButtons id={appartment?.id} owner={appartment?.owner} />

      <div className="flex flex-col justify-between flex-wrap space-y-2">
        <h1 className="text-xl font-semibold">Reviews</h1>
        <div>
          {reviews.length > 0
            ? reviews.map((review, index) => (
                <RoomComments key={index} review={review} />
              ))
            : 'No reviews yet!'}
        </div>
      </div>
      <p
        className="underline mt-11 cursor-pointer hover:text-blue-700"
        onClick={handleReviewOpen}
      >
        Drop your review
      </p>

      <AddReview />
    </div>
  )
}

const RoomHeader = ({ name, rooms }) => {
  return (
    <div>
      <h1 className="text-3xl font-semibold">{name}</h1>
      <div className="flex justify-between">
        <div className="flex items-center mt-2 space-x-2 text-lg text-slate-500">
          <span>
            {rooms} {rooms == 1 ? 'room' : 'rooms'}
          </span>
        </div>
      </div>
    </div>
  )
}

const RoomButtons = ({ id, owner }) => {
  const [currentUser] = useGlobalState('currentUser')
  const [connectedAccount] = useGlobalState('connectedAccount')
  const navigate = useNavigate()

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete?')) {
      await toast.promise(
        new Promise(async (resolve, reject) => {
          await deleteAppartment(id)
            .then(async () => {
              navigate('/')
              await loadAppartments()
              resolve()
            })
            .catch(() => reject())
        }),
        {
          pending: 'Approve transaction...',
          success: 'apartment deleted successfully 👌',
          error: 'Encountered error 🤯',
        }
      )
    }
  }

  const handleSignUp = async () => {
    await toast.promise(
      new Promise(async (resolve, reject) => {
        await signUpWithCometChat()
          .then(() => resolve())
          .catch((error) => reject(error))
      }),
      {
        pending: 'Registering...',
        success: 'Account created, please login 👌',
        error: 'Encountered error 🤯',
      }
    )
  }

  const handleLogin = async () => {
    await toast.promise(
      new Promise(async (resolve, reject) => {
        await loginWithCometChat()
          .then(async (user) => {
            setGlobalState('currentUser', user)
            resolve(user)
          })
          .catch((error) => reject(error))
      }),
      {
        pending: 'Authenticating...',
        success: 'Logged in successfully 👌',
        error: 'Encountered error 🤯',
      }
    )
  }

  return (
    <div className="flex justify-start items-center space-x-3 border-b-2 border-b-slate-200 pb-6">
      {currentUser && currentUser.status != 'offline' ? (
        <Link
          to={`/chats/${owner}`}
          className="p-2 rounded-md shadow-lg border-[0.1px]
          border-gray-300 flex justify-start items-center space-x-1
          bg-white z-50 hover:bg-gray-100"
        >
          <BsChatLeft size={15} className="text-pink-500" />
          <small>Chats</small>
        </Link>
      ) : (
        <>
          <button
            className="p-2 rounded-md shadow-lg border-[0.1px]
            border-gray-300 flex justify-start items-center space-x-1
            bg-white z-50 hover:bg-gray-100"
            onClick={handleSignUp}
          >
            <small>Sign up</small>
          </button>
          <button
            className="p-2 rounded-md shadow-lg border-[0.1px]
            border-gray-300 flex justify-start items-center space-x-1
            bg-white z-50 hover:bg-gray-100"
            onClick={handleLogin}
          >
            <small>Login to chat</small>
          </button>
        </>
      )}

      {connectedAccount == owner ? (
        <>
          <Link
            to={'/editRoom/' + id}
            className="p-2 rounded-md shadow-lg border-[0.1px]
            border-gray-500 flex justify-start items-center space-x-1
            bg-gray-500 z-50 hover:bg-transparent hover:text-gray-500 text-white"
          >
            <CiEdit size={15} />
            <small>Edit</small>
          </Link>
          <button
            className="p-2 rounded-md shadow-lg border-[0.1px]
            border-pink-500 flex justify-start items-center space-x-1
            bg-pink-500 z-50 hover:bg-transparent hover:text-pink-500 text-white"
            onClick={handleDelete}
          >
            <MdDeleteOutline size={15} />
            <small>Delete</small>
          </button>
        </>
      ) : null}
    </div>
  )
}

const RoomGrid = ({ first, second, third, forth, fifth }) => {
  return (
    <div className="mt-8 h-[32rem] flex rounded-2xl overflow-hidden">
      <div className="md:w-1/2 w-full overflow-hidden">
        <img className='object-cover h-full' src={first} />
      </div>
      <div className="w-1/2 md:flex hidden flex-wrap">
        <img src={second} className="object-cover w-1/2 h-64 pl-2 pb-1 pr-1" />
        <img src={third} alt="" className="object-cover w-1/2 h-64 pl-1 pb-1" />
        <img src={forth} className="object-cover w-1/2 h-64 pt-1 pl-2 pr-1" />
        <img
          src={fifth}
          className="object-cover sm:w-2/5 md:w-1/2 h-64 pl-1 pt-1"
        />
      </div>
    </div>
  )
}

const RoomDescription = ({ description }) => {
  return (
    <div className="py-5 border-b-2 border-b-slate-200 space-y-4">
      <h1 className="text-xl font-semibold">Description</h1>
      <p className="text-slate-500 text-lg w-full sm:w-4/5">{description}</p>

      <div className=" flex space-x-4 ">
        <BiBookOpen className="text-4xl" />
        <div>
          <h1 className="text-xl font-semibold">Featured in</h1>
          <p className="cursor-pointer">Condé Nast Traveler, June 2023</p>
        </div>
      </div>
      <div className=" flex space-x-4">
        <BiMedal className="text-4xl" />
        <div>
          <h1 className="text-xl font-semibold">
            Vittorio Emanuele is a Superhost
          </h1>
          <p>
            Superhosts are experienced, highly rated hosts who are committed to
            providing great stays for guests.
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
  )
}

const RoomCalendar = ({ price, securityFee }) => {
  const [checkInDate, setCheckInDate] = useState(null)
  const [checkOutDate, setCheckOutDate] = useState(null)
  const { id } = useParams()
  const [timestamps] = useGlobalState('timestamps')

  useEffect(async () => await getUnavailableDates(id))

  const handleCheckInDateChange = (date) => {
    setCheckInDate(date)
  }

  const handleCheckOutDateChange = (date) => {
    setCheckOutDate(date)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!checkInDate || !checkOutDate) return
    const start = moment(checkInDate)
    const end = moment(checkOutDate)
    const timestampArray = []

    while (start <= end) {
      timestampArray.push(start.valueOf())
      start.add(1, 'days')
    }

    const params = {
      id,
      datesArray: timestampArray,
      amount: price * timestampArray.length + securityFee,
    }

    await toast.promise(
      new Promise(async (resolve, reject) => {
        await appartmentBooking(params)
          .then(async () => {
            resetForm()
            resolve()
          })
          .catch(() => reject())
      }),
      {
        pending: 'Approve transaction...',
        success: 'apartment booked successfully 👌',
        error: 'Encountered error 🤯',
      }
    )
  }

  const resetForm = () => {
    setCheckInDate(null)
    setCheckOutDate(null)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="sm:w-[25rem] border-[0.1px] p-6
            border-gray-400 rounded-lg shadow-lg flex flex-col
            space-y-4"
    >
      <div className="flex justify-between">
        <div className="flex justify-center items-center">
          <FaEthereum className="text-lg text-gray-500" />
          <span className="text-lg text-gray-500">
            {price} <small>per night</small>
          </span>
        </div>
      </div>

      <DatePicker
        id="checkInDate"
        selected={checkInDate}
        onChange={handleCheckInDateChange}
        placeholderText={'check-in'}
        dateFormat="yyyy-MM-dd"
        minDate={new Date()}
        excludeDates={timestamps}
        required
        className="rounded-lg w-full"
      />
      <DatePicker
        id="checkOutDate"
        selected={checkOutDate}
        onChange={handleCheckOutDateChange}
        placeholderText={'check-out'}
        dateFormat="yyyy-MM-dd"
        minDate={checkInDate}
        excludeDates={timestamps}
        required
        className="rounded-lg w-full"
      />
      <button
        className="p-2 border-none bg-gradient-to-l from-pink-600
              to-gray-600 text-white w-full rounded-md focus:outline-none
              focus:ring-0"
      >
        Book
      </button>

      <Link to={`/bookings/${id}`} className="text-pink-500">
        Check your bookings
      </Link>
    </form>
  )
}

const RoomComments = ({ review }) => {
  return (
    <div className="w-1/2 pr-5 space-y-5">
      <div className="pt-10 flex items-center space-x-5">
        <Identicon
          string={review.owner}
          size={30}
          className="rounded-full shadow-black shadow-sm"
        />
        <div>
          <p className="text-xl font-semibold">
            {truncate(review.owner, 4, 4, 11)}{' '}
          </p>
          <p className="text-slate-500 text-lg">{review.timestamp}</p>
        </div>
      </div>
      <p className="text-xl">{review.reviewText}</p>
    </div>
  )
}

export default Room
