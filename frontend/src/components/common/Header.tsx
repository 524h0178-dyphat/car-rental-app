import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Car, Phone, User, ChevronDown, LogOut, Settings, Loader2, Moon, Sun, Wallet } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { useLogout } from '@/hooks/useAuth';
import SearchAutocomplete from '@/components/features/SearchAutocomplete';

const navLinks = [
  { to: '/',          label: 'Trang chủ' },
  { to: '/tim-xe',    label: 'Tìm xe' },
  { to: '/ky-gui-xe', label: 'Ký gửi xe' },
];

/** Avatar từ initials */
function UserAvatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' }) {
  const initials = name.split(' ').map((w) => w[0]).slice(-2).join('').toUpperCase();
  const s = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  return (
    <div className={`${s} rounded-full bg-brand-500 flex items-center justify-center text-white font-semibold flex-shrink-0`}>
      {initials}
    </div>
  );
}

/** Dark / Light mode toggle */
function DarkToggle({ isTransparent }: { isTransparent: boolean }) {
  const { isDark, toggleDark } = useThemeStore();
  return (
    <button
      onClick={toggleDark}
      aria-label={isDark ? 'Chuyển sang sáng' : 'Chuyển sang tối'}
      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
        isTransparent ? 'text-white/80 hover:bg-white/10' : 'text-slate-500 hover:bg-slate-100'
      }`}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}

/** Dropdown menu cho user đã đăng nhập */
function UserMenu({ isTransparent }: { isTransparent: boolean }) {
  const { user } = useAuthStore();
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className={`flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all duration-200 ${
          isTransparent ? 'hover:bg-white/10' : 'hover:bg-slate-100'
        }`}
        aria-expanded={open}
        aria-label="Menu người dùng"
      >
        <UserAvatar name={user.name} />
        <span className={`text-sm font-medium hidden lg:block max-w-[120px] truncate ${
          isTransparent ? 'text-white' : 'text-slate-800'
        }`}>
          {user.name.split(' ').at(-1)}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
          open ? 'rotate-180' : ''
        } ${isTransparent ? 'text-white/70' : 'text-slate-500'}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-card-hover border border-slate-100 overflow-hidden z-50 animate-fade-up">
          {/* User info */}
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="font-semibold text-slate-900 text-sm truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
            {user.role === 'admin' && (
              <span className="badge bg-brand-50 text-brand-600 mt-1">Admin</span>
            )}
          </div>

          {/* Links */}
          <div className="py-1">
            <Link
              to="/tai-khoan"
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              onClick={() => setOpen(false)}
            >
              <User className="w-4 h-4 text-slate-400" />
              Tài khoản của tôi
            </Link>
            <Link
              to="/dat-xe-cua-toi"
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              onClick={() => setOpen(false)}
            >
              <Car className="w-4 h-4 text-slate-400" />
              Đơn thuê xe
            </Link>
            <Link
              to="/xe-cho-thue"
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              onClick={() => setOpen(false)}
            >
              <Car className="w-4 h-4 text-brand-400" />
              Xe cho thuê
            </Link>
            <Link
              to="/vi-dien-tu"
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              onClick={() => setOpen(false)}
            >
              <Wallet className="w-4 h-4 text-green-500" />
              Ví điện tử
            </Link>
            {user.role === 'admin' && (
              <Link
                to="/admin"
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                onClick={() => setOpen(false)}
              >
                <Settings className="w-4 h-4 text-slate-400" />
                Quản trị
              </Link>
            )}
          </div>

          {/* Logout */}
          <div className="py-1 border-t border-slate-100">
            <button
              onClick={() => {
                setOpen(false);
                logout.mutate();
              }}
              disabled={logout.isPending}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full"
            >
              {logout.isPending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <LogOut className="w-4 h-4" />
              }
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const isTransparent = isHome && !scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isTransparent
          ? 'bg-transparent py-4'
          : 'bg-white/95 backdrop-blur-md shadow-sm py-3'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" aria-label="SkibidiCar trang chủ">
            <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shadow-orange group-hover:scale-110 transition-transform duration-200">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className={`text-xl font-bold tracking-tight transition-colors ${
              isTransparent ? 'text-white' : 'text-slate-900'
            }`}>
              Skibidi<span className="text-brand-500">Car</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Menu chính">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-brand-500 bg-brand-50'
                      : isTransparent
                        ? 'text-white/90 hover:text-white hover:bg-white/10'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Search autocomplete — only shown on non-home pages */}
          {!isTransparent && (
            <div className="hidden lg:block w-56 xl:w-72">
              <SearchAutocomplete placeholder="Tìm xe nhanh..." />
            </div>
          )}

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="tel:1900xxxx"
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                isTransparent ? 'text-white/80 hover:text-white' : 'text-slate-500 hover:text-slate-700'
              }`}
              aria-label="Gọi hotline"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden lg:inline">1900 xxxx</span>
            </a>

            {/* Dark mode toggle */}
            <DarkToggle isTransparent={isTransparent} />

            {isAuthenticated ? (
              <UserMenu isTransparent={isTransparent} />
            ) : (
              <>
                <Link to="/dang-nhap" className={`flex items-center gap-1.5 py-2 px-4 text-sm rounded-xl font-semibold border-2 transition-all duration-200 ${
                  isTransparent
                    ? 'border-white/40 text-white hover:bg-white/10'
                    : 'border-brand-500 text-brand-500 hover:bg-brand-50'
                }`}>
                  <User className="w-4 h-4" />
                  Đăng nhập
                </Link>
                <Link to="/tim-xe" className="btn-primary py-2 px-4 text-sm">
                  Thuê xe ngay
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className={`md:hidden p-2 rounded-lg transition-colors ${
              isTransparent ? 'text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'
            }`}
            onClick={() => setMenuOpen((p) => !p)}
            aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        } bg-white border-t border-slate-100`}
      >
        <nav className="px-4 py-4 flex flex-col gap-1" aria-label="Menu di động">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'text-brand-500 bg-brand-50' : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

          <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100">
            {isAuthenticated ? (
              <Link to="/tai-khoan" className="btn-outline w-full justify-center text-sm">
                <User className="w-4 h-4" />
                Tài khoản của tôi
              </Link>
            ) : (
              <>
                <Link to="/dang-nhap" className="btn-outline w-full justify-center text-sm">
                  Đăng nhập
                </Link>
                <Link to="/dang-ky" className="btn-primary w-full justify-center text-sm">
                  Đăng ký
                </Link>
              </>
            )}
            <Link to="/tim-xe" className="btn-primary w-full justify-center text-sm">
              Thuê xe ngay
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
