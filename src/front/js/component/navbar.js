import React from "react";
import { Link } from "react-router-dom";
import "../../styles/navbar.css";
import Paramour from "../../fonts/Paramour.ttf";

export const Navbar = () => {
  const titleStyle = {
    fontFamily: "paramour, sans-serif",
    fontSize: "7rem",
    textAlign: "center",
    color: "#222",
  };

  return (
    <nav className="navbar-container">
      <style>
        {`
          @font-face {
            font-family: 'paramour';
            src: url(${Paramour}) format('truetype');
          }
        `}
      </style>
      <div className="navbar-content">
        <Link className="navbar-brand" to="/">
          <h1 style={titleStyle}>RealRemarketing</h1>
        </Link>
        <div className="navbar-modern-menu">
          <ul className="navbar-links">
            {[  
              { to: "/", icon: "home-outline", label: "Inicio" },
              { to: "/convertcsv", icon: "reader-outline", label: "CSV" },
              { to: "/demo3", icon: "business-outline", label: "Cargar Archivo" },
              { to: "/editproperties", icon: "create-outline", label: "Editar Propiedades" },
              { to: "/demo2", icon: "search-outline", label: "Buscar" },
              { to: "/login", icon: "person-outline", label: "Login" },
            ].map((item, index) => (
              <li key={index} className="navbar-item">
                <Link to={item.to} className="navbar-link">
                  <ion-icon name={item.icon}></ion-icon>
                  <span className="navbar-text">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};
