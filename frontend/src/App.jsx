import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import DisclaimerBanner from './components/DisclaimerBanner';
import Login from './pages/Login';
import Register from './pages/Register';
import SymptomInput from './pages/SymptomInput';
import Results from './pages/Results';
import History from './pages/History';
import AdminDashboard from './pages/admin/Dashboard';

function ProtectedRoute({ children, adminOnly = false }) {
    const { user, loading, isAdmin } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;
    if (adminOnly && !isAdmin) return <Navigate to="/" replace />;

    return children;
}

function AppRoutes() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-primary-50/30">
            {user && <Navbar />}
            <main className={user ? 'pt-4' : ''}>
                <Routes>
                    {/* Public */}
                    <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
                    <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />

                    {/* Protected */}
                    <Route path="/" element={
                        <ProtectedRoute>
                            <SymptomInput />
                        </ProtectedRoute>
                    } />
                    <Route path="/results" element={
                        <ProtectedRoute>
                            <Results />
                        </ProtectedRoute>
                    } />
                    <Route path="/history" element={
                        <ProtectedRoute>
                            <History />
                        </ProtectedRoute>
                    } />

                    {/* Admin */}
                    <Route path="/admin/*" element={
                        <ProtectedRoute adminOnly>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
            {user && <DisclaimerBanner />}
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}
