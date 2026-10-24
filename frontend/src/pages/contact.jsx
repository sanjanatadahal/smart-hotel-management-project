import Navbar from "../components/Navbar";
import hotelImage from "../assets/evening view.webp";
import "./about.css";

function Contact() {
  return (
    <div className="about-page">
      <Navbar />
      <section className="about-hero contact-hero" style={{ backgroundImage: `url(${hotelImage})` }}>
        <div><p>CONTACT THE RIVERSIDE TREAT</p><h1>We are here to make your stay effortless.</h1></div>
      </section>
      <main className="about-content contact-content">
        <p className="eyebrow">GET IN TOUCH</p>
        <h2>Plan your riverside escape.</h2>
        <div className="timeline-grid contact-grid">
          <article><span>VISIT</span><h3>Our location</h3><p>Riverside Road<br />Hubli, Karnataka, India</p></article>
          <article><span>CALL</span><h3>Reservations & reception</h3><p><a href="tel:+919876543210">+91 98765 43210</a><br />Reception open 24 hours, every day.</p></article>
          <article><span>EMAIL</span><h3>Guest services</h3><p><a href="mailto:riversidetreat@gmail.com">riversidetreat@gmail.com</a><br />We reply to all enquiries as soon as possible.</p></article>
        </div>
      </main>
    </div>
  );
}

export default Contact;
