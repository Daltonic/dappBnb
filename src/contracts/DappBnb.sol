// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract DappBnb is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _totalAppartments;

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
        bool availablity;
        uint timestamp;
    }

     struct BookingStruct {
        uint id;
        address tenant;
        uint date;
        uint price;
        bool checked;
        bool cancelled;
    }

    struct ReviewStruct {
        uint id;
        uint appartmentId;
        string reviewText;
        uint timestamp;
        address owner;
    }

    event SecurityFeeUpdated(uint newFee);

    uint public securityFee;
    uint public taxPercent;

    mapping(uint => ApartmentStruct) apartments;
    mapping(uint => BookingStruct[]) bookingsOf;
    mapping(uint => ReviewStruct[]) reviewsOf;
    mapping(uint => bool) appartmentExist;
    mapping(uint => uint[]) bookedDates;
    mapping(uint => mapping(uint => bool)) isDateBooked;

    constructor(uint _taxPercent, uint _securityFee) {
        taxPercent = _taxPercent;
        securityFee = _securityFee;
    }

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

        _totalAppartments.increment();
        ApartmentStruct memory lodge;
        lodge.id = _totalAppartments.current();
        lodge.name = name;
        lodge.description = description;
        lodge.images = images;
        lodge.rooms = rooms;
        lodge.price = price;
        lodge.owner = msg.sender;
        lodge.availablity = true;
        lodge.timestamp = block.timestamp;

        appartmentExist[lodge.id] = true;

        apartments[_totalAppartments.current()] = lodge;
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
        require(appartmentExist[id] == true, "Appartment not found");
        require(msg.sender == apartments[id].owner, "Unauthorized personnel, owner only");
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
        require(appartmentExist[id] == true, "Appartment not found");
        require(apartments[id].owner == msg.sender, "Unauthorized entity");

        appartmentExist[id] = false;
        apartments[id].deleted = true;
    }

 

    function getApartments() public view returns (ApartmentStruct[] memory Apartments) {
        uint256 totalSpace;
        for (uint i = 1; i <= _totalAppartments.current(); i++) {
            if(!apartments[i].deleted) totalSpace++;
        }

        Apartments = new ApartmentStruct[](totalSpace);

        uint256 j = 0;
        for (uint i = 1; i <= _totalAppartments.current(); i++) {
            if(!apartments[i].deleted) {
                Apartments[j] = apartments[i];
                j++;
            }
        }
    }
    
    function getApartment(uint id) public view returns (ApartmentStruct memory) {
        return apartments[id];
    }

    function bookApartment(uint id, uint[] memory dates) public payable {    
        require(appartmentExist[id], "Apartment not found!");
        require(msg.value >= apartments[id].price * dates.length + securityFee, "Insufficient fund!");
        require(datesAreCleared(id, dates), "Booked date found among dates!");

        for (uint i = 0; i < dates.length; i++) {
            BookingStruct memory booking;
            booking.id = bookingsOf[id].length;
            booking.tenant = msg.sender;
            booking.date = dates[i];
            booking.price = apartments[id].price;
            bookingsOf[id].push(booking);            
            isDateBooked[id][dates[i]] = true;
            bookedDates[id].push(dates[i]);
        }
    }

    function datesAreCleared(uint id, uint[] memory dates) internal view returns (bool) {
        bool lastCheck = true;
        for(uint i=0; i < dates.length; i++) {
            for(uint j=0; j < bookedDates[id].length; j++) {
                if(dates[i] == bookedDates[id][j]) lastCheck = false;
            }
        }
        return lastCheck;
    }

    function checkInApartment(uint id, uint bookingId) public {    
       require(msg.sender == bookingsOf[id][bookingId].tenant, "Unauthorized tenant!");
       require(!bookingsOf[id][bookingId].checked, "Apartment already checked on this date!");
       
       bookingsOf[id][bookingId].checked = true;
       uint price = bookingsOf[id][bookingId].price;
       uint fee = (price * taxPercent) / 100;
    
       payTo(apartments[id].owner, (price - fee));
       payTo(owner(), fee);
       payTo(msg.sender, securityFee);
    }

    function refundBooking(uint id, uint bookingId, uint date) public nonReentrant {    
        require(!bookingsOf[id][bookingId].checked, "Apartment already checked on this date!");

        if(msg.sender != owner()) {
            require(msg.sender == bookingsOf[id][bookingId].tenant, "Unauthorized tenant!");
            require(bookingsOf[id][bookingId].date > currentTime(), "Can no longer refund, booking date started");
        }

        bookingsOf[id][bookingId].cancelled = true;
        isDateBooked[id][date] = false;

        bookedDates[id][bookingId] = bookedDates[id][bookedDates[id].length - 1];
        bookedDates[id].pop();

        uint price = bookingsOf[id][bookingId].price;
        uint fee = securityFee * taxPercent / 100;
    
        payTo(apartments[id].owner, (securityFee - fee));
        payTo(owner(), fee);
        payTo(msg.sender, price);
    }

    function getUnavailableDates(uint id) public view returns (uint[] memory) {
        return bookedDates[id];
    }

   function getBookings(uint id) public view returns (BookingStruct[] memory) {
        return bookingsOf[id];
   }
   
   function getBooking(uint id, uint bookingId) public view returns (BookingStruct memory) {
        return bookingsOf[id][bookingId];
   }

    function updateSecurityFee(uint newFee) public onlyOwner {
       require(newFee > 0);
       securityFee = newFee;
       emit SecurityFeeUpdated(newFee);
    }

    function updateTaxPercent(uint newTaxPercent) public onlyOwner {
       taxPercent = newTaxPercent;
    }

    function payTo(address to, uint256 amount) internal {
        (bool success, ) = payable(to).call{value: amount}("");
        require(success);
    }

    function addReview(uint appartmentId, string memory reviewText) public {
        require(appartmentExist[appartmentId] == true,"Appartment not available");
        require(bytes(reviewText).length > 0, "Review text cannot be empty");

        ReviewStruct memory review;

        review.id = reviewsOf[appartmentId].length;
        review.appartmentId = appartmentId;
        review.reviewText = reviewText;
        review.timestamp = block.timestamp;
        review.owner = msg.sender;

        reviewsOf[appartmentId].push(review);
    }

    function getReviews(uint appartmentId) public view returns(ReviewStruct[] memory) {
        return reviewsOf[appartmentId];
    }

    function currentTime() internal view returns (uint256) {
        uint256 newNum = (block.timestamp * 1000) + 1000;
        return newNum;
    }

    function returnSecurityFee() public view returns(uint) {
        return securityFee;
    }
    function returnTaxPercent() public view returns(uint) {
        return taxPercent;
    }
}