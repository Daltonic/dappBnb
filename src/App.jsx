import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import Card from './components/Card'
import Footer from './components/Footer'
import Header from './components/Header'
import Home from './views/Home'
import Room from './views/Room'
import AddRoom from './views/AddRoom'
import { isWallectConnected, loadAppartments } from './Blockchain.services'
import UpdateRoom from './views/UpdateRoom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Bookings from './views/Bookings'
import Chats from './views/Chats'
import RecentConversations from './views/RecentConversations'
import { setGlobalState, useGlobalState } from './store'
import { isUserLoggedIn } from './services/Chat'

const App = () => {
  const [connectedAccount] = useGlobalState('connectedAccount')

  useEffect(async () => {
    await isWallectConnected()
    await loadAppartments()
    await isUserLoggedIn().then((user) => setGlobalState('currentUser', user))
  }, [connectedAccount])

  return (
    <div className="relative h-screen min-w-screen">
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:id" element={<Room />} />
        <Route path="/card" element={<Card />} />
        <Route path="/addRoom" element={<AddRoom />} />
        <Route path="/editRoom/:id" element={<UpdateRoom />} />
        <Route path="/bookings/:id" element={<Bookings />} />
        <Route path="/chats/:id" element={<Chats />} />
        <Route path="/recentconversations" element={<RecentConversations />} />
      </Routes>
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
  )
}

export default App
