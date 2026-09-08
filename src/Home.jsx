import { Link } from 'react-router-dom';

function Home() {
  return (
    <>
      <div className="marquee-bar">
        <div className="marquee-track">
          <span>NEW ARRIVALS WEEKLY</span>
          <span>DESIGNED FOR EVERY DAY</span>
          <span>TIMELESS FABRICS, CONSIDERED IN DETAIL</span>
          <span>NEW ARRIVALS WEEKLY</span>
          <span>DESIGNED FOR EVERY DAY</span>
          <span>TIMELESS FABRICS, CONSIDERED IN DETAIL</span>
        </div>
      </div>

      <header>
        <div className="brandmark">HIJAB HOME</div>
        <Link to="/shop" className="shop-now-btn" aria-label="Shop">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.4">
            <path d="M6 8h12l-1 12H7L6 8z" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" />
          </svg>
          <span>Shop Now</span>
        </Link>
      </header>

      <section className="hero">
        <div className="hero-eyebrow">EST. A PLACE FOR QUIET STYLE</div>
        <div className="hero-word">
          HIJAB
          <sup>
            <svg viewBox="0 0 40 40">
              <path d="M20 4 C20 12 24 14 30 16 C24 17 22 22 20 30 C18 22 16 17 10 16 C16 14 20 12 20 4Z" />
            </svg>
          </sup>
        </div>
        <div className="hero-sub">HOME</div>
      </section>

      <div className="intro-row">
        <span>02 · EVERYDAY PIECES, CONSIDERED IN DETAIL</span>
        <div className="rule"></div>
        <span className="right-label">EXPLORE BY COLLECTION</span>
      </div>

      <section className="edit-wrap">
        <div className="edit-head">
          <div>
            <div className="edit-eyebrow">THE WARDROBE</div>
            <h2 className="edit-title">Shop the edit</h2>
          </div>
          <p className="edit-desc">
            A considered selection of silhouettes, fabrics, and tones for the way you dress, modestly and on your own terms.
          </p>
        </div>

        <div className="cat-grid">
          <Link to="/shop?category=abaya" className="cat-card cat-c1">
            <div className="sprig-icon">
              <svg viewBox="0 0 40 40"><path d="M20 4 C20 12 24 14 30 16 C24 17 22 22 20 30" /></svg>
            </div>
            <div className="cat-row">
              <span className="cat-name serif">Abaya</span>
              <span className="cat-arrow">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6"><path d="M7 17 17 7M9 7h8v8" /></svg>
              </span>
            </div>
          </Link>

          <Link to="/shop?category=echarpe" className="cat-card cat-c2">
            <div className="sprig-icon">
              <svg viewBox="0 0 40 40"><path d="M20 4 C20 12 24 14 30 16 C24 17 22 22 20 30" /></svg>
            </div>
            <div className="cat-row">
              <span className="cat-name serif">Echarpe</span>
              <span className="cat-arrow">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6"><path d="M7 17 17 7M9 7h8v8" /></svg>
              </span>
            </div>
          </Link>

          <Link to="/shop?category=sets" className="cat-card cat-c3">
            <div className="sprig-icon">
              <svg viewBox="0 0 40 40"><path d="M20 4 C20 12 24 14 30 16 C24 17 22 22 20 30" /></svg>
            </div>
            <div className="cat-row">
              <span className="cat-name serif">Sets</span>
              <span className="cat-arrow">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6"><path d="M7 17 17 7M9 7h8v8" /></svg>
              </span>
            </div>
          </Link>

          <Link to="/shop?category=accessories" className="cat-card cat-c4">
            <div className="sprig-icon">
              <svg viewBox="0 0 40 40"><path d="M20 4 C20 12 24 14 30 16 C24 17 22 22 20 30" /></svg>
            </div>
            <div className="cat-row">
              <span className="cat-name serif">Accessories</span>
              <span className="cat-arrow">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6"><path d="M7 17 17 7M9 7h8v8" /></svg>
              </span>
            </div>
          </Link>
        </div>
      </section>

      <section className="statement">
        <div className="statement-inner">
          <div className="statement-eyebrow">OUR POINT OF VIEW</div>
          <h2 className="serif">
            Quiet fabrics, <em>honest</em> shapes. Modesty, styled your way.
          </h2>
        </div>
      </section>

      <footer>
        <div className="footer-grid">
          <div>
            <div className="footer-brand serif">Hijab Home</div>
            <p className="footer-tag">Modest clothing for the life you actually live.</p>
          </div>
          <div className="footer-col">
            <h4>Reach Us</h4>
            <a
              href="https://wa.me/96179059539?text=Hi!%20I'm%20interested%20in%20shopping%20at%20Hijab%20Home%20and%20I'd%20like%20some%20help."
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
            <a
              href="https://wa.me/96179059539?text=Hi!%20I'm%20interested%20in%20shopping%20at%20Hijab%20Home%20and%20I'd%20like%20some%20help."
              target="_blank"
              rel="noopener noreferrer"
            >
              +961 79 059 539 — send a message
            </a>
          </div>
          <div className="footer-col">
            <h4>Guide</h4>
            <p>Thoughtful style</p>
            <p>Every day</p>
          </div>
        </div>
        <div className="footer-bottom">
          <Link to="/portal-x7k9-login" className="admin-entry-link">© 2026 HIJAB HOME
          <span>DESIGNED WITH CARE</span></Link>
          
        </div>
      </footer>

      <a
        href="https://wa.me/96179059539?text=Hi!%20I'm%20interested%20in%20shopping%20at%20Hijab%20Home%20and%20I'd%20like%20some%20help."
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.51 2 12.04 2Zm5.8 14.11c-.24.68-1.19 1.25-1.95 1.41-.53.11-1.22.2-3.55-.76-2.98-1.24-4.9-4.26-5.05-4.46-.15-.2-1.21-1.61-1.21-3.07 0-1.46.75-2.17 1.02-2.47.24-.27.53-.34.7-.34l.51.01c.16.01.38-.06.6.46.24.57.81 1.98.88 2.13.07.15.11.32.02.51-.09.2-.14.32-.28.49-.14.17-.29.38-.42.51-.14.14-.28.29-.13.56.15.27.68 1.13 1.47 1.83 1.01.9 1.86 1.19 2.13 1.32.27.13.43.11.58-.07.16-.18.68-.79.86-1.06.18-.27.36-.22.6-.13.24.09 1.55.73 1.82.86.27.13.45.2.51.31.07.11.07.65-.17 1.33Z"/>
        </svg>
      </a>
    </>
  );
}

export default Home;
