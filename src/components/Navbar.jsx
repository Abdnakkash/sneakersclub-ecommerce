import React, { useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import LanguageToggle from "./LanguageToggle";
import logo from "../assets/logo.jpg";

export default function Navbar({ t, lang, setLang }) {
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const mobileNavClass = ({ isActive }) =>
    `flex-1 rounded-full px-4 py-3 text-sm font-semibold text-center transition ${
      isActive
        ? "bg-zinc-950 text-white shadow-sm"
        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
    }`;

  const desktopNavClass = ({ isActive }) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition ${
      isActive ? "bg-zinc-950 text-white" : "text-zinc-600 hover:bg-zinc-100"
    }`;

  const startPress = () => {
    timerRef.current = setTimeout(() => {
      navigate("/admin-login");
    }, 900);
  };

  const endPress = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-4 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/"
            onMouseDown={startPress}
            onMouseUp={endPress}
            onMouseLeave={endPress}
            onTouchStart={startPress}
            onTouchEnd={endPress}
            className="flex items-center gap-3"
          >
            <img
              src={logo}
              alt="SneakersClub logo"
              className="h-12 w-12 rounded-full object-cover ring-1 ring-zinc-200"
            />
            <div className="hidden sm:block">
              <p className="text-sm font-black tracking-wide text-zinc-950">
                SneakersClub
              </p>
              <p className="text-xs text-zinc-500">
                Premium sneakers & clothing
              </p>
            </div>
          </Link>

          <div className="shrink-0">
            <LanguageToggle lang={lang} setLang={setLang} t={t} />
          </div>
        </div>

        {/* Mobile */}
        <div className="mt-4 flex items-center gap-2 lg:hidden">
          <NavLink to="/" className={mobileNavClass}>
            {t.home}
          </NavLink>
          <NavLink to="/shop" className={mobileNavClass}>
            {t.shop}
          </NavLink>
          <NavLink to="/about" className={mobileNavClass}>
            {t.about}
          </NavLink>
          <NavLink to="/contact" className={mobileNavClass}>
            {t.contact}
          </NavLink>
        </div>

        {/* Desktop */}
        <div className="hidden lg:flex items-center justify-center pt-4">
          <nav className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 p-1">
            <NavLink to="/" className={desktopNavClass}>
              {t.home}
            </NavLink>
            <NavLink to="/shop" className={desktopNavClass}>
              {t.shop}
            </NavLink>
            <NavLink to="/about" className={desktopNavClass}>
              {t.about}
            </NavLink>
            <NavLink to="/contact" className={desktopNavClass}>
              {t.contact}
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}
