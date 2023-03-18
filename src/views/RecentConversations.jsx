import { useEffect } from 'react'
import { getConversations } from '../services/Chat'
import { useNavigate, Link } from 'react-router-dom'
import { setGlobalState, useGlobalState, truncate } from '../store'
import Identicon from 'react-identicons'
import { toast } from 'react-toastify'

const RecentConversations = () => {
  const navigate = useNavigate()
  const [recentConversations] = useGlobalState('recentConversations')

  useEffect(async () => {
    await getConversations()
      .then((users) => setGlobalState('recentConversations', users))
      .catch((error) => {
        if (error.code == 'USER_NOT_LOGED_IN') {
          navigate('/')
          toast.warning('You should login first...')
        }
      })
  }, [])

  return (
    <div className="w-full sm:w-3/5 mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center">Your Recent chats</h1>
      {recentConversations?.length > 0
        ? recentConversations?.map((conversation, index) => (
            <Link
              className="flex items-center space-x-3 w-full my-3
              border-b border-b-gray-100 p-3 hover:bg-gray-100"
              to={`/chats/${conversation.conversationWith.uid}`}
              key={index}
            >
              <Identicon string={conversation.conversationWith.uid} size={20} />
              <p>{truncate(conversation.conversationWith.name, 4, 4, 11)}</p>
            </Link>
          ))
        : "you don't have any recent chats"}
    </div>
  )
}

export default RecentConversations
