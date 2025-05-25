import React from 'react';
import { Link } from "react-router-dom"
import Header from "./components/Header"
import Footer from "./components/Footer"
import "./styles/global.css"

function App() {
  return (
    <>
      <Header />

      <div className="home-container">
        <h1 className="home-title">🔐 <span style={{ color: "#007aff" }}>TrustCheck</span></h1>
        <p className="home-desc">
          Nơi bạn kiểm tra – tố cáo – bảo vệ cộng đồng khỏi các hành vi lừa đảo.
        </p>

        <div className="home-actions">
          <Link to="/check-account" className="home-button">💳 Tra cứu STK</Link>
          <Link to="/check-website" className="home-button">🌐 Tra cứu Website</Link>
          <Link to="/report" className="home-button outline">📢 Gửi tố cáo</Link>
        </div>
      </div>

      <Footer />
    </>
  )
}

export default App
