// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract DappBnb {
    struct ApartmentStruct {
        uint id;
        string name;
        string description;
        string images;
        uint rooms;
        uint price;
        address owner;
        bool booked;
        bool deleted;
        uint timestamp;
    }

    uint public totalAppartments;
    ApartmentStruct[] public apartments;
    mapping(uint => bool) appartmentExist;

    function createAppartment(
        string memory name,
        string memory description,
        string memory images,
        uint rooms,
        uint price
    ) public {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(bytes(images).length > 0, "Images cannot be empty");
        require(rooms > 0, "Rooms cannot be zero");
        require(price > 0 ether, "Price cannot be zero");

        ApartmentStruct memory lodge;
        lodge.id = totalAppartments++;
        lodge.name = name;
        lodge.description = description;
        lodge.images = images;
        lodge.rooms = rooms;
        lodge.price = price;
        lodge.owner = msg.sender;
        lodge.timestamp = block.timestamp;

        apartments.push(lodge);
        appartmentExist[lodge.id] = true;
    }
    
    function updateAppartment
    (
        uint id,
        string memory name,
        string memory description,
        string memory images,
        uint rooms,
        uint price
    ) public {
        require(appartmentExist[id], "Appartment not found");
        require(apartments[id].owner == msg.sender, "Unauthorized personnel, owner only");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(bytes(images).length > 0, "Images cannot be empty");
        require(rooms > 0, "Rooms cannot be zero");
        require(price > 0 ether, "Price cannot be zero");
        
        ApartmentStruct memory lodge = apartments[id];
        lodge.name = name;
        lodge.description = description;
        lodge.images = images;
        lodge.rooms = rooms;
        lodge.price = price;
        
        apartments[id] = lodge;
    }

    function deleteAppartment(uint id) public {
        require(appartmentExist[id], "Appartment not found");
        require(apartments[id].owner == msg.sender, "Unauthorized personnel, owner only");

        apartments[id].deleted = true;
    }

    

    function getApartments() public view returns (ApartmentStruct[] memory) {
        return apartments;
    }
}