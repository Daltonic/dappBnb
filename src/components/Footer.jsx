import React from 'react'
import {FiGlobe} from 'react-icons/fi'

const Footer = () => {
  return (
    <div className='fixed left-0 right-0 bottom-0 flex px-20 py-6 justify-between bg-white border-t-2 border-t-slate-200 z-50'>
      <div className='flex space-x-4 items-center text-gray-600 text-lg'>
        <p>With ♥️ DappBnb &copy;{new Date().getFullYear()}</p>
      </div>
      <div className='flex space-x-4 items-center font-semibold text-lg'>
        <FiGlobe />
        <p>English (US)</p>
      </div>
    </div>
  )
}

export default Footer