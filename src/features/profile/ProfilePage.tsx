import { useState } from "react";
import { useProfile } from "./hooks/useProfile";
import ProfileHeader from "./components/ProfileHeader";
import ProfileInfo from "./components/ProfileInfo";
import EditProfileModal from "./components/EditProfileModal";
// import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate } from "react-router-dom";
import { useResponsive } from "@/components/layout/hooks/useResponsive";
import { ChevronLeftRounded } from "@mui/icons-material";

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
    <div className="min-h-screen bg-white">
      {/* Mobile: centered with less padding, Tablet/Desktop: full width with minimal padding */}
      <div className="w-full">
        {/* Mobile: max-w-sm to center content, Tablet/Desktop: full width */}
        <div className="max-w-sm sm:max-w-full mx-auto">
          {/* Profile Card - Full width on all screens */}
          <div className="bg-white rounded-xl sm:rounded-xl md:rounded-2xl shadow-sm overflow-hidden w-full">

            {/* Header with gradient background - Responsive padding */}
            <div className="bg-white">
              <div className="flex items-center justify-start px-4 mb-4 mt-6">
                {/* Back Button */}
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 hover:text-[#FA2E6E] transition-colors group"
                >
                  <div className="">
                    <ChevronLeftRounded fontSize="large" className="text-[#FA2E6E] group-hover:text-[#FA2E6E]" />
                  </div>
                  {/* <span className="text-xs">Back</span> */}
                </button>

                {/* Page Title - Visible on mobile */}
                {isMobile && (
                  <h1 className="text-base font-semibold text-neutral-800">Profile</h1>
                )}
              </div>
            </div>

            {/* Profile Content - Responsive padding */}
            <div className="p-3 sm:p-4 md:p-5 lg:p-6">
              <ProfileHeader profile={profile} onEdit={() => setOpen(true)} />

              {/* Divider with responsive spacing */}
              <div className="my-4 sm:my-5 md:my-6 border-t border-gray-200"></div>

              <ProfileInfo profile={profile} />
            </div>
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