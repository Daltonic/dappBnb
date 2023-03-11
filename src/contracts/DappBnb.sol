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
        uint start_date;
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
    uint public totalAppartments;
    address public owner;

    mapping(uint => ApartmentStruct) apartments;
    mapping(uint => BookingStruct[]) bookingsOf;
    mapping(uint => mapping(uint => bool)) public dateAvailability;
    mapping(uint => mapping(uint => BookingStruct)) public bookingsByDate;
    mapping(uint => ReviewStruct[]) reviewsOf;
    mapping(uint => bool) appartmentExist;
    mapping(uint => bool) bookedStartDate;

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

        appartmentExist[lodge.id] = true;

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
    ) public returns(bool) {
        require(appartmentExist[id] == true, "Appartment not found");
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
        return true;
    }

    function deleteAppartment(uint id) public returns(bool) {
        require(appartmentExist[id] == true, "Appartment not found");

        appartmentExist[id] = false;
        apartments[id].deleted = true;

        return true;
    }

    

    function getApartments() public view returns (ApartmentStruct[] memory appartments) {
        appartments = new ApartmentStruct[](totalAppartments);
        
        for (uint i = 0; i < totalAppartments; i++) {
            if(!apartments[i].deleted) {
                appartments[i] = apartments[i];
            }
        }
    }

    function getAppartment(uint id) public view returns (ApartmentStruct memory) {
        return apartments[id];
    }

    function getBookings(uint id) public view returns (BookingStruct[] memory) {
        return bookingsOf[id];
    }

    

    // function bookApartment(uint id, uint[] memory selected_dates) public payable returns (bool) {    
    //    require(appartmentExist[id],"Appartment not found!");
    //    require(msg.value >= apartments[id].price + securityFee,"Insufficient fund!");

    //    for (uint i = 0; i < selected_dates.length; i++) {
    //         BookingStruct memory booking;
    //         booking.id = bookingsOf[id].length;
    //         booking.tenant = msg.sender;
    //         booking.selected_date = selected_dates[i];
    //         booking.price = apartments[id].price;
    //     }

    //    return true;
    // }

    function bookApartment(uint id, uint[] memory selected_dates, uint start_date) public payable returns (bool) {    
    require(appartmentExist[id], "Apartment not found!");
    require(msg.value >= apartments[id].price + securityFee, "Insufficient fund!");

    for (uint i = 0; i < selected_dates.length; i++) {
        require(!dateAvailability[id][selected_dates[i]], "Selected date is not available");
        BookingStruct memory booking;
        booking.id = bookingsOf[id].length;
        booking.tenant = msg.sender;
        booking.selected_date = selected_dates[i];
        booking.price = apartments[id].price;
        booking.start_date = start_date;
        bookingsOf[id].push(booking);
        dateAvailability[id][selected_dates[i]] = true;
        bookingsByDate[id][selected_dates[i]] = booking;
    }

    return true;
}



    function checkInApartment(uint id, uint bookingId) public returns (bool) {    
       require(msg.sender == bookingsOf[id][bookingId].tenant, "Unauthorized tenant!");
       require(!bookingsOf[id][bookingId].checked, "Apartment already checked on this date!");
       
       bookingsOf[id][bookingId].checked = true;
       uint price = bookingsOf[id][bookingId].price;
       uint fee = price * taxPercent / 100;
       bookedStartDate[bookingsOf[id][bookingId].start_date] = false;
    
       payTo(apartments[id].owner, (price - fee));
       payTo(owner, fee);
       payTo(msg.sender, securityFee);
       return true;
    }

    function refundBooking(uint id, uint bookingId,uint selected_date) public returns (bool) {    
       require(msg.sender == bookingsOf[id][bookingId].tenant, "Unauthorized tenant!");
       require(!bookingsOf[id][bookingId].checked, "Apartment already checked on this date!");
       

        bookingsOf[id][bookingId].cancelled = true;
        dateAvailability[id][selected_date] = false;

        uint price = bookingsOf[id][bookingId].price;
        uint fee = securityFee * taxPercent / 100;
    
        payTo(apartments[id].owner, (securityFee - fee));
        payTo(owner, fee);
        payTo(msg.sender, price);
        return true;
    }

function getUnavailableDates(uint id) public view returns (uint[] memory unavailableDates) {
        BookingStruct[] memory bookings = bookingsOf[id];
        uint count = 0;

        for (uint i = 0; i < bookings.length; i++) {
            if (!bookings[i].cancelled) {
                count++;
            }
        }

        unavailableDates = new uint[](count);
        uint index = 0;
        for (uint i = 0; i < bookings.length; i++) {
            if (!bookings[i].cancelled) {
                unavailableDates[index] = bookings[i].selected_date;
                index++;
            }
        }
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

    function addReview(uint appartmentId,string memory reviewText) public returns(bool) {
        require(appartmentExist[appartmentId] == true,"Appartment not available");
        require(bytes(reviewText).length > 0, "Review text cannot be empty");

        ReviewStruct memory review;

        review.id = reviewsOf[appartmentId].length;
        review.appartmentId = appartmentId;
        review.reviewText = reviewText;
        review.timestamp = block.timestamp;
        review.owner = msg.sender;

        reviewsOf[appartmentId].push(review);
        return true;
    }

    function getReviews(uint appartmentId) public view returns(ReviewStruct[] memory) {
        return reviewsOf[appartmentId];
    }





    /*
    struct Booking {
        uint id;
        address tenant;
        uint selected_date;
        uint price;
        bool checked;
        uint start_date;
        bool cancelled;
    }

    struct BookingStruct {
        uint id;
        address tenant;
        uint selected_date;
        uint price;
        bool checked;  
        uint start_date;
    }

mapping(uint => Booking[]) public bookingsOf;
mapping(uint => mapping(uint => bool)) public dateAvailability;
mapping(uint => mapping(uint => Booking)) public bookingsByDate;

function bookApartment(uint id, uint[] memory selected_dates, uint start_date) public payable returns (bool) {    
    require(apartmentExists[id], "Apartment not found!");
    require(msg.value >= apartments[id].price + securityFee, "Insufficient fund!");

    for (uint i = 0; i < selected_dates.length; i++) {
        require(!dateAvailability[id][selected_dates[i]], "Selected date is not available");
        Booking memory booking;
        booking.id = bookingsOf[id].length;
        booking.tenant = msg.sender;
        booking.selected_date = selected_dates[i];
        booking.price = apartments[id].price;
        booking.checked = false;
        booking.start_date = start_date;
        booking.cancelled = false;
        bookingsOf[id].push(booking);
        dateAvailability[id][selected_dates[i]] = true;
        bookingsByDate[id][selected_dates[i]] = booking;
    }

    return true;
}

function cancelBooking(uint id, uint selected_date) public returns (bool) {
    require(bookingsByDate[id][selected_date].tenant == msg.sender, "Only the tenant can cancel a booking");
    require(!bookingsByDate[id][selected_date].checked, "Booking has already started");
    require(!bookingsByDate[id][selected_date].cancelled, "Booking has already been cancelled");

    uint booking_id = bookingsByDate[id][selected_date].id;
    uint refundAmount = bookingsOf[id][booking_id].price;

    bookingsOf[id][booking_id].cancelled = true;
    dateAvailability[id][selected_date] = false;
    delete bookingsByDate[id][selected_date];

    payable(msg.sender).transfer(refundAmount);

    return true;
}

function getUnavailableDates(uint id) public view returns (uint[] memory) {
    uint[] memory dateAvailability = new uint[](bookingsOf[id].length);
    uint count = 0;

    for (uint i = 0; i < bookingsOf[id].length; i++) {
        if (!bookingsOf[id][i].cancelled) {
            dateAvailability[count] = bookingsOf[id][i].selected_date;
            count++;
        }
    }

    uint[] memory result = new uint[](count);
    for (uint i = 0; i < count; i++) {
        result[i] = dateAvailability[i];
    }

    return result;
}


    function bookApartment(uint id, uint start_date, uint num_days) public payable returns (bool) { 
        require(appartmentExist[id], "Apartment not found!");
        require(msg.value >= apartments[id].price * num_days + securityFee, "Insufficient fund!");

        if(!bookedStartDate[start_date]) {
            bookedStartDate[start_date] == true;
            for (uint i = 1; i <= num_days; i++) {
                BookingStruct memory booking;
                booking.id = bookingsOf[id].length;
                booking.tenant = msg.sender;
                booking.timeframeInDays = start_date + (i * 1 days);
                booking.price = apartments[id].price;
                booking.start_date = start_date;
                bookingsOf[id].push(booking);
           }
        }else if(bookedStartDate[start_date] == true){
            revert("Date has been booked already!");
        }

        return true;
    }
    
     */
}