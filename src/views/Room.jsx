import { useEffect,useState } from 'react'
import { FaEthereum, FaStar,FaTimes } from 'react-icons/fa'
import { CiEdit } from 'react-icons/ci'
import { FiCalendar } from 'react-icons/fi'
import { MdDeleteOutline } from 'react-icons/md'
import { BiBookOpen, BiMedal } from 'react-icons/bi'
import { BsChatLeft } from 'react-icons/bs'
import Identicon from 'react-identicons'
import { Link, useParams, useNavigate } from 'react-router-dom'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  deleteAppartment,
  loadAppartment,
  loadReviews,
  loadAppartments,
  appartmentBooking,
} from "../Blockchain.services";
import { useGlobalState, setGlobalState, truncate } from "../store";
import AddReview from '../components/AddReview'
import moment from 'moment'
import { toast } from 'react-toastify'

const Room = () => {
  const { id } = useParams()
  const [comments] = useGlobalState('comments')
  const [appartment] = useGlobalState('appartment')
  const [reviews] = useGlobalState('reviews')

  const handleReviewOpen = ()=> {
      setGlobalState('reviewModal','scale-100')
  }

  useEffect(async () => {
    await loadAppartment(id)
    await loadReviews(id)
  }, [])
  return (
    <div className="py-8 px-10 sm:px-20 md:px-32">
      <RoomHeader
        name={appartment?.name}
        id={appartment?.id}
        owner={appartment?.owner}
      />

      <RoomGrid
        first={appartment?.images[0]}
        second={appartment?.images[1]}
        third={appartment?.images[2]}
        forth={appartment?.images[3]}
        fifth={appartment?.images[4]}
      />

      <RoomDeescription
        description={appartment?.description}
        rooms={appartment?.rooms}
        price={appartment?.price}
      />

      <RoomReviews />

      <div className="flex justify-between flex-wrap">
        {
          reviews.length > 0
          ? reviews.map((review,index) => (
            <RoomComments key={index} review={review} />
          ))
          :"No reviews yet!"
        }
      </div>
      <p
        className="underline mt-11 cursor-pointer hover:text-blue-700"
        onClick={handleReviewOpen}
      >
        Drop your review
      </p>
      <AddReview />
      <div className='fixed bottom-[6rem] right-4 px-4 py-3 rounded-full shadow-lg border-[0.1px] border-gray-300 flex  justify-center items-center space-x-3 cursor-pointer bg-white z-50 hover:bg-gray-100'>
         <BsChatLeft className='text-3xl text-pink-500'/>
      </div>
    </div>
  );
}

const RoomHeader = ({ name, id, owner }) => {
  const [connectedAccount] = useGlobalState('connectedAccount')
  const navigate = useNavigate()

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete?')) {
      await toast.promise(
        new Promise(async (resolve, reject) => {
          await deleteAppartment(id)
            .then(async () => {
              onReset();
              resolve();
              navigate('/')
              await loadAppartments()
            })
            .catch(() => reject());
        }),
        {
          pending: "Approve transaction...",
          success: "apartment deleted successfully 👌",
          error: "Encountered error 🤯",
        }
      );
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
              <span>Delete {id}</span>
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
    const [checkInDate, setCheckInDate] = useState(null);
    const [checkOutDate, setCheckOutDate] = useState(null);
    const [timestamps, setTimestamps] = useState([]);
    const {id} = useParams()

    const handleCheckInDateChange = (date) => {
      setCheckInDate(date);
    };

    const handleCheckOutDateChange = (date) => {

      setCheckOutDate(date);

      
    };
    
    const handleSubmit = async (e) => {
      e.preventDefault()
      if(!checkInDate || !checkOutDate) return
      const start = moment(checkInDate);
      const end = moment(checkOutDate);
      const timestampArray = [];

      while (start <= end) {
        timestampArray.push(start.valueOf());
        start.add(1, "days");
      }

      // setTimestamps(timestampArray);
      // const checkin = checkInDate.getTime();
      // const checkout = checkOutDate.getTime();
      // const nights = moment.duration(checkout - checkin).asDays();
      // alert(`Number of nights: ${nights}`);
      
       
      //  resetForm();
    };

    const resetForm = () => {
       setCheckInDate(null)
       setCheckOutDate(null)
    }

    const remove = ()=> {
       setTimestamps([])
    }

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
        <div className="w-5/3 flex p-3 justify-between">
          <div></div>
          <form
            onSubmit={handleSubmit}
            className="w-[25rem] min-h-[15rem] border-[0.1px] border-gray-400 self-end rounded-lg shadow-lg p-2 sticky top-0 "
          >
            <div className="flex justify-between p-2">
              <div className="flex">
                <FaEthereum className="text-3xl text-gray-500" />
                <h3 className="text-xl text-gray-500">
                  {price} <small>per night</small>
                </h3>
              </div>
            </div>
            <div className="my-3 w-full px-4">
              <DatePicker
                id="checkInDate"
                selected={checkInDate}
                onChange={handleCheckInDateChange}
                placeholderText={"check-in"}
                dateFormat="yyyy-MM-dd"
                minDate={new Date()}
                excludeDates={timestamps}
                required
                className="rounded-lg w-full"
              />
            </div>
            <div className="my-3 w-full px-4">
              <DatePicker
                id="checkOutDate"
                selected={checkOutDate}
                onChange={handleCheckOutDateChange}
                placeholderText={"check-out"}
                dateFormat="yyyy-MM-dd"
                minDate={checkInDate}
                excludeDates={timestamps}
                required
                className="rounded-lg w-full"
              />
            </div>
            <div className="mx-auto w-5/6">
              <button className="p-2 border-none bg-gradient-to-l from-pink-600 to-gray-600 text-white w-full rounded-md focus:outline-none focus:ring-0">
                Book
              </button>
            </div>
          </form>
        </div>
        <div className=" flex space-x-4 w-[62%]">
          <div>
            <p className="text-slate-500 text-lg">{description}</p>
          </div>
        </div>
        <div className=" flex space-x-4 ">
          <BiBookOpen className="text-4xl" />
          <div>
            <h1 className="text-xl font-semibold">Featured in</h1>
            <p className='cursor-pointer' onClick={remove}>Condé Nast Traveler, June 2021</p>
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
  );
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
          <p className="text-xl font-semibold">{truncate(review.owner,4,4,11)} </p>
          <p className="text-slate-500 text-lg">{review.timestamp}</p>
        </div>
      </div>
      <p className="text-xl">{review.reviewText}</p>
    </div>
  )
}

export default Room