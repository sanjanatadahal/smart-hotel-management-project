import { useState } from "react";
import Navbar from "../components/Navbar";
import "./gallery.css";

// Assets
import boatRide from "../assets/boat ride.jpg";
import eveningView from "../assets/evening view.webp";
import eventHall from "../assets/event hall.jpg";
import executive1 from "../assets/executive 1.webp";
import executive2 from "../assets/executive 2.webp";
import executive3 from "../assets/executive 3.jpg";
import executive4 from "../assets/executive 4.jpg";
import family1 from "../assets/fam 1.webp";
import family2 from "../assets/fam 2.webp";
import family3 from "../assets/fam 3.webp";
import family4 from "../assets/fam 4.jpg";
import family5 from "../assets/fam 5.webp";
import fineDining from "../assets/fine dine.jpg";
import gardenArea from "../assets/garden_area.jpg";
import gardenView1 from "../assets/garden view 1.webp";
import gardenView2 from "../assets/garden view 2.jpeg";
import gardenView3 from "../assets/garden view 3.webp";
import gardenView4 from "../assets/garden view 4.webp";
import gardenView5 from "../assets/garden view 5.webp";
import gym from "../assets/gym facility.webp";
import hero from "../assets/hero.png";
import homepageView from "../assets/homepage pic.webp";
import hotelFacade from "../assets/hotel.jpg";
import hotelView from "../assets/img 2.jpg";
import kidsArea from "../assets/kids area.jpg";
import lobby from "../assets/lobby.jpg";
import meetingRoom from "../assets/meeting room fac.jpg";
import balcony1 from "../assets/pri bal 1.webp";
import balcony2 from "../assets/pri bal 2.webp";
import balcony3 from "../assets/pri bal 3.webp";
import balcony4 from "../assets/pri bal 4.webp";
import riverView1 from "../assets/river view 1.webp";
import riverView2 from "../assets/river view 2.webp";
import riverView3 from "../assets/river view 3.jpeg";
import riverView4 from "../assets/river view 4.webp";
import riversideCafe from "../assets/riverside cafe.jpg";
import roomImage from "../assets/room img 1.webp";
import spa from "../assets/Spa.webp";
import suite1 from "../assets/suite 1.jpeg";
import suite2 from "../assets/suite 2.jpg";
import suite3 from "../assets/suite 3.jpg";
import suite4 from "../assets/suite 4.jpeg";
import poolFacility from "../assets/swim pool fac.jpg";
import pool from "../assets/swimming pool.jpg";

const galleryImages = [
  { id: 1, title: "Riverside Twilight Panorama", category: "Property", src: hotelView },
  { id: 2, title: "Grand Reception & Atrium", category: "Lobby", src: lobby },
  { id: 3, title: "Temperature-Controlled Infinity Pool", category: "Wellness", src: pool },
  { id: 4, title: "Riverside Architecture", category: "Property", src: hero },
  { id: 5, title: "Hotel Facade", category: "Property", src: hotelFacade },
  { id: 6, title: "Sunset Boat Excursion", category: "Experiences", src: boatRide },
  { id: 7, title: "Evening by the River", category: "Property", src: eveningView },
  { id: 8, title: "Grand Event Hall", category: "Events", src: eventHall },
  { id: 9, title: "Executive Suite", category: "Rooms", src: executive1 },
  { id: 10, title: "Executive Suite Lounge", category: "Rooms", src: executive2 },
  { id: 11, title: "Executive Suite Retreat", category: "Rooms", src: executive3 },
  { id: 12, title: "Executive Suite Details", category: "Rooms", src: executive4 },
  { id: 13, title: "Family Suite", category: "Rooms", src: family1 },
  { id: 14, title: "Family Suite Living", category: "Rooms", src: family2 },
  { id: 15, title: "Family Suite Comfort", category: "Rooms", src: family3 },
  { id: 16, title: "Family Suite Bedroom", category: "Rooms", src: family4 },
  { id: 17, title: "Family Suite Balcony", category: "Rooms", src: family5 },
  { id: 18, title: "Fine Dining Experience", category: "Dining", src: fineDining },
  { id: 19, title: "Garden Courtyard", category: "Property", src: gardenArea },
  { id: 20, title: "Garden Oasis", category: "Property", src: gardenView1 },
  { id: 21, title: "Garden Walkway", category: "Property", src: gardenView2 },
  { id: 22, title: "Garden View", category: "Property", src: gardenView3 },
  { id: 23, title: "Garden Escape", category: "Property", src: gardenView4 },
  { id: 24, title: "Garden at Dusk", category: "Property", src: gardenView5 },
  { id: 25, title: "Fitness Studio", category: "Wellness", src: gym },
  { id: 26, title: "Riverside Welcome", category: "Property", src: homepageView },
  { id: 27, title: "Children's Play Area", category: "Experiences", src: kidsArea },
  { id: 28, title: "Meeting Room", category: "Events", src: meetingRoom },
  { id: 29, title: "Private Balcony", category: "Rooms", src: balcony1 },
  { id: 30, title: "Balcony River View", category: "Rooms", src: balcony2 },
  { id: 31, title: "Balcony Lounge", category: "Rooms", src: balcony3 },
  { id: 32, title: "Balcony Retreat", category: "Rooms", src: balcony4 },
  { id: 33, title: "Deluxe Riverside Room", category: "Rooms", src: riverView1 },
  { id: 34, title: "Morning River View", category: "Rooms", src: riverView2 },
  { id: 35, title: "Riverside Room View", category: "Rooms", src: riverView3 },
  { id: 36, title: "Riverfront Room", category: "Rooms", src: riverView4 },
  { id: 37, title: "Riverside Café", category: "Dining", src: riversideCafe },
  { id: 38, title: "Guest Room Interior", category: "Rooms", src: roomImage },
  { id: 39, title: "Spa Sanctuary", category: "Wellness", src: spa },
  { id: 40, title: "Riverside Suite", category: "Rooms", src: suite1 },
  { id: 41, title: "Suite Living", category: "Rooms", src: suite2 },
  { id: 42, title: "Suite Bedroom", category: "Rooms", src: suite3 },
  { id: 43, title: "Suite Escape", category: "Rooms", src: suite4 },
  { id: 44, title: "Poolside Leisure", category: "Wellness", src: poolFacility },
];

const categories = ["All", "Property", "Rooms", "Wellness", "Lobby", "Dining", "Events", "Experiences"];

function Gallery() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightboxImage, setLightboxImage] = useState(null);

  const filteredImages = galleryImages.filter(
    (img) => activeCategory === "All" || img.category === activeCategory
  );

  return (
    <div className="gallery-page">
      <Navbar />

      <section className="gallery-header">
        <div className="gallery-header-content">
          <p>VISUAL RETREAT</p>
          <h1>Hotel Photo Gallery</h1>
          <span>Immerse yourself in the tranquility and timeless luxury of The Riverside Treat</span>
        </div>
      </section>

      <section className="gallery-intro">
        <span className="intro-tag">CURATED MOMENTS</span>
        <h2>Life Along the River</h2>
        <div className="gallery-divider"></div>
        <p>Explore our riverside grounds, luxurious guest suites, and world-class leisure facilities.</p>

        <div className="gallery-filter-bar">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`gallery-filter-btn ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <section className="gallery-grid-container">
        <div className="gallery-masonry-grid">
          {filteredImages.map((img) => (
            <div
              className="gallery-item-card"
              key={img.id}
              onClick={() => setLightboxImage(img)}
            >
              <img src={img.src} alt={img.title} loading="lazy" />
              <div className="gallery-item-overlay">
                <span className="item-cat">{img.category}</span>
                <h4>{img.title}</h4>
                <span className="zoom-hint">🔍 Click to enlarge</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LIGHTBOX MODAL */}
      {lightboxImage && (
        <div className="lightbox-overlay" onClick={() => setLightboxImage(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightboxImage(null)}>
              ✕
            </button>
            <img src={lightboxImage.src} alt={lightboxImage.title} />
            <div className="lightbox-caption">
              <h3>{lightboxImage.title}</h3>
              <p>{lightboxImage.category} Collection — The Riverside Treat Hotel</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gallery;
