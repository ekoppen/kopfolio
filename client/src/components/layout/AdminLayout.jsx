import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, DocumentIcon, PhotoIcon, FolderIcon, CogIcon, DatabaseIcon, UsersIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

const AdminLayout = () => {
  const [isPagesOpen, setIsPagesOpen] = useState(false);
  const [isPhotosOpen, setIsPhotosOpen] = useState(false);
  const [isAlbumsOpen, setIsAlbumsOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-900">
      <aside className="w-64 bg-gray-800 p-6 space-y-6">
        <div className="flex items-center space-x-4">
          {/* Add your logo here */}
        </div>
        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-1">
            <li>
              <Link to="/admin" className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                location.pathname === '/admin' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}>
                <HomeIcon className="mr-3 h-6 w-6" />
                Dashboard
              </Link>
            </li>
            <li>
              <button
                onClick={() => setIsPagesOpen(!isPagesOpen)}
                className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
              >
                <div className="flex items-center">
                  <DocumentIcon className="mr-3 h-6 w-6" />
                  Pagina's
                </div>
                <ChevronDownIcon className={`h-5 w-5 transform transition-transform ${isPagesOpen ? 'rotate-180' : ''}`} />
              </button>
              <ul className={`mt-1 space-y-1 bg-gray-800 ${isPagesOpen ? 'block' : 'hidden'}`}>
                <li>
                  <Link to="/admin/pages" className="flex items-center pl-11 pr-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md">
                    Alle Pagina's
                  </Link>
                </li>
                <li>
                  <Link to="/admin/pages/new" className="flex items-center pl-11 pr-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md">
                    Nieuwe Pagina
                  </Link>
                </li>
              </ul>
            </li>
            <li>
              <button
                onClick={() => setIsPhotosOpen(!isPhotosOpen)}
                className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
              >
                <div className="flex items-center">
                  <PhotoIcon className="mr-3 h-6 w-6" />
                  Foto's
                </div>
                <ChevronDownIcon className={`h-5 w-5 transform transition-transform ${isPhotosOpen ? 'rotate-180' : ''}`} />
              </button>
              <ul className={`mt-1 space-y-1 bg-gray-800 ${isPhotosOpen ? 'block' : 'hidden'}`}>
                <li>
                  <Link to="/admin/photos" className="flex items-center pl-11 pr-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md">
                    Alle Foto's
                  </Link>
                </li>
                <li>
                  <Link to="/admin/photos/upload" className="flex items-center pl-11 pr-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md">
                    Upload Foto's
                  </Link>
                </li>
              </ul>
            </li>
            <li>
              <button
                onClick={() => setIsAlbumsOpen(!isAlbumsOpen)}
                className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
              >
                <div className="flex items-center">
                  <FolderIcon className="mr-3 h-6 w-6" />
                  Albums
                </div>
                <ChevronDownIcon className={`h-5 w-5 transform transition-transform ${isAlbumsOpen ? 'rotate-180' : ''}`} />
              </button>
              <ul className={`mt-1 space-y-1 bg-gray-800 ${isAlbumsOpen ? 'block' : 'hidden'}`}>
                <li>
                  <Link to="/admin/albums" className="flex items-center pl-11 pr-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md">
                    Alle Albums
                  </Link>
                </li>
                <li>
                  <Link to="/admin/albums/new" className="flex items-center pl-11 pr-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md">
                    Nieuw Album
                  </Link>
                </li>
              </ul>
            </li>
            <li>
              <Link to="/admin/settings" className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                location.pathname === '/admin/settings' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}>
                <CogIcon className="mr-3 h-6 w-6" />
                Instellingen
              </Link>
            </li>
            <li>
              <Link to="/admin/backup" className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                location.pathname === '/admin/backup' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}>
                <DatabaseIcon className="mr-3 h-6 w-6" />
                Backup
              </Link>
            </li>
            <li>
              <Link to="/admin/users" className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                location.pathname === '/admin/users' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}>
                <UsersIcon className="mr-3 h-6 w-6" />
                Gebruikers
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-8 space-y-6">
        {/* Add your main content here */}
      </main>
    </div>
  );
};

export default AdminLayout; 