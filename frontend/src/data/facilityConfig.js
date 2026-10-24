const facilityOverrides = {
  "Swimming Pool": {
    price: 200,
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
    hideCapacity: true,
  },
  "Gym & Fitness Studio": { hideCapacity: true },
  "Spa & Wellness": {
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
    hideCapacity: true,
  },
  "Garden / Outdoor Seating": {
    hideCapacity: true,
    isSeparateBooking: true,
    timeSlots: ["All Day"],
    isAllDayBooking: true,
    availabilityLabel: "Allowed from 6:00 AM to 7:00 PM",
  },
  "Boat Ride": {
    price: 900,
    capacity: 15,
    timeSlots: [
      "06:00 AM - 09:00 AM",
      "09:00 AM - 12:00 PM",
      "12:00 PM - 03:00 PM",
      "03:00 PM - 06:00 PM",
      "06:00 PM - 07:00 PM",
    ],
  },
  "Fine Dining Restaurant": {
    price: 0,
    pricingType: "as_per_order",
    hideCapacity: true,
    tableBooking: true,
    availableTables: [1, 2, 3, 4, 5],
  },
  "Riverside Café": {
    price: 0,
    pricingType: "as_per_order",
    hideCapacity: true,
    timeSlots: ["All Day"],
    isAllDayBooking: true,
    availabilityLabel: "Available whole day",
    tableBooking: true,
    availableTables: [1, 2, 3],
  },
  "Business Center": {
    capacity: 25,
    timeSlots: [
      "08:00 AM - 11:00 AM",
      "11:00 AM - 02:00 PM",
      "02:00 PM - 05:00 PM",
      "05:00 PM - 08:00 PM",
    ],
  },
  "Banquet / Event Hall": {
    capacity: 200,
    timeSlots: ["All Day"],
    isAllDayBooking: true,
  },
};

export function normalizeFacility(facility) {
  const name = facility.name === "Meeting Rooms" ? "Boat Ride" : facility.name;
  return { ...facility, name, ...(facilityOverrides[name] || {}) };
}
