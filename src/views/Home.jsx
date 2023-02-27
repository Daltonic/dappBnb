import CardCollection from "../components/CardCollection"
import Category from "../components/Category"
import { useGlobalState } from "../store"


const Home = () => {
  const [appartments] = useGlobalState("appartments") 
  return (
    <div>
      <Category />
      <CardCollection appartments={appartments} />
    </div>
  )
}

export default Home