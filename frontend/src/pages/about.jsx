import Navbar from "../components/Navbar";
import hotelImage from "../assets/hotel.jpg";
import eveningView from "../assets/evening view.webp";
import lobbyImage from "../assets/lobby.jpg";
import "./about.css";

function About() {
  return (
    <div className="about-page">
      <Navbar />
      <section className="about-hero" style={{ backgroundImage: `url(${hotelImage})` }}>
        <div>
          <p>OUR STORY</p>
          <h1>A riverside retreat, made memorable by its people.</h1>
        </div>
      </section>

      <main className="about-content">
        <section className="about-intro">
          <div>
            <p className="eyebrow">THE RIVERSIDE TREAT</p>
            <h2>Where warm hospitality meets the calm of the river.</h2>
            <p>Founded with a simple wish to create a more personal kind of escape, The Riverside Treat brings together peaceful surroundings, local character, and thoughtful modern comfort.</p>
            <p>Every stay is shaped around unhurried mornings, attentive service, and spaces designed for reconnecting—with nature, with loved ones, and with yourself.</p>
          </div>
          <img src={eveningView} alt="The Riverside Treat at sunset" />
        </section>

        <section className="about-timeline">
          <p className="eyebrow">OUR HISTORY</p>
          <h2>Built with care, grown with our guests.</h2>
          <div className="timeline-grid">
            <article><span>2014</span><h3>A riverside vision</h3><p>The first guest rooms opened with a focus on relaxed, sincere service and a close connection to the surrounding landscape.</p></article>
            <article><span>2018</span><h3>A place to gather</h3><p>Our dining room, event spaces, and wellness experiences expanded the hotel into a welcoming destination for celebrations and quiet weekends alike.</p></article>
            <article><span>Today</span><h3>Thoughtfully evolving</h3><p>We continue to refine every detail while preserving the warmth, calm, and familiar welcome that guests return for.</p></article>
          </div>
        </section>

        <section className="about-values">
          <img src={lobbyImage} alt="The hotel lobby" />
          <div><p className="eyebrow">OUR PROMISE</p><h2>Comfort that feels considered.</h2><p>From the welcome at reception to the last meal by the water, we believe luxury is found in small, meaningful details. Our team is here around the clock to make each visit feel effortless.</p></div>
        </section>
      </main>
    </div>
  );
}

export default About;
