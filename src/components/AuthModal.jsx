import { FaTimes } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { loginWithCometChat, signUpWithCometChat } from '../services/Chat'
import { setGlobalState, useGlobalState } from '../store'

const AuthModal = () => {
  const [authModal] = useGlobalState('authModal')
  const navigate = useNavigate()

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
            setGlobalState('authModal', 'scale-0')
            navigate('/recentconversations')
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
    <div
      className={`fixed top-0 left-0 w-screen h-screen flex
      items-center justify-center bg-black bg-opacity-50 z-50
      transform transition-transform duration-300 ${authModal}`}
    >
      <div
        className="bg-white shadow-xl shadow-[#b2253f] rounded-xl
        w-11/12 md:w-2/5 h-7/12 p-6"
      >
        <div className="flex flex-col">
          <div className="flex justify-between items-center">
            <p className="font-semibold">Login to Chat</p>
            <button
              onClick={() => setGlobalState('authModal', 'scale-0')}
              type="button"
              className="border-0 bg-transparent focus:outline-none"
            >
              <FaTimes />
            </button>
          </div>

          <div className="flex justify-start items-center space-x-2 mt-5">
            <button
              onClick={handleSignUp}
              className="bg-[#ff385c] p-2 px-6 rounded-full text-white shadow-md
              shadow-gray-300 transform transition-transform duration-30 w-fit"
            >
              Sign up
            </button>

            <button
              onClick={handleLogin}
              className="border border-[#ff385c] text-[#ff385c] p-2 px-6 rounded-full shadow-md
              shadow-gray-300 transform transition-transform duration-30 w-fit"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthModal
