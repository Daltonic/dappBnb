import Card from './Card'

const CardCollection = ({ appartments }) => {
  return (
    <div className="py-8 px-14 flex justify-center flex-wrap space-x-4 w-full">
      {appartments.map((room, i) =>
        room.deleted ? null : <Card key={i} appartment={room} />,
      )}
    </div>
  )
}

export default CardCollection
