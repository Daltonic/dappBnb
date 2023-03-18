const { ethers } = require('hardhat')
const { faker } = require('@faker-js/faker')
const fs = require('fs')

const toWei = (num) => ethers.utils.parseEther(num.toString())

async function main() {
  const taxPercent = 7
  const securityFee = toWei(0.005)
  const Contract = await ethers.getContractFactory('DappBnb')
  const contract = await Contract.deploy(taxPercent, securityFee)
  await contract.deployed()

  // Seeding begings here...
  const signers = await ethers.getSigners()
  const iterations = 7
  const imagesUrls = [
    'https://a0.muscache.com/im/pictures/miso/Hosting-3524556/original/24e9b114-7db5-4fab-8994-bc16f263ad1d.jpeg?im_w=720',
    'https://a0.muscache.com/im/pictures/miso/Hosting-5264493/original/10d2c21f-84c2-46c5-b20b-b51d1c2c971a.jpeg?im_w=720',
    'https://a0.muscache.com/im/pictures/prohost-api/Hosting-584469386220279136/original/227d4c26-43d5-42da-ad84-d039515c0bad.jpeg?im_w=720',
    'https://a0.muscache.com/im/pictures/miso/Hosting-610511843622686196/original/253bfa1e-8c53-4dc0-a3af-0a75728c0708.jpeg?im_w=720',
    'https://a0.muscache.com/im/pictures/miso/Hosting-535385560957380751/original/90cc1db6-d31c-48d5-80e8-47259e750d30.jpeg?im_w=720',
    'https://a0.muscache.com/im/pictures/b7756897-ef31-4080-b881-c4c7b9ec0df7.jpg?im_w=720',
    'https://a0.muscache.com/im/pictures/337660c5-939a-439b-976f-19219dbc80c7.jpg?im_w=720',
    'https://a0.muscache.com/im/pictures/7739bab3-6dd7-40bb-82e1-50ae68719b7b.jpg?im_w=720',
    'https://a0.muscache.com/im/pictures/49ee362b-b47f-49fa-b8c0-18a41dbd4c4d.jpg?im_w=720',
    'https://a0.muscache.com/im/pictures/miso/Hosting-569315897060112509/original/7db7c768-fb46-4934-904e-74a9771f9a60.jpeg?im_w=720',
    'https://a0.muscache.com/im/pictures/309bee53-311d-4f07-a2e7-14daadbbfb77.jpg?im_w=720',
    'https://a0.muscache.com/im/pictures/miso/Hosting-660654516377752568/original/be407e38-ad1e-4b2b-a547-2185068229f6.jpeg?im_w=720',
    'https://a0.muscache.com/im/pictures/0b231a22-0812-4211-965a-e29c686f2b5d.jpg?im_w=720',
    'https://a0.muscache.com/im/pictures/miso/Hosting-653943444831285144/original/73346136-e0bb-46a8-8ce4-a9fb5229e6b3.jpeg?im_w=720',
    'https://a0.muscache.com/im/pictures/71993873/b158891b_original.jpg?im_w=720',
    'https://a0.muscache.com/im/pictures/prohost-api/Hosting-686901689015576288/original/2cd072fa-8c03-4ef3-a061-268b9b957e28.jpeg?im_w=720',
    'https://a0.muscache.com/im/pictures/b88162e9-9ce3-4254-8129-2ea8719ab2c3.jpg?im_w=720',
    'https://a0.muscache.com/im/pictures/prohost-api/Hosting-585362898291824332/original/8a92bd09-9795-4586-bc32-6ab474d0922b.jpeg?im_w=720',
    'https://a0.muscache.com/im/pictures/3757edd0-8d4d-4d51-9d2e-3000e8c3797e.jpg?im_w=720',
    'https://a0.muscache.com/im/pictures/b7811ddd-b5e6-43ee-aa41-1fa28cf5ef95.jpg?im_w=720',
  ]
  let tx, result

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }

  const getParams = () => {
    const id = faker.random.numeric()
    const name = faker.company.catchPhrase()
    const description = faker.lorem.paragraph()
    const price =
      faker.random.numeric({
        min: 0.1 * 100,
        max: 3.5 * 100,
        precision: 0.01,
      }) / 100
    const rooms = faker.random.numeric()
    const owner = shuffleArray(signers)[0]
    const timestamp = Date.now()
    const images = []
    for (let i = 0; i < 5; i++) {
      images.push(shuffleArray(imagesUrls)[0])
    }
    return {
      id,
      name,
      description,
      price,
      images,
      rooms,
      owner: owner.address,
      timestamp,
    }
  }

  const createAppartment = async (params) => {
    tx = await contract.functions.createAppartment(
      params.name,
      params.description,
      params.images.join(','),
      params.rooms,
      toWei(params.price),
    )
    await tx.wait()
  }

  for (let i = 0; i < iterations; i++) {
    await createAppartment(getParams())
  }

  result = await contract.getApartments()
  console.log(result)

  // Seeding ends here...

  const address = JSON.stringify({ address: contract.address }, null, 4)
  fs.writeFile('./src/abis/contractAddress.json', address, 'utf8', (err) => {
    if (err) {
      console.error(err)
      return
    }
    console.log('Deployed contract address', contract.address)
  })
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
