import UploadSongForm from "../components/UploadSongForm";
import DashboardIcon from '@mui/icons-material/Dashboard';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PeopleIcon from '@mui/icons-material/People';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SettingsIcon from '@mui/icons-material/Settings';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import ImageIcon from '@mui/icons-material/Image';
import { useState } from "react";
import { SectionManager } from "@/features/sections/components/SectionManager";
import SongManager from "../components/SongManager";
import BannerManager from "@/features/banner/components/BannerManager";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('upload');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'upload', label: 'Upload Music', icon: MusicNoteIcon },
    { id: 'songs', label: 'Manage Songs', icon: LibraryMusicIcon },
    { id: 'sections', label: 'Sections', icon: ViewQuiltIcon },
    { id: 'banners', label: 'Banners', icon: ImageIcon },
    { id: 'users', label: 'Users', icon: PeopleIcon },
    { id: 'analytics', label: 'Analytics', icon: AnalyticsIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center">
                <DashboardIcon className="text-white" fontSize="small" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-500">Manage your music library</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-2xl font-semibold text-gray-900">24</p>
                <p className="text-xs text-gray-500">Total Songs</p>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="text-right">
                <p className="text-2xl font-semibold text-gray-900">8</p>
                <p className="text-xs text-gray-500">Artists</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <nav className="flex space-x-8 overflow-x-auto pb-0 scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon fontSize="small" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {activeTab === 'upload' && (
          <div className="space-y-6">
            {/* Quick Upload Card */}
            <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    Quick Upload
                  </h2>
                  <p className="text-sm text-gray-500">
                    Upload new songs to your music library
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center">
                  <MusicNoteIcon className="text-white" />
                </div>
              </div>
            </div>

            {/* Upload Form */}
            <UploadSongForm />
          </div>
        )}

        {activeTab === 'songs' && (
          <div className="space-y-6">
            {/* Song Management Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-[#FA2E6E] rounded-full"></div>
                <h2 className="text-lg font-semibold text-gray-900">Song Management</h2>
                <span className="text-xs text-gray-400 ml-1">
                  Edit and manage your music library
                </span>
              </div>
            </div>

            {/* Song Manager Component */}
            <SongManager />
          </div>
        )}

        {activeTab === 'sections' && (
          <div className="space-y-6">
            {/* Section Management Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-[#FA2E6E] rounded-full"></div>
                <h2 className="text-lg font-semibold text-gray-900">Section Management</h2>
              </div>
            </div>

            {/* Section Manager */}
            <SectionManager />
          </div>
        )}

        {activeTab === 'banners' && (
          <div className="space-y-6">
            {/* Banner Management Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-[#FA2E6E] rounded-full"></div>
                <h2 className="text-lg font-semibold text-gray-900">Banner Management</h2>
                <span className="text-xs text-gray-400 ml-1">
                  Manage hero banners on the homepage
                </span>
              </div>
            </div>

            {/* Banner Manager Component */}
            <BannerManager />
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="text-center py-12">
            <DashboardIcon className="text-gray-300" style={{ fontSize: 48 }} />
            <p className="text-gray-500 mt-4">Dashboard coming soon</p>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="text-center py-12">
            <PeopleIcon className="text-gray-300" style={{ fontSize: 48 }} />
            <p className="text-gray-500 mt-4">User management coming soon</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="text-center py-12">
            <AnalyticsIcon className="text-gray-300" style={{ fontSize: 48 }} />
            <p className="text-gray-500 mt-4">Analytics coming soon</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="text-center py-12">
            <SettingsIcon className="text-gray-300" style={{ fontSize: 48 }} />
            <p className="text-gray-500 mt-4">Settings coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;