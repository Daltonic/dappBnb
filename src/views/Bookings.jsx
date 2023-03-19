import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useGlobalState, getGlobalState } from '../store'
import { toast } from 'react-toastify'
import {
  getBookings,
  getUnavailableDates,
  hasBookedDateReached,
  refund,
  loadAppartment,
  claimFunds,
  checkInApartment,
} from '../Blockchain.services'

const Bookings = () => {
  const [loaded, setLoaded] = useState(false)
  const connectedAccount = getGlobalState('connectedAccount')
  const [bookings] = useGlobalState('bookings')
  const [appartment] = useGlobalState('appartment')
  const { id } = useParams()

  useEffect(async () => {
    await getBookings(id).then(() => setLoaded(true))
    await loadAppartment(id)
  }, [])

  const isDayAfter = (booking) => {
    const bookingDate = new Date(booking.date).getTime()
    const today = new Date().getTime()
    const oneDay = 24 * 60 * 60 * 1000
    return today > bookingDate + oneDay && !booking.checked
  }

  const handleClaimFunds = async (booking) => {
    const params = {
      id,
      bookingId: booking.id,
    }

    await toast.promise(
      new Promise(async (resolve, reject) => {
        await claimFunds(params)
          .then(async () => {
            await getUnavailableDates(id)
            await getBookings(id)
            resolve()
          })
          .catch(() => reject())
      }),
      {
        pending: 'Approve transaction...',
        success: 'funds claimed successfully 👌',
        error: 'Encountered error 🤯',
      }
    )
  }

  return loaded ? (
    <div className="w-full sm:w-3/5 mx-auto mt-8">
      {appartment?.owner != connectedAccount.toLowerCase() ? (
        <h1 className="text-center text-3xl text-black font-bold">
          Your bookings
        </h1>
      ) : null}

      {bookings.length > 0 ? (
        bookings.map((booking, index) => (
          <BookingDisplay key={index} booking={booking} />
        ))
      ) : (
        <div>No bookings for this appartment yet</div>
      )}

      {appartment?.owner == connectedAccount.toLowerCase() ? (
        <div className="w-full sm:w-3/5 mx-auto mt-8">
          <h1 className="text-3xl text-center font-bold">
            View booking requests
          </h1>
          {bookings.length > 0
            ? bookings.map((booking, index) => (
                <div
                  key={index}
                  className="w-full my-3 border-b border-b-gray-100 p-3 bg-gray-100"
                >
                  <div>{booking.date}</div>
                  {isDayAfter(booking) ? (
                    <button
                      className="p-2 bg-green-500 text-white rounded-full text-sm"
                      onClick={() => handleClaimFunds(booking)}
                    >
                      claim
                    </button>
                  ) : null}
                </div>
              ))
            : 'No bookings yet'}
        </div>
      ) : null}
    </div>
  ) : null
}

const BookingDisplay = ({ booking }) => {
  const { id } = useParams()
  const connectedAccount = getGlobalState('connectedAccount')

  useEffect(async () => {
    const params = {
      id,
      bookingId: booking.id,
    }
    await hasBookedDateReached(params)
  }, [])

  const handleCheckIn = async () => {
    await toast.promise(
      new Promise(async (resolve, reject) => {
        await checkInApartment(id, booking.id)
          .then(async () => {
            await getBookings(id)
            resolve()
          })
          .catch(() => reject())
      }),
      {
        pending: 'Approve transaction...',
        success: 'Checked In successfully 👌',
        error: 'Encountered error 🤯',
      }
    )
  }

  const handleRefund = async () => {
    const params = {
      id,
      bookingId: booking.id,
      date: new Date(booking.date).getTime(),
    }

    await toast.promise(
      new Promise(async (resolve, reject) => {
        await refund(params)
          .then(async () => {
            await getUnavailableDates(id)
            await getBookings(id)
            resolve()
          })
          .catch(() => reject())
      }),
      {
        pending: 'Approve transaction...',
        success: 'refund successful 👌',
        error: 'Encountered error 🤯',
      }
    )
  }

  const bookedDayStatus = (booking) => {
    const bookedDate = new Date(booking.date).getTime()
    const current = new Date().getTime()
    const bookedDayStatus = bookedDate < current && !booking.checked
    return bookedDayStatus
  }

  return (
    <>
      {booking.tenant != connectedAccount.toLowerCase() ||
      booking.cancelled == true ? null : (
        <div className="w-full flex justify-between items-center my-3 bg-gray-100 p-3">
          <Link className=" font-medium underline" to={'/room/' + id}>
            {booking.date}
          </Link>
          {bookedDayStatus(booking) ? (
            <button
              className="p-2 bg-green-500 text-white rounded-full text-sm px-4"
              onClick={handleCheckIn}
            >
              Check In
            </button>
          ) : booking.checked ? (
            <button className="p-2 bg-yellow-500 text-white font-medium italic rounded-full text-sm px-4">
              Checked In
            </button>
          ) : (
            <button
              className="p-2 bg-[#ff385c] text-white rounded-full text-sm px-4"
              onClick={handleRefund}
            >
              Refund
            </button>
          )}
        </div>
      )}
    </>
  )
}

export default Bookings
