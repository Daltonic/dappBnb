import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { loadAppartment } from "../Blockchain.services";
import { setGlobalState, useGlobalState, getGlobalState, truncate } from "../store";
import Identicon from "react-identicons";
import { CometChat, getMessages, sendMessage } from "../services/Chat";

const Chats = () => {
  const [loaded, setLoaded] = useState(false);
  const [appartment] = useGlobalState("appartment");
  const connectedAccount = getGlobalState("connectedAccount");
  const {id} = useParams()
  const [messages] = useGlobalState('messages')
  const [message,setMessage] = useState('')

  useEffect(async () => {
    await getMessages(`${id}`)
      .then((msgs) => {
        if (msgs.length > 0) {
          setGlobalState("messages", msgs);
        } else {
          console.log("empty");
        }
      })
      .catch((error) => {
        console.log("Error fetching messages:", error);
        alert("Sorry, an error occurred while fetching messages for the user.");
      });


  }, []);



  const onSendMessage = async (e) => {
    e.preventDefault();

    if (!message) {
      return;
    }
    try {
      const user = await CometChat.getUser(id);
      if (user) {
        const msg = await sendMessage(id, message);
        setGlobalState("messages", (prevMessages) => [...prevMessages, msg]);
        setMessage("");
        console.log(messages);
      } else {
        alert("Sorry, the receiver user does not exist.");
      }
    } catch (error) {
      console.log("User validation failed with error:", error);
    }
  };


  return  (
    <div className="w-4/5 mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center">Chats</h1>
      <div className="h-[40vh] overflow-y-scroll w-full .scroll-bar">
        {
          messages.length > 0 
          ? messages.map((msg,index) => (
            <Message message={msg.text} uid={msg.sender.uid} key={index}/>
          ))
          : 'No message yet'
        }
      </div>
      <form onSubmit={onSendMessage} className='w-full'>
        <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="h-full w-full py-5 focus:outline-none focus:ring-0 rounded-md border-none bg-[rgba(0,0,0,0.7)] text-white placeholder-white"
            placeholder="Leave a message..."
          />
      </form>
    </div>
  )
};


const Message = ({ message, uid }) => {
  return (
    <div className="flex items-center space-x-4 mb-3">
      <div className="flex items-center space-x-2">
        <Identicon string={uid} size={30} className="rounded-full" />
        <p className="font-bold text-sm">{truncate(uid, 4, 4, 11)}</p>
      </div>
      <p className="text-sm">{message}</p>
    </div>
  );
};

export default Chats;
