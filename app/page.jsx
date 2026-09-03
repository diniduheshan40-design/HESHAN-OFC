"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import "./globals.css";

// Supabase Configuration
const SUPABASE_URL = "https://aettmoeltpewwidaihud.supabase.co";
const SUPABASE_KEY = "sb_publishable_wri7Paddknj-LJ7f9i5ysw_WFauaM7-"; // ඔයාගේ Supabase Publishable Key එක මෙතනට දාන්න
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Owner Credentials
const OWNER_PHONE = "0719845166";
const OWNER_PASS = "Heshan2007#";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Owner Auth State
  const [isOwnerLoggedIn, setIsOwnerLoggedIn] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Comments State
  const [comments, setComments] = useState([]);
  const [authorInput, setAuthorInput] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyTargetUser, setReplyTargetUser] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // AI Assistant Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", content: "Hi! I am HESHAN OFC ASSISTANT. Heshan ගැන ඕනෑම දෙයක් අහන්න!" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);

    const savedOwner = localStorage.getItem("heshan_owner_auth");
    if (savedOwner === "true") setIsOwnerLoggedIn(true);

    fetchComments();

    // Supabase Realtime Listener
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

  // Owner Login
  const handleOwnerLogin = (e) => {
    e.preventDefault();
    if (loginPhone.trim() === OWNER_PHONE && loginPassword.trim() === OWNER_PASS) {
      setIsOwnerLoggedIn(true);
      localStorage.setItem("heshan_owner_auth", "true");
      setLoginModalOpen(false);
      setLoginError("");
      setLoginPhone("");
      setLoginPassword("");
    } else {
      setLoginError("Invalid Phone Number or Password!");
    }
  };

  const handleOwnerLogout = () => {
    setIsOwnerLoggedIn(false);
    localStorage.removeItem("heshan_owner_auth");
  };

  // Comments Submit
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    let finalAuthor = "Visitor";
    if (isOwnerLoggedIn) {
      finalAuthor = "Heshan";
    } else if (authorInput.trim()) {
      finalAuthor = authorInput.trim();
    }

    setSubmitting(true);

    const { error } = await supabase.from("comments").insert([
      {
        author: finalAuthor,
        text: messageInput.trim(),
        is_owner: isOwnerLoggedIn,
        parent_id: activeReplyId,
      },
    ]);

    setSubmitting(false);
    if (!error) {
      setMessageInput("");
      if (!isOwnerLoggedIn) setAuthorInput("");
      setActiveReplyId(null);
      setReplyTargetUser("");
      fetchComments();
    }
  };

  // Delete Comment (Owner Only)
  const handleDeleteComment = async (id) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (!error) fetchComments();
  };

  const startReply = (id, name) => {
    setActiveReplyId(id);
    setReplyTargetUser(name);
  };

  // Safe AI Assistant Call (Backend API)
  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput.trim();
    const newChat = [...chatMessages, { role: "user", content: userText }];
    setChatMessages(newChat);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newChat })
      });

      const data = await res.json();
      const reply = data.reply || "මට ඒක තේරුම් ගන්න අපහසු වුණා, ආයේ අහන්න!";
      setChatMessages([...newChat, { role: "assistant", content: reply }]);
    } catch {
      setChatMessages([...newChat, { role: "assistant", content: "Connection error. කරුණාකර නැවත උත්සාහ කරන්න!" }]);
    } finally {
      setChatLoading(false);
    }
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

            {/* Owner Login / Logout Button */}
            <div style={{ marginTop: "0.6rem", borderTop: "1px solid var(--border-color)", paddingTop: "0.8rem" }}>
              {isOwnerLoggedIn ? (
                <button
                  onClick={() => {
                    handleOwnerLogout();
                    setMenuOpen(false);
                  }}
                  className="menu-item"
                  style={{ width: "100%", background: "rgba(230,25,55,0.15)", borderColor: "var(--primary-red)", color: "var(--primary-red)", cursor: "pointer" }}
                >
                  <div className="menu-item-left">
                    <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout Owner
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setLoginModalOpen(true);
                    setMenuOpen(false);
                  }}
                  className="menu-item"
                  style={{ width: "100%", background: "#181822", cursor: "pointer" }}
                >
                  <div className="menu-item-left">
                    <i className="fa-solid fa-lock"></i> Owner Login
                  </div>
                  <i className="fa-solid fa-chevron-right chevron"></i>
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Owner Login Modal */}
      {loginModalOpen && (
        <div className="comment-modal-overlay" style={{ alignItems: "center", zIndex: 1200 }}>
          <div className="comment-box" style={{ borderRadius: "20px", maxHeight: "none", margin: "1rem" }}>
            <div className="comment-header">
              <h3>Owner <span>Sign In</span></h3>
              <button className="close-modal-btn" onClick={() => setLoginModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleOwnerLogin} className="comment-form" style={{ background: "transparent", border: "none", padding: 0 }}>
              <input
                type="text"
                className="comment-input"
                placeholder="Owner Phone"
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value)}
                required
              />
              <input
                type="password"
                className="comment-input"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
              {loginError && <p style={{ color: "var(--primary-red)", fontSize: "0.75rem" }}>{loginError}</p>}
              <button type="submit" className="comment-submit-btn" style={{ marginTop: "0.5rem" }}>
                Sign In as Owner
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <main className="hero-section" id="home">
        <div className="logo-frame">
          <div className="ring-glow"></div>
          <div className="ring-spin"></div>
          <div className="circular-logo">
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
              <span className="info-value">Embilipitiya, Sri Lanka 🇱🇰</span>
            </div>
          </div>

          <div className="info-card">
            <i className="fa-solid fa-shield-halved info-icon"></i>
            <div className="info-meta">
              <span className="info-label">Status</span>
              <span className="info-value" style={{ color: isOwnerLoggedIn ? "var(--primary-red)" : "#888" }}>
                {isOwnerLoggedIn ? "👑 Owner Mode Active" : "Open for Projects"}
              </span>
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

      {/* Left Floating AI Assistant Button */}
      <button
        className="comment-floating-btn"
        onClick={() => setChatOpen(true)}
        style={{ left: "20px", right: "auto", background: "#15151f", border: "2px solid var(--primary-red)" }}
        title="Chat with Assistant"
      >
        <i className="fa-solid fa-robot" style={{ color: "var(--primary-red)" }}></i>
      </button>

      {/* Right Floating Comment Button */}
      <button
        className="comment-floating-btn"
        onClick={() => setModalOpen(true)}
        title="Leave a comment"
      >
        <i className="fa-solid fa-comment-dots"></i>
      </button>

      {/* AI Assistant Modal */}
      {chatOpen && (
        <div className="comment-modal-overlay" onClick={() => setChatOpen(false)} style={{ zIndex: 1150 }}>
          <div className="comment-box" onClick={(e) => e.stopPropagation()} style={{ height: "75vh" }}>
            <div className="comment-header">
              <h3>HESHAN OFC <span>ASSISTANT</span></h3>
              <button className="close-modal-btn" onClick={() => setChatOpen(false)}>&times;</button>
            </div>

            <div className="comment-list" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                    background: msg.role === "user" ? "var(--primary-red)" : "#181824",
                    color: "#fff",
                    padding: "8px 14px",
                    borderRadius: "14px",
                    maxWidth: "85%",
                    fontSize: "0.85rem",
                    lineHeight: "1.4",
                    border: msg.role === "assistant" ? "1px solid var(--border-color)" : "none",
                    wordBreak: "break-word"
                  }}
                >
                  {msg.content.includes("https://files.catbox.moe/0fmhj2.jpeg") ? (
                    <div>
                      <p>{msg.content}</p>
                      <img
                        src="https://files.catbox.moe/0fmhj2.jpeg"
                        alt="Heshan"
                        style={{ width: "120px", borderRadius: "8px", marginTop: "8px" }}
                      />
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              ))}
              {chatLoading && <p style={{ fontSize: "0.75rem", color: "#888" }}>Thinking...</p>}
            </div>

            <form onSubmit={handleSendChatMessage} className="comment-form" style={{ marginTop: "8px" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  className="comment-input"
                  placeholder="Ask anything..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button type="submit" disabled={chatLoading} className="comment-submit-btn" style={{ width: "auto", padding: "0 16px" }}>
                  <i className="fa-solid fa-paper-plane"></i>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Community Comments Modal */}
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
                      <span className="comment-user" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {item.is_owner ? (
                          <span style={{
                            background: "linear-gradient(135deg, #e61937, #990c21)",
                            color: "#fff",
                            fontSize: "0.68rem",
                            fontWeight: "800",
                            padding: "2px 8px",
                            borderRadius: "6px",
                            boxShadow: "0 0 10px rgba(230, 25, 55, 0.5)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            letterSpacing: "0.5px"
                          }}>
                            HESHAN OFC 👑
                          </span>
                        ) : (
                          item.author
                        )}
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

                      {/* Delete Button (Owner Only) */}
                      {isOwnerLoggedIn && (
                        <button
                          onClick={() => handleDeleteComment(item.id)}
                          style={{ background: "none", border: "none", color: "#ff4444", fontSize: "0.78rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                        >
                          <i className="fa-solid fa-trash"></i> Delete
                        </button>
                      )}
                    </div>

                    {/* Replies */}
                    {getReplies(item.id).length > 0 && (
                      <div className="reply-list">
                        {getReplies(item.id).map((rep) => (
                          <div key={rep.id} className="reply-card">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                {rep.is_owner ? (
                                  <span style={{
                                    background: "linear-gradient(135deg, #e61937, #990c21)",
                                    color: "#fff",
                                    fontSize: "0.65rem",
                                    fontWeight: "800",
                                    padding: "2px 6px",
                                    borderRadius: "5px",
                                    boxShadow: "0 0 8px rgba(230, 25, 55, 0.4)",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "3px"
                                  }}>
                                    HESHAN OFC 👑
                                  </span>
                                ) : (
                                  <strong style={{ color: "#ff3355" }}>{rep.author}</strong>
                                )}
                              </span>
                              {isOwnerLoggedIn && (
                                <i
                                  className="fa-solid fa-trash"
                                  onClick={() => handleDeleteComment(rep.id)}
                                  style={{ color: "#ff4444", fontSize: "0.7rem", cursor: "pointer" }}
                                ></i>
                              )}
                            </div>
                            <div style={{ marginTop: "3px", color: "#e0e0e0" }}>{rep.text}</div>
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
              {!isOwnerLoggedIn && (
                <input
                  type="text"
                  className="comment-input"
                  placeholder="Your Name (Optional)"
                  value={authorInput}
                  onChange={(e) => setAuthorInput(e.target.value)}
                />
              )}
              <textarea
                className="comment-textarea"
                placeholder={isOwnerLoggedIn ? "Write official reply as HESHAN OFC 👑..." : "Write a comment..."}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                required
              />
              <button type="submit" disabled={submitting} className="comment-submit-btn">
                {submitting ? "Sending..." : isOwnerLoggedIn ? "Post as HESHAN OFC 👑" : "Send Comment"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

