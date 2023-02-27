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
          <Route path="/editRoom/:id" element={<UpdateRoom/>} />
        </Routes>
      ) : null}
      <div className='h-20'></div>
      <Footer />
    </div>
  );
}

export default App