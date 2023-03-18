import  { useEffect,useState } from 'react'
import { getConversations,getUser } from '../services/Chat'
import { loadAppartment } from '../Blockchain.services'
import { useParams, useNavigate,Link } from 'react-router-dom'
import { setGlobalState,useGlobalState,getGlobalState,truncate } from '../store'
import Identicon from "react-identicons";


const RecentConversations = () => {
   const [appartment] = useGlobalState('appartment')
   const [loaded,setLoaded] = useState(false)
   const connectedAccount = getGlobalState('connectedAccount')
   const navigate = useNavigate()
   const [recentConversations] = useGlobalState('recentConversations')

    useEffect(async ()=> {
        await getConversations().then((conversationList)=>{
            setGlobalState('recentConversations',conversationList)
            setLoaded(true)
        })
    },[])
    

  return loaded ? (
    <div className="w-4/5 mx-auto mt-8">
        <h1 className='text-2xl font-bold text-center'>Your Recent chats</h1>
      {recentConversations.length > 0
        ? recentConversations.map((conversation, index) => (
            <Link
              className="flex items-center space-x-3 w-full my-3"
              to={`/chats/${conversation.conversationWith.uid}`}
              key={index}
            >
              <Identicon string={conversation.conversationWith.uid} size={40} />
              <p>{truncate(conversation.conversationWith.name, 4, 4, 11)}</p>
            </Link>
          ))
        : "you don't have any recent chats"}
    </div>
  ) : null;
};

export default RecentConversations
