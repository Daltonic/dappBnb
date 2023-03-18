import { setGlobalState,useGlobalState } from '../store';
import { signUpWithCometChat,loginWithCometChat } from '../services/Chat';
import { toast } from 'react-toastify';
import { useParams,useNavigate } from 'react-router-dom';
import { useEffect,useState } from 'react';
import { loadAppartment } from '../Blockchain.services';

const AuthChat = () => {
  const navigate = useNavigate()
  const {id} = useParams()
  const [currentUser] = useGlobalState('currentUser')
  const [loaded,setLoaded] = useState(false)
  const [appartment] = useGlobalState('appartment')

  useEffect(async()=>{
    await loadAppartment(id).then(()=>setLoaded(true))
  },[])

  const handleSignUp = async () => {
    await toast.promise(
      new Promise(async (resolve, reject) => {
        await signUpWithCometChat()
          .then((user) => {
            setGlobalState("currentUser", user);
            resolve();
          })
          .catch(() => reject());
      }),
      {
        pending: "processing...",
        success: "Account created, please login 👌",
        error: "Encountered error 🤯",
      }
    );
  };

  const handleLogin = async () => {
    await toast.promise(
      new Promise(async (resolve, reject) => {
        await loginWithCometChat()
          .then(async (user) => {
            setGlobalState("currentUser", user);
            resolve();
            if(user.uid.toLowerCase() == appartment.owner) {
                navigate(`/recentconversations`);
            }else{
                navigate(`/chats/${appartment.owner}`);
            }
          })
          .catch(() => reject());
      }),
      {
        pending: "processing...",
        success: "login successful 👌",
        error: "Encountered error 🤯",
      }
    );
  };

  return loaded ? (
    <div className="w-4/5 mx-auto mt-8">
      <div className="h-[10rem] flex justify-center items-center space-x-5">
        <button
          className="p-3 rounded-lg focus:outline-none focus:ring-0 bg-gradient-to-l from-pink-600 to-gray-600 text-white"
          onClick={handleSignUp}
        >
          SignUp
        </button>
        <button
          className="p-3 rounded-lg focus:outline-none focus:ring-0 bg-gradient-to-l from-pink-600 to-gray-600 text-white"
          onClick={handleLogin}
        >
          Login
        </button>
      </div>
    </div>
  ) : null;
}

export default AuthChat
