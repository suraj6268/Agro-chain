import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import SchemesPage from './pages/SchemesPage';
import SchemeDetailPage from './pages/SchemeDetailPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import SchemesManagement from './pages/admin/SchemesManagement';
import SuperAdmin from './pages/admin/SuperAdmin';
import InventoryManagement from './pages/admin/InventoryManagement';
import NotificationsManagement from './pages/admin/NotificationsManagement';
import DistributionPage from './pages/DistributionPage'; // Added import
import DistributorManagement from './pages/admin/DistributorManagement';
import DistributorDashboard from './pages/distributor/DistributorDashboard';
import MarketPrice from './pages/MarketPrice';
import Notifications from './pages/Notifications';
import AdminLayout from './pages/admin/AdminLayout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <div className="main-content" style={{ flex: 1 }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<SchemesPage />} />
              <Route path="/scheme/:id" element={<SchemeDetailPage />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/market-price" element={<MarketPrice />} />
              <Route path="/distribution" element={<DistributionPage />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/schemes" element={<SchemesManagement />} />
                <Route path="/admin/users" element={
                  <ProtectedRoute requireSuperAdmin><SuperAdmin /></ProtectedRoute>
                } />
                <Route path="/admin/distributors" element={<DistributorManagement />} />
                <Route path="/admin/inventory" element={<InventoryManagement />} />
                <Route path="/admin/notifications" element={<NotificationsManagement />} />
              </Route>

              {/* Distributor Routes */}
              <Route path="/distributor/dashboard" element={
                <ProtectedRoute><DistributorDashboard /></ProtectedRoute>
              } />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
