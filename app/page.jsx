"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import "./globals.css";

const SUPABASE_URL = "https://aettmoeltpewwidaihud.supabase.co";
const SUPABASE_KEY = "sb_publishable_wri7Paddknj-LJ7f9i5ysw_WFauaM7-"; // මෙතනට ඔයාගේ publishable key එක දාන්න
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Database State
  const [comments, setComments] = useState([]);
  const [authorInput, setAuthorInput] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyTargetUser, setReplyTargetUser] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);

    fetchComments();

    // Realtime changes listener
    const channel = supabase
      .channel("public_comments_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data) setComments(data);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!authorInput.trim() || !messageInput.trim()) return;

    setSubmitting(true);
    const isOwner = authorInput.trim().toLowerCase().includes("heshan");

    const { error } = await supabase.from("comments").insert([
      {
        author: authorInput.trim(),
        text: messageInput.trim(),
        is_owner: isOwner,
        parent_id: activeReplyId,
      },
    ]);

    setSubmitting(false);
    if (!error) {
      setMessageInput("");
      setActiveReplyId(null);
      setReplyTargetUser("");
      fetchComments();
    }
  };

  const startReply = (id, name) => {
    setActiveReplyId(id);
    setReplyTargetUser(name);
  };

  const parentComments = comments.filter((c) => !c.parent_id);
  const getReplies = (id) => comments.filter((c) => c.parent_id === id);

  return (
    <>
      {/* Preloader */}
      {loading && (
        <div id="preloader">
          <div className="loader-ring"></div>
        </div>
      )}

      {/* Navbar */}
      <nav className="navbar">
        <div className="brand-box">
          <div className="brand-title">
            HESHAN <span>OFC</span>
          </div>
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

      {/* Dropdown Menu Drawer */}
      {menuOpen && (
        <>
          <div className="menu-overlay" onClick={() => setMenuOpen(false)}></div>
          <div className="menu-container">
            <a href="#home" className="menu-item active" onClick={() => setMenuOpen(false)}>
              <div className="menu-item-left">
                <i className="fa-solid fa-house"></i> Home
              </div>
              <i className="fa-solid fa-chevron-right chevron"></i>
            </a>
            <a href="#skills" className="menu-item" onClick={() => setMenuOpen(false)}>
              <div className="menu-item-left">
                <i className="fa-solid fa-code"></i> Tech Stack
              </div>
              <i className="fa-solid fa-chevron-right chevron"></i>
            </a>
            <a href="#projects" className="menu-item" onClick={() => setMenuOpen(false)}>
              <div className="menu-item-left">
                <i className="fa-solid fa-folder-open"></i> Projects
              </div>
              <i className="fa-solid fa-chevron-right chevron"></i>
            </a>
            <a
              href="https://wa.me/94719845166"
              target="_blank"
              rel="noreferrer"
              className="menu-item"
            >
              <div className="menu-item-left">
                <i className="fa-brands fa-whatsapp"></i> Contact WhatsApp
              </div>
              <i className="fa-solid fa-chevron-right chevron"></i>
            </a>
          </div>
        </>
      )}

      {/* Hero / Home Section */}
      <main className="hero-section" id="home">
        <div className="logo-frame">
          <div className="ring-glow"></div>
          <div className="ring-spin"></div>
          <div className="circular-logo">
            {/* User Custom Logo Image */}
            <img src="https://files.catbox.moe/0fmhj2.jpeg" alt="Heshan OFC Logo" />
          </div>
        </div>

        <h1 className="hero-title">
          Hi, I'm <span>Heshan</span>
        </h1>
        <p className="hero-tagline">AI CREATOR & DEVELOPER</p>
        <p className="hero-desc">
          Professional Web Developer, Next.js Architect & AI Creator crafting modern, high-impact digital experiences.
        </p>

        {/* Info Cards */}
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
            <i className="fa-solid fa-shield-halved info-icon"></i>
            <div className="info-meta">
              <span className="info-label">Status</span>
              <span className="info-value">Open for Projects</span>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="skills-container" id="skills">
          <div className="section-label">Skills & Tech</div>
          <div className="skills-grid">
            <div className="skill-badge">
              <i className="fa-brands fa-react"></i>
              <span>Next.js</span>
            </div>
            <div className="skill-badge">
              <i className="fa-solid fa-database"></i>
              <span>Supabase</span>
            </div>
            <div className="skill-badge">
              <i className="fa-solid fa-robot"></i>
              <span>AI Tools</span>
            </div>
            <div className="skill-badge">
              <i className="fa-brands fa-js"></i>
              <span>JavaScript</span>
            </div>
          </div>
        </div>

        {/* Featured Projects */}
        <div className="projects-container" id="projects">
          <div className="section-label">Featured Works</div>
          <div className="project-card">
            <div className="project-top">
              <span className="project-title">HESHAN-OFC Portfolio</span>
              <span className="project-tag">Live</span>
            </div>
            <p className="project-desc">Modern portfolio with realtime guestbook powered by Supabase & Next.js.</p>
          </div>
          <div className="project-card">
            <div className="project-top">
              <span className="project-title">HESHAN AI Engine</span>
              <span className="project-tag">AI App</span>
            </div>
            <p className="project-desc">Intelligent custom web applications and interactive multimedia tools.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button onClick={() => setModalOpen(true)} className="btn-action btn-projects">
            <i className="fa-solid fa-comments"></i> Open Community Guestbook
          </button>
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

      {/* Floating Comment Button */}
      <button
        className="comment-floating-btn"
        onClick={() => setModalOpen(true)}
        title="Leave a comment"
      >
        <i className="fa-solid fa-comment-dots"></i>
      </button>

      {/* Comment Modal Drawer */}
      {modalOpen && (
        <div className="comment-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="comment-box" onClick={(e) => e.stopPropagation()}>
            <div className="comment-header">
              <h3>
                Community <span>Comments</span> ({comments.length})
              </h3>
              <button className="close-modal-btn" onClick={() => setModalOpen(false)}>
                &times;
              </button>
            </div>

            {/* Comment List */}
            <div className="comment-list">
              {parentComments.length === 0 ? (
                <p style={{ color: "#777", textAlign: "center", padding: "1.5rem 0", fontSize: "0.85rem" }}>
                  No comments yet. Be the first to leave one!
                </p>
              ) : (
                parentComments.map((item) => (
                  <div key={item.id} className="comment-card">
                    <div className="comment-top">
                      <span className="comment-user">
                        {item.author}
                        {item.is_owner && <span className="reply-badge">OWNER</span>}
                      </span>
                      <span className="comment-time">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="comment-body">{item.text}</div>
                    <div className="comment-actions">
                      <button
                        className="action-reply-btn"
                        onClick={() => startReply(item.id, item.author)}
                      >
                        <i className="fa-solid fa-reply"></i> Reply
                      </button>
                    </div>

                    {/* Replies */}
                    {getReplies(item.id).length > 0 && (
                      <div className="reply-list">
                        {getReplies(item.id).map((rep) => (
                          <div key={rep.id} className="reply-card">
                            <strong style={{ color: "#ff3355" }}>{rep.author}</strong>
                            {rep.is_owner && <span className="reply-badge">OWNER</span>}
                            <div style={{ marginTop: "2px", color: "#e0e0e0" }}>{rep.text}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Comment Form */}
            <form className="comment-form" onSubmit={handleCommentSubmit}>
              {activeReplyId && (
                <div className="replying-indicator">
                  <span>Replying to {replyTargetUser}...</span>
                  <i
                    className="fa-solid fa-xmark"
                    onClick={() => {
                      setActiveReplyId(null);
                      setReplyTargetUser("");
                    }}
                    style={{ cursor: "pointer" }}
                  ></i>
                </div>
              )}
              <input
                type="text"
                className="comment-input"
                placeholder="Your Name"
                value={authorInput}
                onChange={(e) => setAuthorInput(e.target.value)}
                required
              />
              <textarea
                className="comment-textarea"
                placeholder="Write a comment..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                required
              />
              <button type="submit" disabled={submitting} className="comment-submit-btn">
                {submitting ? "Sending..." : "Send Comment"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

