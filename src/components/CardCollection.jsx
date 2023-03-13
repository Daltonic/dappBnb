import Card from './Card'

const CardCollection = ({ appartments }) => {
  return (
    <div className="py-8 px-14 flex justify-center flex-wrap space-x-4 w-full">
      {
      appartments.length > 0 ?
      appartments.map((room, i) =>
          <Card appartment={room} key={i}/>
      )
      : 'No appartments yet!'
    }
    </div>
  )
}

export default CardCollection
