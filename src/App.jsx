import {useEffect, useState} from 'react'
import { Route, Routes } from 'react-router-dom'
import Card from './components/Card'
import Footer from './components/Footer'
import Header from './components/Header'
import Home from './views/Home'
import Room from './views/Room'
import AddRoom from "./views/AddRoom"
import { isWallectConnected, loadAppartments } from './Blockchain.services'
import UpdateRoom from './views/UpdateRoom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'


const App = () => {
  const [loaded, setLoaded] = useState(false)

  useEffect(async () => {
    await isWallectConnected().then(() =>{ 
      loadAppartments()
      console.log("wallect connected")
      setLoaded(true) 
  })
  },[]) 
  return (
    <div className="relative h-screen min-w-screen">
      <Header />
      {loaded ? (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:id" element={<Room />} />
          <Route path="/card" element={<Card />} />
          <Route path="/addRoom" element={<AddRoom />} />
          <Route path="/editRoom/:id" element={<UpdateRoom />} />
        </Routes>
      ) : null}
      <div className="h-20"></div>
      <Footer />

      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}

export default App