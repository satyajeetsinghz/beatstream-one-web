import { useState } from "react";
import { useProfile } from "./hooks/useProfile";
import ProfileHeader from "./components/ProfileHeader";
import ProfileInfo from "./components/ProfileInfo";
import EditProfileModal from "./components/EditProfileModal";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate } from "react-router-dom";
import { useResponsive } from "@/components/layout/hooks/useResponsive";

const ProfilePage = () => {
  const { profile, loading, updateProfile } = useProfile();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { isMobile } = useResponsive();

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-[#fea1be] border-t-[#FA2E6E] rounded-full animate-spin"></div>
          <p className="text-xs sm:text-sm text-gray-400 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 sm:py-8 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm overflow-hidden">

          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 px-4 sm:px-6 md:px-8 py-4 sm:py-5">
            <div className="flex items-center justify-between">
              {/* Back Button */}
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#FA2E6E] transition-colors duration-200 group"
                aria-label="Go back"
              >
                <div className="p-1.5 sm:p-2 rounded-full bg-gray-100 group-hover:bg-[#FA2E6E]/10 transition-colors duration-200">
                  <ArrowBackIcon fontSize="small" className="text-gray-600 group-hover:text-[#FA2E6E]" />
                </div>
                {!isMobile && <span className="text-xs font-medium">Back</span>}
              </button>

              {/* Page Title - Visible on mobile */}
              {isMobile && (
                <h1 className="text-base font-semibold text-gray-900">Profile</h1>
              )}

              {/* Settings Button */}
              <button className="p-1.5 sm:p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                <SettingsIcon fontSize="small" className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-4 sm:p-6 md:p-8">
            <ProfileHeader profile={profile} onEdit={() => setOpen(true)} />

            {/* Divider */}
            <div className="my-6 sm:my-8 border-t border-gray-200"></div>

            <ProfileInfo profile={profile} />
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {open && (
        <EditProfileModal
          profile={profile}
          onClose={() => setOpen(false)}
          onSave={updateProfile}
        />
      )}
    </div>
  );
};

export default ProfilePage;