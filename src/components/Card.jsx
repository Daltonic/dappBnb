import React from 'react'
import { FaStar, FaEthereum } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import ImageSlider from './ImageSlider'

const Card = ({ appartment }) => {
  return (
    <div className="shadow-md w-96 text-xl pb-5 rounded-b-2xl mb-20">
      <Link to={'/room/' + appartment.id}>
        <ImageSlider images={appartment.images} />
      </Link>
      <div className="px-4">
        <div className="flex justify-between items-start mt-2">
          <p className="font-semibold capitalize text-[15px]">
            {appartment.name}
          </p>
          <p className="flex justify-start items-center space-x-2 text-sm">
            <FaStar />
            <span>New</span>
          </p>
        </div>
        <div className="flex justify-between items-center text-sm">
          <p className="text-gray-700">{appartment.timestamp}</p>
          <b className="flex justify-start items-center space-x-1 font-semibold">
            <FaEthereum />
            <span>
              {appartment.price} night {appartment.deleted}
            </span>
          </b>
        </div>
      </div>
    </div>
  )
}

export default Card
