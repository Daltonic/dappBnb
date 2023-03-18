import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import 'react-datepicker/dist/react-datepicker.css'
import './index.css'
import { initCometChat } from './services/Chat'

initCometChat().then(() => {
  ReactDOM.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
    document.getElementById('root')
  )
})