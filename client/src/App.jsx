import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Album from './pages/Album';
import Page from './pages/Page';
import Login from './pages/Login';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminAlbums from './pages/admin/Albums';
import AdminPhotos from './pages/admin/Photos';
import AdminPages from './pages/admin/Pages';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Publieke routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="album/:id" element={<Album />} />
        <Route path="pagina/:slug" element={<Page />} />
        <Route path="login" element={<Login />} />
      </Route>

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="albums" element={<AdminAlbums />} />
        <Route path="fotos" element={<AdminPhotos />} />
        <Route path="paginas" element={<AdminPages />} />
      </Route>
    </Routes>
  );
}

export default App; 