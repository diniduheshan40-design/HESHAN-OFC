"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import "./globals.css";

// Database Configuration
const SUPABASE_URL = "https://aettmoeltpewwidaihud.supabase.co";
const SUPABASE_KEY = "sb_publishable_wri7Paddknj-LJ7f9i5ysw_WFauaM7-"; // මෙතනට ඔයා copy කරපු Publishable Key එක දාන්න
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ඔබේ Owner Mail එක (මේ mail එකෙන් ආවම Owner විදිහට හඳුනගනී)
const OWNER_EMAIL = "damiyamalinda@gmail.com";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Comments State
  const [comments, setComments] = useState([]);
  const [name, setName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);

    // Auth state check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Load comments
    fetchComments();

    return () => {
      clearTimeout(timer);
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data) setComments(data);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const isOwner = user?.email === OWNER_EMAIL;

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const authorName = isOwner ? "Heshan (Owner)" : name.trim() || "Visitor";
    setSubmitting(true);

    const { error } = await supabase.from("comments").insert([
      {
        author: authorName,
        text: commentText.trim(),
        is_owner: isOwner,
        parent_id: replyTo
      }
    ]);

    setSubmitting(false);
    if (!error) {
      setCommentText("");
      setReplyTo(null);
      if (!isOwner) setName("");
      fetchComments();
    }
  };

  const parentComments = comments.filter((c) => !c.parent_id);
  const getReplies = (id) => comments.filter((c) => c.parent_id === id);

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
        <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          <i className={`fa-solid ${menuOpen ? "fa-xmark" : "fa-bars"}`}></i>
        </button>
      </nav>

      {menuOpen && (
        <>
          <div className="menu-overlay" onClick={() => setMenuOpen(false)}></div>
          <div className="menu-container">
            <a href="#home" className="menu-item active" onClick={() => setMenuOpen(false)}>
              <div className="menu-item-left"><i className="fa-solid fa-house"></i> Home</div>
            </a>
            <a href="#comments" className="menu-item" onClick={() => setMenuOpen(false)}>
              <div className="menu-item-left"><i className="fa-solid fa-comments"></i> Guestbook / Comments</div>
            </a>
            <a href="https://wa.me/94719845166" target="_blank" rel="noreferrer" className="menu-item">
              <div className="menu-item-left"><i className="fa-brands fa-whatsapp"></i> WhatsApp</div>
            </a>
          </div>
        </>
      )}

      <main className="hero-section" id="home">
        <div className="logo-frame">
          <div className="ring-glow"></div>
          <div className="ring-spin"></div>
          <div className="circular-logo">
            <img src="https://picsum.photos/400" alt="Heshan OFC Logo" />
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
        </div>

        {/* COMMENTS SECTION */}
        <section id="comments" style={{ width: "100%", maxWidth: "480px", marginTop: "2rem", textAlign: "left" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.2rem", color: "#fff" }}>
              <i className="fa-solid fa-comments" style={{ color: "var(--primary-red)", marginRight: "8px" }}></i>
              Comments
            </h2>
            {user ? (
              <button onClick={handleLogout} style={{ background: "#20070b", color: "var(--primary-red)", border: "1px solid var(--primary-red)", padding: "4px 10px", borderRadius: "8px", fontSize: "0.75rem", cursor: "pointer" }}>
                Logout ({user.email.split("@")[0]})
              </button>
            ) : (
              <button onClick={handleGoogleLogin} style={{ background: "#15151c", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", padding: "4px 10px", borderRadius: "8px", fontSize: "0.75rem", cursor: "pointer" }}>
                <i className="fa-brands fa-google" style={{ color: "#ea4335", marginRight: "5px" }}></i> Owner Login
              </button>
            )}
          </div>

          <form onSubmit={handleAddComment} style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "1.5rem" }}>
            {replyTo && (
              <div style={{ fontSize: "0.75rem", color: "var(--primary-red)", display: "flex", justifyContent: "space-between" }}>
                <span>Replying to comment #{replyTo}</span>
                <span onClick={() => setReplyTo(null)} style={{ cursor: "pointer", textDecoration: "underline" }}>Cancel</span>
              </div>
            )}
            {!isOwner && (
              <input
                type="text"
                placeholder="Your Name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ background: "#121217", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "10px", borderRadius: "8px" }}
              />
            )}
            <textarea
              placeholder={isOwner ? "Write official reply as Owner..." : "Leave a message..."}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows="3"
              style={{ background: "#121217", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "10px", borderRadius: "8px", resize: "none" }}
            />
            <button
              type="submit"
              disabled={submitting}
              style={{ background: "var(--primary-red)", color: "#fff", border: "none", padding: "10px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
            >
              {submitting ? "Sending..." : replyTo ? "Send Reply" : "Post Comment"}
            </button>
          </form>

          {/* Comment List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {parentComments.length === 0 && (
              <p style={{ fontSize: "0.85rem", color: "#8b8b99" }}>No comments yet. Be the first to leave one!</p>
            )}
            {parentComments.map((c) => (
              <div key={c.id} style={{ background: "#121217", border: "1px solid rgba(255,255,255,0.06)", padding: "12px", borderRadius: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontWeight: "600", fontSize: "0.9rem", color: c.is_owner ? "var(--primary-red)" : "#fff" }}>
                    {c.author} {c.is_owner && <span style={{ fontSize: "0.65rem", background: "var(--primary-red)", color: "#fff", padding: "2px 6px", borderRadius: "4px", marginLeft: "4px" }}>OWNER</span>}
                  </span>
                  <span style={{ fontSize: "0.7rem", color: "#666" }}>{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
                <p style={{ fontSize: "0.85rem", color: "#ccc", margin: "4px 0" }}>{c.text}</p>
                {isOwner && (
                  <button onClick={() => setReplyTo(c.id)} style={{ background: "transparent", border: "none", color: "var(--primary-red)", fontSize: "0.75rem", cursor: "pointer", padding: 0 }}>
                    Reply
                  </button>
                )}

                {/* Nested Replies */}
                {getReplies(c.id).map((r) => (
                  <div key={r.id} style={{ marginLeft: "1rem", marginTop: "8px", borderLeft: "2px solid var(--primary-red)", paddingLeft: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontWeight: "600", fontSize: "0.85rem", color: r.is_owner ? "var(--primary-red)" : "#fff" }}>
                        {r.author} {r.is_owner && <span style={{ fontSize: "0.6rem", background: "var(--primary-red)", color: "#fff", padding: "1px 4px", borderRadius: "4px" }}>OWNER</span>}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "#bbb" }}>{r.text}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

