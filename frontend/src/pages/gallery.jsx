import { useState } from "react";
import Navbar from "../components/Navbar";
import "./gallery.css";

// Assets
import hotelView from "../assets/img 2.jpg";
import lobby from "../assets/lobby.jpg";
import pool from "../assets/swimming pool.jpg";
import hero from "../assets/hero.png";
import hotelFac from "../assets/hotel.jpg";
import riverView1 from "../assets/river view 1.webp";
import riverView2 from "../assets/river view 2.webp";
import gardenView1 from "../assets/garden view 1.webp";
import suite1 from "../assets/suite 1.jpeg";
import fam1 from "../assets/fam 1.webp";
import exec1 from "../assets/executive 1.webp";
import priBal1 from "../assets/pri bal 1.webp";

const galleryImages = [
  { id: 1, title: "Riverside Twilight Panorama", category: "Property", src: hotelView },
  { id: 2, title: "Grand Reception & Atrium", category: "Lobby", src: lobby },
  { id: 3, title: "Temperature Controlled Infinity Pool", category: "Wellness", src: pool },
  { id: 4, title: "Riverside Architecture", category: "Property", src: hero },
  { id: 5, title: "Fine Dining Riverside Deck", category: "Dining", src: hotelFac },
  { id: 6, title: "Deluxe Riverside Room Interior", category: "Rooms", src: riverView1 },
  { id: 7, title: "Morning Sun on the Balcony", category: "Rooms", src: riverView2 },
  { id: 8, title: "Verdant Garden Oasis", category: "Property", src: gardenView1 },
  { id: 9, title: "Riverside Presidential Suite", category: "Rooms", src: suite1 },
  { id: 10, title: "Spacious Family Suite", category: "Rooms", src: fam1 },
  { id: 11, title: "Executive Suite Workstation", category: "Rooms", src: exec1 },
  { id: 12, title: "Private Jacuzzi Balcony", category: "Rooms", src: priBal1 },
];

const categories = ["All", "Property", "Rooms", "Wellness", "Lobby", "Dining"];

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
