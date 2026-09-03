"use client";

import { useState, useEffect } from "react";
import "./globals.css";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading && (
        <div id="preloader">
          <div className="loader-ring"></div>
        </div>
      )}

      <nav className="navbar">
        <div className="brand-box">
          <div className="brand-title">HESHAN <span>OFC</span></div>
          <div className="brand-sub">DINIDU HESHAN</div>
        </div>

        <button 
          className="menu-btn" 
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle Navigation"
        >
          <i className={`fa-solid ${menuOpen ? "fa-xmark" : "fa-bars"}`}></i>
        </button>
      </nav>

      {menuOpen && (
        <>
          <div className="menu-overlay" onClick={() => setMenuOpen(false)}></div>
          <div className="menu-container">
            <a href="#home" className="menu-item active" onClick={() => setMenuOpen(false)}>
              <div className="menu-item-left"><i className="fa-solid fa-house"></i> Home</div>
              <i className="fa-solid fa-chevron-right chevron"></i>
            </a>
            <a href="#about" className="menu-item" onClick={() => setMenuOpen(false)}>
              <div className="menu-item-left"><i className="fa-solid fa-user"></i> About Me</div>
              <i className="fa-solid fa-chevron-right chevron"></i>
            </a>
            <a href="#photos" className="menu-item" onClick={() => setMenuOpen(false)}>
              <div className="menu-item-left"><i className="fa-solid fa-camera-retro"></i> My Photos</div>
              <i className="fa-solid fa-chevron-right chevron"></i>
            </a>
            <a href="#projects" className="menu-item" onClick={() => setMenuOpen(false)}>
              <div className="menu-item-left"><i className="fa-solid fa-folder-open"></i> Projects</div>
              <i className="fa-solid fa-chevron-right chevron"></i>
            </a>
            <a href="https://wa.me/94719845166" target="_blank" rel="noreferrer" className="menu-item">
              <div className="menu-item-left"><i className="fa-brands fa-whatsapp"></i> Contact WhatsApp</div>
              <i className="fa-solid fa-chevron-right chevron"></i>
            </a>
          </div>
        </>
      )}

      <main className="hero-section" id="home">
        <div className="logo-frame">
          <div className="ring-glow"></div>
          <div className="ring-spin"></div>
          <div className="circular-logo">
            <img src="https://files.catbox.moe/0fmhj2.jpeg" alt="Heshan OFC Logo" />
          </div>
        </div>

        <h1 className="hero-title">Hi, I'm <span>Heshan</span></h1>
        <p className="hero-tagline">AI CREATOR & DEVELOPER</p>
        <p className="hero-desc">
          Professional Web Developer, AI Creator & Creative Designer from Sri Lanka.
        </p>

        <div className="info-list">
          <div className="info-card">
            <i className="fa-solid fa-user info-icon"></i>
            <div className="info-meta">
              <span className="info-label">Name</span>
              <span className="info-value">Dinidu Heshan</span>
            </div>
          </div>

          <div className="info-card">
            <i className="fa-solid fa-location-dot info-icon"></i>
            <div className="info-meta">
              <span className="info-label">Location</span>
              <span className="info-value">Sri Lanka 🇱🇰</span>
            </div>
          </div>

          <div className="info-card">
            <i className="fa-solid fa-code info-icon"></i>
            <div className="info-meta">
              <span className="info-label">Role</span>
              <span className="info-value">Lead Developer & Creator</span>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <a href="#projects" className="btn-action btn-projects">
            <i className="fa-solid fa-layer-group"></i> My Projects
          </a>
          <a 
            href="https://wa.me/94719845166?text=Hi%20Heshan,%20I%20saw%20your%20portfolio!" 
            target="_blank" 
            rel="noreferrer"
            className="btn-action btn-contact"
          >
            <i className="fa-brands fa-whatsapp"></i> Contact (071 984 5166)
          </a>
        </div>
      </main>
    </>
  );
}

