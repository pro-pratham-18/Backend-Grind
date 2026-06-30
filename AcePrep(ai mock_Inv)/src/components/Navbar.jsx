import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../hooks/useAuth.js';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/interview/setup', label: 'Interview' },
  { to: '/test/setup', label: 'Test' },
  { to: '/history', label: 'History' },
];

const Navbar = () => {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logOut();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'bg-accent/20 text-accent-light' : 'text-slate-300 hover:text-white hover:bg-slate-800'
    }`;

  return (
    <header className="sticky top-0 z-40 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-accent flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-accent/30">
              A
            </div>
            <span className="text-xl font-bold text-white">
              Ace<span className="text-accent-light">Prep</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass} end={l.to === '/dashboard'}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/profile" className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="h-8 w-8 rounded-full object-cover ring-2 ring-accent/40" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-accent/30 flex items-center justify-center text-sm font-bold text-accent-light">
                  {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                </div>
              )}
              <span className="text-sm text-slate-200 max-w-[120px] truncate">
                {user?.displayName || user?.email}
              </span>
            </Link>
            <button onClick={handleLogout} className="btn-ghost text-sm">
              Sign Out
            </button>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-800 text-slate-300"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 animate-fade-in">
            <div className="flex flex-col gap-1">
              {navLinks.map((l) => (
                <NavLink key={l.to} to={l.to} className={linkClass} onClick={() => setOpen(false)} end={l.to === '/dashboard'}>
                  {l.label}
                </NavLink>
              ))}
              <Link to="/profile" className={linkClass({ isActive: false })} onClick={() => setOpen(false)}>
                Profile
              </Link>
              <button onClick={handleLogout} className="text-left px-3 py-2 rounded-lg text-sm font-medium text-error hover:bg-error/10">
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
