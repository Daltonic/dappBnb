import { createGlobalState } from "react-hooks-global-state";

const { setGlobalState, useGlobalState, getGlobalState } = createGlobalState({
  comments: [
    {
      id: 1,
      avatar: "https://www.airbnb.com/users/show/416823217",
      name: "0x28xx",
      date: "17-9-96",
      text: `A fantastic and unique location perfect for a few days of solitude in a
            calm and beautiful cueva there are lots of great amenities and great
            hosts to ensure you are comfortable`,
    },
    {
      id: 2,
      avatar: "https://www.airbnb.com/users/show/416823217",
      name: "0x28xx..ul53",
      date: "17-9-96",
      text: `A stunning place - the caves and the pool are so unique! Have never stayed anywhere like it. Also  Christian and Laurence were super friendly. Would highly recommend!`,
    },
    {
      id: 3,
      avatar: "https://www.airbnb.com/users/show/416823217",
      name: "0x28xx..jkl28",
      date: "6-9-01",
      text: `Words are not enough to truly do Cuerva Aventura justice. The views are jaw dropping, the location is inspiring and the hosts are just amazing. Nothing is too much for them.`,
    },
    {
      id: 4,
      avatar: "https://www.airbnb.com/users/show/416823217",
      name: "0x28xx..oil4",
      date: "3-1-25",
      text: `Fantastic stay! Lawrence and Christian were so warm and welcoming, even cooking dinner for us on the first night! Such a wonderful location, and the cave was a great`,
    },
    {
      id: 5,
      avatar: "https://www.airbnb.com/users/show/416823217",
      name: "0x28xx..4hbk",
      date: "6-6-28",
      text: `Perfect place to stay. Amazing hosts and the cave is very cool despite the hot temperatures. The pool area is amazing too. Cannot recommend enough`,
    },
  ],
  appartments: [],
  appartment: null,
  connectedAccount: "",
  contract: null,

});

const truncate = (text, startChars, endChars, maxLength) => {
  if (text.length > maxLength) {
    let start = text.substring(0, startChars);
    let end = text.substring(text.length - endChars, text.length);
    while (start.length + end.length < maxLength) {
      start = start + ".";
    }
    return start + end;
  }
  return text;
};

export { setGlobalState, useGlobalState, getGlobalState, truncate };
