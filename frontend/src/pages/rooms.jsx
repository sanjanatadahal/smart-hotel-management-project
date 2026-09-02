import { useState } from "react";
import "./rooms.css";

import deluxeRoom1 from "../assets/river view 1.webp";
import deluxeRoom2 from "../assets/river view 2.webp";
import deluxeRoom3 from "../assets/river view 3.jpeg";
import deluxeRoom4 from "../assets/river view 4.webp";


import gardenRoom1 from "../assets/garden view 2.jpeg";
import gardenRoom2 from "../assets/garden view 1.webp";
import gardenRoom3 from "../assets/garden view 5.webp";
import gardenRoom4 from "../assets/garden view 3.webp";
import gardenRoom5 from "../assets/garden view 4.webp";

import riversideSuite1 from "../assets/suite 1.jpeg";
import riversideSuite2 from "../assets/suite 3.jpg";
import riversideSuite3 from "../assets/suite 2.jpg";
import riversideSuite4 from "../assets/suite 4.jpeg";


import familyRoom1 from "../assets/fam 5.webp";
import familyRoom2 from "../assets/fam 2.webp";
import familyRoom3 from "../assets/fam 1.webp";
import familyRoom4 from "../assets/fam 3.webp";
import familyRoom5 from "../assets/fam 4.jpg";


import executiveRoom1 from "../assets/executive 1.webp";
import executiveRoom2 from "../assets/executive 2.webp";
import executiveRoom3 from "../assets/executive 3.jpg";
import executiveRoom4 from "../assets/executive 4.jpg";


import luxurySuite1 from "../assets/pri bal 2.webp";
import luxurySuite2 from "../assets/pri bal 1.webp";
import luxurySuite3 from "../assets/pri bal 3.webp";
import luxurySuite4 from "../assets/pri bal 4.webp";



const rooms = [
  {
    name: "Deluxe Riverside Room",
    images: [deluxeRoom1,deluxeRoom2,deluxeRoom3,deluxeRoom4],
    bed: "King Bed",
    guests: "2 Guests",
    price: "₹4,500 / Night",
    description:
      "A comfortable and elegant room offering a peaceful stay with a beautiful view of the riverside.",
  },
  {
    name: "Premium Garden Room",
    images: [gardenRoom1,gardenRoom2,gardenRoom3,gardenRoom4,gardenRoom5],
    bed: "Queen Bed",
    guests: "2 Guests",
    price: "₹4,000 / Night",
    description:
      "Relax in a peaceful room surrounded by greenery, perfect for a calm and refreshing getaway.",
  },
  {
    name: "Riverside Suite",
    images: [riversideSuite1,riversideSuite2,riversideSuite3,riversideSuite4],
    bed: "King Bed",
    guests: "3 Guests",
    price: "₹6,500 / Night",
    description:
      "A spacious suite with elegant interiors and a stunning panoramic view of the riverside.",
  },
  {
    name: "Family Room",
    images: [familyRoom1,familyRoom2,familyRoom3,familyRoom4,familyRoom5],
    bed: "2 Double Beds",
    guests: "4 Guests",
    price: "₹7,500 / Night",
    description:
      "A spacious room designed for families, providing comfort and plenty of space for everyone.",
  },
  {
    name: "Executive Room",
    images: [executiveRoom1,executiveRoom2,executiveRoom3,executiveRoom4],
    bed: "King Bed",
    guests: "2 Guests",
    price: "₹5,500 / Night",
    description:
      "A stylish room combining modern comfort with a quiet atmosphere for business and leisure stays.",
  },
  {
    name: "Luxury River Suite",
    images: [luxurySuite1,luxurySuite2,luxurySuite3,luxurySuite4],
    bed: "King Bed",
    guests: "2 Guests",
    price: "₹8,500 / Night",
    description:
      "A luxurious suite with elegant interiors, a private balcony and a breathtaking riverside view for an unforgettable stay.",
  },
];

function Rooms() {
  const [activeImages, setActiveImages] = useState({});

  const showPreviousImage = (roomIndex, totalImages) => {
    setActiveImages((previousImages) => {
      const currentImage = previousImages[roomIndex] || 0;

      return {
        ...previousImages,
        [roomIndex]: currentImage === 0 ? totalImages - 1 : currentImage - 1,
      };
    });
  };

  const showNextImage = (roomIndex, totalImages) => {
    setActiveImages((previousImages) => {
      const currentImage = previousImages[roomIndex] || 0;

      return {
        ...previousImages,
        [roomIndex]: currentImage === totalImages - 1 ? 0 : currentImage + 1,
      };
    });
  };

  return (
    <div className="rooms-page">
      {/* HEADER */}
      <section className="rooms-header">
        <div className="rooms-header-content">
          <p>STAY WITH US</p>
          <h1>Our Rooms</h1>
          <span>Comfort, elegance and a memorable riverside experience</span>
        </div>
      </section>

      {/* INTRO */}
      <section className="rooms-intro">
        <p className="intro-title">THE RIVERSIDE TREAT</p>

        <h2>Choose Your Perfect Stay</h2>

        <p>
          Discover our carefully designed rooms and suites, created to make
          your stay comfortable, peaceful and memorable.
        </p>
      </section>

      {/* ROOMS */}
      <section className="rooms-list">
        {rooms.map((room, index) => {
          const currentImage = activeImages[index] || 0;

          return (
            <div className="room-card" key={index}>
              <div className="room-image">
                <img
                  src={room.images[currentImage]}
                  alt={`${room.name} - ${currentImage + 1}`}
                />

                <button
                  className="image-arrow image-arrow-left"
                  onClick={() => showPreviousImage(index, room.images.length)}
                  aria-label={`View previous image of ${room.name}`}
                >
                  ❮
                </button>

                <button
                  className="image-arrow image-arrow-right"
                  onClick={() => showNextImage(index, room.images.length)}
                  aria-label={`View next image of ${room.name}`}
                >
                  ❯
                </button>

                <span className="image-count">
                  {currentImage + 1} / {room.images.length}
                </span>
              </div>

              <div className="room-content">
                <h3>{room.name}</h3>

                <p className="room-description">{room.description}</p>

                <div className="room-details">
                  <span>🛏️ {room.bed}</span>
                  <span>👤 {room.guests}</span>
                </div>

                <div className="room-footer">
                  <strong>{room.price}</strong>

                  <button onClick={() => alert(`Viewing ${room.name}`)}>
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* BOTTOM */}
      <section className="rooms-ending">
        <p>THE RIVERSIDE TREAT</p>
        <h2>A stay that will always stay with you.</h2>
      </section>
    </div>
  );
}

export default Rooms;