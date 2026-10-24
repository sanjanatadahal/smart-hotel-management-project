const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Room = require("./models/Room");
const Facility = require("./models/Facility");
const FoodItem = require("./models/FoodItem");
const Booking = require("./models/Booking");
const FacilityBooking = require("./models/FacilityBooking");
const FoodOrder = require("./models/FoodOrder");
const CleaningTask = require("./models/CleaningTask");

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB for seeding...");

    // Clear existing collections
    await User.deleteMany({});
    await Room.deleteMany({});
    await Facility.deleteMany({});
    await FoodItem.deleteMany({});
    await Booking.deleteMany({});
    await FacilityBooking.deleteMany({});
    await FoodOrder.deleteMany({});
    await CleaningTask.deleteMany({});

    console.log("Cleared old database records.");

    // 1. Seed Users
    const adminUser = await User.create({
      name: "Hotel Administrator",
      email: "admin@riversidetreat.com",
      phone: "+91 98765 00001",
      password: "Admin@123",
      role: "admin",
      isActive: true,
    });

    const receptionStaff = await User.create({
      name: "Sonia Rao (Reception)",
      email: "reception@riversidetreat.com",
      phone: "+91 98765 00002",
      password: "Staff@123",
      role: "reception",
      isActive: true,
    });

    const housekeepingStaff = await User.create({
      name: "Ramesh Kumar (Housekeeping)",
      email: "housekeeping@riversidetreat.com",
      phone: "+91 98765 00003",
      password: "Staff@123",
      role: "housekeeping",
      isActive: true,
    });

    const kitchenStaff = await User.create({
      name: "Chef Vikrant (Kitchen)",
      email: "kitchen@riversidetreat.com",
      phone: "+91 98765 00004",
      password: "Staff@123",
      role: "kitchen",
      isActive: true,
    });

    const demoGuest = await User.create({
      name: "Aarav Sharma",
      email: "guest@example.com",
      phone: "+91 98765 43210",
      password: "Guest@123",
      role: "customer",
      isActive: true,
    });

    console.log("Users created successfully.");

    // 2. Seed Rooms (The 6 existing room types)
    const roomsData = [
      {
        name: "Deluxe Riverside Room",
        roomNumber: "101",
        type: "Deluxe Riverside Room",
        price: 4500,
        bed: "King Bed",
        guests: 2,
        description: "A comfortable and elegant room offering a peaceful stay with a beautiful view of the riverside.",
        images: [
          "/src/assets/river view 1.webp",
          "/src/assets/river view 2.webp",
          "/src/assets/river view 3.jpeg",
          "/src/assets/river view 4.webp",
        ],
        status: "Available",
        cleaningStatus: "Clean",
      },
      {
        name: "Premium Garden Room",
        roomNumber: "201",
        type: "Premium Garden Room",
        price: 4000,
        bed: "Queen Bed",
        guests: 2,
        description: "Relax in a peaceful room surrounded by greenery, perfect for a calm and refreshing getaway.",
        images: [
          "/src/assets/garden view 2.jpeg",
          "/src/assets/garden view 1.webp",
          "/src/assets/garden view 5.webp",
          "/src/assets/garden view 3.webp",
          "/src/assets/garden view 4.webp",
        ],
        status: "Available",
        cleaningStatus: "Clean",
      },
      {
        name: "Riverside Suite",
        roomNumber: "301",
        type: "Riverside Suite",
        price: 6500,
        bed: "King Bed",
        guests: 3,
        description: "A spacious suite with elegant interiors and a stunning panoramic view of the riverside.",
        images: [
          "/src/assets/suite 1.jpeg",
          "/src/assets/suite 3.jpg",
          "/src/assets/suite 2.jpg",
          "/src/assets/suite 4.jpeg",
        ],
        status: "Available",
        cleaningStatus: "Clean",
      },
      {
        name: "Family Room",
        roomNumber: "401",
        type: "Family Room",
        price: 7500,
        bed: "2 Double Beds",
        guests: 4,
        description: "A spacious room designed for families, providing comfort and plenty of space for everyone.",
        images: [
          "/src/assets/fam 5.webp",
          "/src/assets/fam 2.webp",
          "/src/assets/fam 1.webp",
          "/src/assets/fam 3.webp",
          "/src/assets/fam 4.jpg",
        ],
        status: "Available",
        cleaningStatus: "Clean",
      },
      {
        name: "Executive Room",
        roomNumber: "501",
        type: "Executive Room",
        price: 5500,
        bed: "King Bed",
        guests: 2,
        description: "A stylish room combining modern comfort with a quiet atmosphere for business and leisure stays.",
        images: [
          "/src/assets/executive 1.webp",
          "/src/assets/executive 2.webp",
          "/src/assets/executive 3.jpg",
          "/src/assets/executive 4.jpg",
        ],
        status: "Available",
        cleaningStatus: "Clean",
      },
      {
        name: "Luxury River Suite",
        roomNumber: "601",
        type: "Luxury River Suite",
        price: 8500,
        bed: "King Bed",
        guests: 2,
        description: "A luxurious suite with elegant interiors, a private balcony and a breathtaking riverside view for an unforgettable stay.",
        images: [
          "/src/assets/pri bal 2.webp",
          "/src/assets/pri bal 1.webp",
          "/src/assets/pri bal 3.webp",
          "/src/assets/pri bal 4.webp",
        ],
        status: "Available",
        cleaningStatus: "Clean",
      },
    ];

    const createdRooms = await Room.insertMany(roomsData);
    console.log(`Created ${createdRooms.length} rooms.`);

    // 3. Seed Facilities
    const facilitiesData = [
      {
        name: "Swimming Pool",
        description: "Infinity edge riverside swimming pool with temperature control and sun loungers.",
        image: "/src/assets/swim pool fac.jpg",
        price: 200,
        pricingType: "per_person",
        capacity: 20,
        timeSlots: [
          "06:00 AM - 08:00 AM",
          "08:00 AM - 10:00 AM",
          "10:00 AM - 12:00 PM",
          "12:00 PM - 02:00 PM",
          "02:00 PM - 04:00 PM",
          "04:00 PM - 06:00 PM",
          "06:00 PM - 08:00 PM",
          "08:00 PM - 10:00 PM",
        ],
        isRoomAddon: true,
        isSeparateBooking: true,
      },
      {
        name: "Spa & Wellness",
        description: "Holistic ayurvedic massages, aromatherapy, sauna, and rejuvenation treatments.",
        image: "/src/assets/Spa.webp",
        price: 1500,
        pricingType: "per_slot",
        capacity: 6,
        timeSlots: [
          "07:00 AM - 09:00 AM",
          "09:00 AM - 11:00 AM",
          "11:00 AM - 01:00 PM",
          "01:00 PM - 03:00 PM",
          "03:00 PM - 05:00 PM",
          "05:00 PM - 07:00 PM",
          "07:00 PM - 09:00 PM",
          "09:00 PM - 11:00 PM",
        ],
        isRoomAddon: false,
        isSeparateBooking: true,
      },
      {
        name: "Gym & Fitness Studio",
        description: "State-of-the-art cardio machines, free weights, resistance equipment, and yoga area.",
        image: "/src/assets/gym facility.webp",
        price: 200,
        pricingType: "per_person",
        capacity: 15,
        timeSlots: [
          "06:00 AM - 08:00 AM",
          "08:00 AM - 10:00 AM",
          "10:00 AM - 12:00 PM",
          "04:00 PM - 06:00 PM",
          "06:00 PM - 08:00 PM",
          "08:00 PM - 10:00 PM",
        ],
        isRoomAddon: true,
        isSeparateBooking: true,
      },
      {
        name: "Boat Ride",
        description: "Scenic riverside boat rides offering a relaxing way to enjoy the water and surrounding views.",
        image: "/src/assets/boat ride.jpg",
        price: 900,
        pricingType: "per_slot",
        capacity: 15,
        timeSlots: [
          "06:00 AM - 09:00 AM",
          "09:00 AM - 12:00 PM",
          "12:00 PM - 03:00 PM",
          "03:00 PM - 06:00 PM",
          "06:00 PM - 07:00 PM",
        ],
        isRoomAddon: false,
        isSeparateBooking: true,
      },
      {
        name: "Banquet / Event Hall",
        description: "Grand riverside banquet hall ideal for weddings, celebrations, and corporate galas with stage and AV setup.",
        image: "/src/assets/event hall.jpg",
        price: 25000,
        pricingType: "per_slot",
        capacity: 200,
        timeSlots: ["All Day"],
        isAllDayBooking: true,
        isRoomAddon: false,
        isSeparateBooking: true,
      },
      {
        name: "Fine Dining Restaurant",
        description: "Culinary excellence offering gourmet Indian, Continental, and Oriental cuisines with riverside views.",
        image: "/src/assets/fine dine.jpg",
        price: 0,
        pricingType: "as_per_order",
        capacity: 50,
        timeSlots: [
          "07:00 AM - 11:00 AM (Breakfast)",
          "12:00 PM - 03:00 PM (Lunch)",
          "07:30 PM - 11:00 PM (Dinner)",
        ],
        isRoomAddon: true,
        isSeparateBooking: true,
      },
      {
        name: "Riverside Café",
        description: "Artisanal coffees, teas, patisserie, and light bistro snacks on the riverside deck.",
        image: "/src/assets/riverside cafe.jpg",
        price: 0,
        pricingType: "as_per_order",
        capacity: 30,
        timeSlots: ["All Day"],
        isAllDayBooking: true,
        isRoomAddon: false,
        isSeparateBooking: true,
      },
      {
        name: "Kids Play Area",
        description: "Safe, supervised fun zone featuring indoor games, slides, coloring corners, and arcade games.",
        image: "/src/assets/kids area.jpg",
        price: 250,
        pricingType: "per_person",
        capacity: 25,
        timeSlots: [
          "10:00 AM - 01:00 PM",
          "03:00 PM - 06:00 PM",
          "06:00 PM - 09:00 PM",
        ],
        isRoomAddon: true,
        isSeparateBooking: true,
      },
      {
        name: "Garden / Outdoor Seating",
        description: "Serene landscaped riverside gardens with gazebo seating, bonfires, and evening acoustic music.",
        image: "/src/assets/garden_area.jpg",
        price: 0,
        pricingType: "complimentary",
        capacity: 40,
        timeSlots: ["All Day"],
        isAllDayBooking: true,
        isRoomAddon: false,
        isSeparateBooking: true,
      },
      {
        name: "Business Center",
        description: "Private workstations, printing, scanning, high-speed fiber internet, and secretarial assistance.",
        image: "/src/assets/meeting room fac.jpg",
        price: 300,
        pricingType: "per_slot",
        capacity: 25,
        timeSlots: [
          "08:00 AM - 11:00 AM",
          "11:00 AM - 02:00 PM",
          "02:00 PM - 05:00 PM",
          "05:00 PM - 08:00 PM",
        ],
        isRoomAddon: true,
        isSeparateBooking: true,
      },
    ];

    const createdFacilities = await Facility.insertMany(facilitiesData);
    console.log(`Created ${createdFacilities.length} facilities.`);

    // 4. Seed Food Items
    const foodItemsData = [
      // Starters
      {
        name: "Paneer Tikka Angara",
        category: "Starters",
        price: 340,
        description: "Chargrilled cottage cheese marinated in aromatic spicy yoghurt and herbs.",
        isVeg: true,
        isAvailable: true,
      },
      {
        name: "Crispy Riverside Corn",
        category: "Starters",
        price: 260,
        description: "Golden fried sweet corn tossed with spring onions, bell peppers, and chili garlic seasoning.",
        isVeg: true,
        isAvailable: true,
      },
      {
        name: "Murgh Malai Tikka",
        category: "Starters",
        price: 420,
        description: "Tender chicken morsels steeped in cream, cardamom, and gentle tandoor smoke.",
        isVeg: false,
        isAvailable: true,
      },
      {
        name: "Tandoori Fish Amritsari",
        category: "Starters",
        price: 480,
        description: "Fresh river fish fillets crisped in gram flour, carom seeds, and tangy spices.",
        isVeg: false,
        isAvailable: true,
      },

      // Main Course
      {
        name: "Dal Makhani Royal",
        category: "Main Course",
        price: 320,
        description: "Slow-simmered black lentils over charcoal overnight with butter and cream.",
        isVeg: true,
        isAvailable: true,
      },
      {
        name: "Paneer Butter Masala",
        category: "Main Course",
        price: 380,
        description: "Rich and silky tomato cashew gravy with fresh cottage cheese chunks.",
        isVeg: true,
        isAvailable: true,
      },
      {
        name: "Butter Chicken Riverside",
        category: "Main Course",
        price: 450,
        description: "Classic tender tandoori chicken cooked in velvety spiced tomato butter reduction.",
        isVeg: false,
        isAvailable: true,
      },
      {
        name: "Kashmiri Mutton Rogan Josh",
        category: "Main Course",
        price: 540,
        description: "Slow-cooked prime mutton cuts in aromatic Kashmiri red chili and fennel gravy.",
        isVeg: false,
        isAvailable: true,
      },
      {
        name: "Garlic Butter Naan (2 Pcs)",
        category: "Main Course",
        price: 120,
        description: "Tandoor baked flatbread infused with chopped garlic and melted butter.",
        isVeg: true,
        isAvailable: true,
      },

      // Riverside Specials
      {
        name: "Riverside Catch Tawa Masala",
        category: "Riverside Specials",
        price: 520,
        description: "Chef's signature grilled fresh river fish tossed in roasted onion tomato masala.",
        isVeg: false,
        isAvailable: true,
      },
      {
        name: "Dum Handi Dum Biryani",
        category: "Riverside Specials",
        price: 440,
        description: "Fragrant basmati rice layered with herbs and spices, sealed in traditional clay pot.",
        isVeg: true,
        isAvailable: true,
      },
      {
        name: "Riverside Platter",
        category: "Riverside Specials",
        price: 690,
        description: "Assortment of chef's finest tandoori appetizers served with mint chutney and laccha onions.",
        isVeg: true,
        isAvailable: true,
      },

      // Desserts
      {
        name: "Gulab Jamun with Rabri",
        category: "Desserts",
        price: 180,
        description: "Warm golden milk dumplings served with rich cardamom condensed milk rabri.",
        isVeg: true,
        isAvailable: true,
      },
      {
        name: "Riverside Sizzling Brownie",
        category: "Desserts",
        price: 240,
        description: "Gooey chocolate walnut brownie on a smoking cast iron platter with vanilla ice cream.",
        isVeg: true,
        isAvailable: true,
      },

      // Beverages
      {
        name: "Fresh Mint Mojito",
        category: "Beverages",
        price: 190,
        description: "Refreshing lime, bruised mint leaves, simple syrup, and sparkling soda over crushed ice.",
        isVeg: true,
        isAvailable: true,
      },
      {
        name: "Masala Chai Pot",
        category: "Beverages",
        price: 130,
        description: "Aromatic freshly brewed spiced tea with ginger, cardamom, and whole milk.",
        isVeg: true,
        isAvailable: true,
      },
      {
        name: "Riverside Cold Coffee with Ice Cream",
        category: "Beverages",
        price: 210,
        description: "Creamy blended espresso shake topped with a generous scoop of vanilla ice cream.",
        isVeg: true,
        isAvailable: true,
      },
    ];

    const createdFoodItems = await FoodItem.insertMany(foodItemsData);
    console.log(`Created ${createdFoodItems.length} food items.`);

    // 5. Seed a Sample Booking for Guest
    const sampleBooking = await Booking.create({
      bookingId: "BK-842911",
      userId: demoGuest._id,
      guestName: demoGuest.name,
      guestEmail: demoGuest.email,
      guestPhone: demoGuest.phone,
      roomId: createdRooms[0]._id,
      roomName: createdRooms[0].name,
      roomNumber: createdRooms[0].roomNumber,
      checkIn: new Date("2026-09-10"),
      checkOut: new Date("2026-09-13"),
      guests: 2,
      selectedFacilities: [
        { facilityId: createdFacilities[5]._id, name: "Breakfast Buffet", price: 500 },
        { facilityId: createdFacilities[0]._id, name: "Pool Access", price: 300 },
      ],
      roomAmount: 13500, // 4500 * 3 nights
      facilitiesAmount: 800,
      totalAmount: 14300,
      paymentMethod: "UPI",
      paymentStatus: "Paid",
      bookingStatus: "Confirmed",
      qrCodeData: JSON.stringify({
        bookingId: "BK-842911",
        guest: demoGuest.name,
        room: createdRooms[0].name,
        roomNumber: createdRooms[0].roomNumber,
        checkIn: "2026-09-10",
        checkOut: "2026-09-13",
        total: "₹14,300",
        status: "Paid",
      }),
    });

    // 6. Seed a Sample Facility Booking (Spa)
    const spaFacility = createdFacilities.find((f) => f.name.includes("Spa"));
    const sampleFacilityBooking = await FacilityBooking.create({
      facilityBookingId: "FB-419082",
      userId: demoGuest._id,
      guestName: demoGuest.name,
      guestEmail: demoGuest.email,
      guestPhone: demoGuest.phone,
      facilityId: spaFacility ? spaFacility._id : createdFacilities[1]._id,
      facilityName: spaFacility ? spaFacility.name : "Spa & Wellness",
      date: "2026-09-11",
      timeSlot: "11:00 AM - 01:00 PM",
      numberOfPeople: 2,
      pricePerUnit: 1500,
      totalAmount: 3000,
      paymentMethod: "Card",
      paymentStatus: "Paid",
      bookingStatus: "Confirmed",
      qrCodeData: JSON.stringify({
        facilityBookingId: "FB-419082",
        guest: demoGuest.name,
        facility: "Spa & Wellness",
        date: "2026-09-11",
        timeSlot: "11:00 AM - 01:00 PM",
        total: "₹3,000",
        status: "Paid",
      }),
    });

    // 7. Seed a Sample Food Order
    const sampleFoodOrder = await FoodOrder.create({
      orderId: "ORD-938210",
      userId: demoGuest._id,
      customerName: demoGuest.name,
      roomNumber: "101",
      items: [
        {
          foodItemId: createdFoodItems[0]._id,
          name: createdFoodItems[0].name,
          price: createdFoodItems[0].price,
          quantity: 1,
        },
        {
          foodItemId: createdFoodItems[6]._id,
          name: createdFoodItems[6].name,
          price: createdFoodItems[6].price,
          quantity: 1,
        },
        {
          foodItemId: createdFoodItems[8]._id,
          name: createdFoodItems[8].name,
          price: createdFoodItems[8].price,
          quantity: 2,
        },
      ],
      totalAmount: 1030,
      paymentMethod: "UPI",
      paymentStatus: "Paid",
      orderStatus: "New",
      notes: "Please deliver hot, extra spicy gravy.",
    });

    // 8. Seed Initial Cleaning Tasks
    await CleaningTask.create({
      taskId: "CLN-10294",
      roomId: createdRooms[1]._id,
      roomNumber: "201",
      roomName: createdRooms[1].name,
      status: "Needs Cleaning",
      notes: "Post-checkout sanitization and fresh linens required.",
      assignedTo: "Ramesh Kumar (Housekeeping)",
    });

    await CleaningTask.create({
      taskId: "CLN-10295",
      roomId: createdRooms[4]._id,
      roomNumber: "501",
      roomName: createdRooms[4].name,
      status: "Under Cleaning",
      notes: "Deep carpet vacuuming in progress.",
      assignedTo: "Ramesh Kumar (Housekeeping)",
    });

    console.log("Database seeded successfully with initial records!");
    process.exit(0);
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
};

seedDatabase();
