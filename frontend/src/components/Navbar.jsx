import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Stethoscope,
    History,
    LogOut,
    Shield,
    Menu,
    X,
} from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const { user, logout, isAdmin } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { path: '/', label: 'Analyze', icon: Stethoscope },
        { path: '/history', label: 'History', icon: History },
        ...(isAdmin ? [{ path: '/admin', label: 'Admin', icon: Shield }] : []),
    ];

    return (
        <nav className="sticky top-0 z-50 glass-card mx-4 mt-4 px-6 py-3 print:hidden">
            <div className="flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                        style={{ background: 'var(--gradient-primary)' }}>
                        <Stethoscope className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold font-display gradient-text">MedAssist AI</h1>
                        <p className="text-[10px] text-surface-400 -mt-0.5 tracking-wide">Decision Support System</p>
                    </div>
                </Link>
                <div className="hidden md:flex items-center gap-1">
                    {navLinks.map(({ path, label, icon: Icon }) => (
                        <Link
                            key={path}
                            to={path}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive(path)
                                    ? 'bg-primary-100 text-primary-700'
                                    : 'text-surface-500 hover:text-surface-700 hover:bg-surface-100'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </Link>
                    ))}
                </div>
                <div className="hidden md:flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-sm font-semibold text-surface-700">{user?.name || 'User'}</p>
                        <p className="text-[11px] text-surface-400">{user?.role === 'admin' ? 'Administrator' : 'User'}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 rounded-lg text-surface-400 hover:text-danger-600 hover:bg-danger-50 transition-all"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="md:hidden p-2 rounded-lg text-surface-500 hover:bg-surface-100"
                >
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>
            {mobileOpen && (
                <div className="md:hidden mt-3 pt-3 border-t border-surface-200 animate-slide-down">
                    {navLinks.map(({ path, label, icon: Icon }) => (
                        <Link
                            key={path}
                            to={path}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                ${isActive(path)
                                    ? 'bg-primary-100 text-primary-700'
                                    : 'text-surface-500 hover:bg-surface-100'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </Link>
                    ))}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-danger-600 hover:bg-danger-50 transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            )}
        </nav>
    );
}
