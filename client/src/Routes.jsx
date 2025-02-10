import React from 'react';
import { Routes as RouterRoutes, Route } from 'react-router-dom';
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
import PageEditor from './pages/admin/PageEditor';
import Settings from './pages/admin/Settings';
import ProtectedRoute from './components/ProtectedRoute';

const AppRoutes = () => {
  return (
    <RouterRoutes>
      {/* Publieke routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="album/:id" element={<Album />} />
        <Route path=":parentSlug/:slug" element={<Page />} />
        <Route path=":slug" element={<Page />} />
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
        <Route path="paginas/nieuw" element={<PageEditor />} />
        <Route path="paginas/:id" element={<PageEditor />} />
        <Route path="instellingen" element={<Settings />} />
      </Route>
    </RouterRoutes>
  );
};

export default AppRoutes; 