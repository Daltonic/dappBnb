// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract DappBnb {

    struct ApartmentStruct {
        uint id;
        string name;
        string description;
        string image;
        uint rooms;
        uint price;
        address owner;
        bool booked;
        bool deleted;
        bool availablity;
        uint timestamp;
    }

    struct BookingStruct {
        uint id;
        address tenant;
        uint selected_date;
        uint price;
        bool checked;
    }

    event SecurityFeeUpdated(uint newFee);

    uint public securityFee;
    uint public taxPercent;
    uint public totalAppartments;
    address public owner;

    mapping(uint => ApartmentStruct) apartments;
    mapping(uint => BookingStruct[]) bookingsOf;
    mapping(uint => bool) appartmentExist;

    modifier ownerOnly() {
        require(msg.sender == owner, "Reserved for owner only!");
        _;
    }

    constructor(uint _taxPercent, uint _securityFee) {
        owner = msg.sender;
        taxPercent = _taxPercent;
        securityFee = _securityFee;
    }

    function createAppartment(
        string memory name,
        string memory description,
        string memory image,
        uint rooms,
        uint price
    ) public {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(bytes(image).length > 0, "Images cannot be empty");
        require(rooms > 0, "Rooms cannot be zero");
        require(price > 0 ether, "Price cannot be zero");

        appartmentExist[totalAppartments] = true;

        ApartmentStruct memory lodge;
        lodge.id = totalAppartments;
        lodge.name = name;
        lodge.description = description;
        lodge.image = image;
        lodge.rooms = rooms;
        lodge.price = price;
        lodge.owner = msg.sender;
        lodge.availablity = true;
        lodge.timestamp = block.timestamp;

        apartments[totalAppartments] = lodge;
        totalAppartments++;
    }
    
    function updateAppartment
    (
        uint id,
        string memory name,
        string memory description,
        string memory image,
        uint rooms,
        uint price
    ) public {
        require(appartmentExist[id], "Appartment not found");
        require(msg.sender == apartments[id].owner, "Unauthorized personnel, owner only");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(bytes(image).length > 0, "Images cannot be empty");
        require(rooms > 0, "Rooms cannot be zero");
        require(price > 0 ether, "Price cannot be zero");
        
        ApartmentStruct memory lodge = apartments[id];
        lodge.name = name;
        lodge.description = description;
        lodge.image = image;
        lodge.rooms = rooms;
        lodge.price = price;
        
        apartments[id] = lodge;
    }

    function deleteAppartment(uint id) public {
        require(appartmentExist[id], "Appartment not found");

        totalAppartments--;
        appartmentExist[id] = false;
        apartments[id].deleted = true;
    }

    

    function getApartments() public view returns (ApartmentStruct[] memory Apartments) {
        Apartments = new ApartmentStruct[](totalAppartments);
        
        for (uint i = 0; i < totalAppartments; i++) {
            if(!apartments[i].deleted) {
                Apartments[i] = apartments[i];
            }
        }
    }

    function getAppartment(uint id) public view returns (ApartmentStruct memory) {
        return apartments[id];
    }

    function getBookings(uint id) public view returns (BookingStruct[] memory) {
        return bookingsOf[id];
    }

    function bookApartment(uint id, uint[] memory selected_dates) public payable returns (bool) {    
       require(appartmentExist[id],"Appartment not found!");
       require(msg.value >= apartments[id].price + securityFee,"Insufficient fund!");

       for (uint i = 0; i < selected_dates.length; i++) {
            BookingStruct memory booking;
            booking.id = bookingsOf[id].length;
            booking.tenant = msg.sender;
            booking.selected_date = selected_dates[i];
            booking.price = apartments[id].price;
        }

       return true;
    }

    function checkInApartment(uint id, uint bookingId) public returns (bool) {    
       require(msg.sender == bookingsOf[id][bookingId].tenant, "Unauthorized tenant!");
       require(!bookingsOf[id][bookingId].checked, "Apartment already checked on this date!");
       
       bookingsOf[id][bookingId].checked = true;
       uint price = bookingsOf[id][bookingId].price;
       uint fee = price * taxPercent / 100;
    
       payTo(apartments[id].owner, (price - fee));
       payTo(owner, fee);
       payTo(msg.sender, securityFee);
       return true;
    }

    function refundBooking(uint id, uint bookingId) public returns (bool) {    
       require(msg.sender == bookingsOf[id][bookingId].tenant, "Unauthorized tenant!");
       require(!bookingsOf[id][bookingId].checked, "Apartment already checked on this date!");
       
       uint price = bookingsOf[id][bookingId].price;
       uint fee = securityFee * taxPercent / 100;
    
       payTo(apartments[id].owner, (securityFee - fee));
       payTo(owner, fee);
       payTo(msg.sender, price);
       return true;
    }

    function updateSecurityFee(uint newFee) public ownerOnly {
       require(newFee > 0);
       securityFee = newFee;
       emit SecurityFeeUpdated(newFee);
    }

    function updateTaxPercent(uint newTaxPercent) public {
       require(msg.sender == owner); // Only the owner can update the tax fee
       taxPercent = newTaxPercent;
    }

    function payTo(address to, uint256 amount) internal {
        (bool success, ) = payable(to).call{value: amount}("");
        require(success);
    }
 }