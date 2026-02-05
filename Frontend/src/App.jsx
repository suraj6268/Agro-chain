import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import SchemesPage from './pages/SchemesPage';
import SchemeDetailPage from './pages/SchemeDetailPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import SchemesManagement from './pages/admin/SchemesManagement';
import SuperAdmin from './pages/admin/SuperAdmin';
import InventoryManagement from './pages/admin/InventoryManagement';
import DistributorDashboard from './pages/distributor/DistributorDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<SchemesPage />} />
          <Route path="/scheme/:id" element={<SchemeDetailPage />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/schemes" element={
            <ProtectedRoute><SchemesManagement /></ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute requireSuperAdmin><SuperAdmin /></ProtectedRoute>
          } />
          <Route path="/admin/inventory" element={
            <ProtectedRoute><InventoryManagement /></ProtectedRoute>
          } />

          {/* Distributor Routes */}
          <Route path="/distributor/dashboard" element={
            <ProtectedRoute><DistributorDashboard /></ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
