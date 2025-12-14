import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../css/Home.css";

// Helper to calculate profile completeness (simple)
function getProfileCompletion(profile = {}) {
  const keys = ["age", "height", "weight", "gender", "fitnessLevel"];
  const fields = keys.filter((k) => !!profile[k]);
  return Math.floor((fields.length / keys.length) * 100);
}

// Helper: recent actions fallback
function getRecentActions(user) {
  // If you have Redux/history, replace with actual selectors!
  return [
    user?.lastWorkout
      ? { icon: "🏋️‍♂️", label: `Completed: ${user.lastWorkout}` }
      : { icon: "🏋️‍♂️", label: "No workout logged yet" },
    user?.lastNutrition
      ? { icon: "🥗", label: `Logged: ${user.lastNutrition}` }
      : { icon: "🥗", label: "No meals tracked yet" },
    user?.lastPost
      ? { icon: "💬", label: `Community: ${user.lastPost}` }
      : { icon: "💬", label: "No community activity yet" }
  ];
}

// Helper: get streak/next workout from context
function getKPI(user) {
  if (user?.streak && user.streak > 0)
    return `Active streak: ${user.streak} day${user.streak > 1 ? 's' : ''}`;
  if (user?.profile && user.profile.nextWorkout)
    return `Next workout: ${user.profile.nextWorkout}`;
  return "Welcome, let's get started!";
}

function Home() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const profile = user?.profile || {};
  const onboardingProgress = getProfileCompletion(profile);
  const kpi = getKPI(user);

  // Recent actions: replace with Redux/context activity selectors as available
  const recentActions = getRecentActions(user);

  // Featured program: demo fallback, can extend from context/store/REST as needed
  const featuredProgram = {
    emoji: "🔥",
    title: "Starter Shred",
    desc: "Quick 2-week plan to kickstart results.",
    cta: "Start"
  };

  return (
    <div className="home-container">
      {/* KPI/summary */}
      <div style={{
        width: "100%",
        textAlign: "center",
        padding: "0.5rem 0",
        fontWeight: 500,
        fontSize: "1rem",
        color: "var(--primary, #7c3aed)",
        letterSpacing: "0.02em"
      }}>
        Welcome back{user && user.name ? `, ${user.name}` : ""}! <span style={{color: "var(--text-secondary)", fontWeight: 400}}>{kpi}</span>
      </div>

      {/* Hero Section */}
      <section className="home-hero hero-section">
        <div className="hero-title">Welcome to FitTrack</div>
        <div className="hero-subtitle">
          Your personal fitness companion for a healthier lifestyle
        </div>
        <div className="hero-actions">
          {!user && <>
            <button className="hero-btn" onClick={() => navigate("/signup")}>Get Started</button>
            <button className="hero-btn-alt" onClick={() => navigate("/login")}>Login</button>
          </>}
          {user && (
            <button className="hero-btn" onClick={() => navigate("/dashboard")}>Go to Dashboard</button>
          )}
        </div>
        {/* Onboarding progress bar & CTA */}
        <div style={{
          width: "100%",
          maxWidth: 350,
          background: "rgba(255,255,255,0.09)",
          borderRadius: 20,
          margin: "1.4rem auto 0",
          boxShadow: "0 1px 10px #7c3aed22"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            padding: "0.3rem 1rem 0.3rem 0.8rem",
            fontSize: "0.97rem"
          }}>
            <div style={{
              flex: 1,
              color: "#fff"
            }}>
              <span aria-label="Profile Progress">Profile {onboardingProgress}% complete</span>
            </div>
            {onboardingProgress < 100 &&
              <button
                style={{
                  background: "#fff",
                  color: "var(--primary, #7c3aed)",
                  border: "none",
                  borderRadius: 16,
                  fontWeight: 700,
                  fontSize: "0.98rem",
                  padding: "0.32em 1em",
                  marginLeft: 8,
                  cursor: "pointer",
                  boxShadow: "0 1px 6px rgba(124,58,237,0.10)"
                }}
                onClick={() => navigate("/profile-setup")}
              >Finish profile</button>
            }
          </div>
          <div style={{
            height: 7,
            background: "#dedffe",
            borderRadius: 8,
            margin: "0 0.45rem 0.45rem 0.45rem",
            overflow: "hidden"
          }}>
            <div style={{
              height: "100%",
              width: onboardingProgress + "%",
              background: "linear-gradient(90deg, #7c3aed, #668df6 80%)",
              borderRadius: 8,
              transition: "width 0.4s"
            }} />
          </div>
        </div>
      </section>
      {/* Why Choose Section */}
      <section className="why-section">
        <div className="why-title-center">Why Choose FitTrack?</div>
        <div className="why-cards">
          <div className="why-card">
            <span className="why-card-icon workout">💪</span>
            <div className="why-card-title">Workout Plans</div>
            <div className="why-card-desc">
              Personalized workout routines tailored to your goals and fitness level
            </div>
          </div>
          <div className="why-card">
            <span className="why-card-icon progress">📊</span>
            <div className="why-card-title">Progress Tracking</div>
            <div className="why-card-desc">
              Monitor your fitness journey with detailed analytics and insights
            </div>
          </div>
          <div className="why-card">
            <span className="why-card-icon community">👥</span>
            <div className="why-card-title">Community Support</div>
            <div className="why-card-desc">
              Connect with like-minded fitness enthusiasts for motivation
            </div>
          </div>
        </div>
      </section>

      {/* Professional dashboard add-ons for Home */}
      <div style={{
        width: "100%",
        maxWidth: 960,
        margin: "2rem auto 1rem",
        display: "flex",
        flexWrap: "wrap",
        gap: "2rem",
        alignItems: "flex-start",
        justifyContent: "space-between"
      }}>
        {/* Recent Activity Card */}
        <div className="why-card" style={{flex: "2 1 260px", minWidth: 260, marginBottom: 8, background: "var(--card-bg, #fff)"}}>
          <div className="why-card-title" style={{fontSize: "1.12rem"}}>Recent Activity</div>
          <ul style={{padding: 0, margin: 0, listStyle: "none", fontSize: "0.97rem"}}>
            {recentActions.map((a, i) => (
              <li key={i} style={{display: "flex", alignItems: "center", margin: "0.25rem 0"}}>
                <span style={{fontSize: "1.14rem", marginRight: 10}}>{a.icon}</span>
                <span style={{color: "#485", letterSpacing: "0.01em", fontWeight: 500}}>{a.label}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Featured Program Mini-Card */}
        <div className="why-card" style={{flex: "1 1 220px", minWidth: 220, textAlign: "center", marginBottom: 8, background: "var(--card-bg, #fff)"}}>
          <div className="why-card-icon" aria-hidden="true" style={{fontSize: "2.3rem"}}>{featuredProgram.emoji}</div>
          <div className="why-card-title" style={{fontWeight: 700, color: "var(--primary, #7c3aed)"}}>
            {featuredProgram.title}
          </div>
          <div className="why-card-desc" style={{margin: "0.3rem auto 1rem", fontSize: "0.98rem", maxWidth: 200}}>
            {featuredProgram.desc}
          </div>
          <button
            className="hero-btn"
            style={{padding: "0.44rem 1.3rem", fontSize: "1rem", margin: "0 auto"}}
            onClick={() => navigate("/programs")}
          >{featuredProgram.cta}
          </button>
        </div>
      </div>

      {/* ATS microcopy footer-ish */}
      <div style={{
        width: "100%",
        textAlign: "center",
        color: "#22223b",
        fontSize: "0.98rem",
        opacity: 0.90,
        margin: "1.7rem 0 0 0",
        letterSpacing: "0.018em"
      }}>
        Exportable progress reports — secure & industry-standard metrics
      </div>
    </div>
  );
}

export default Home;