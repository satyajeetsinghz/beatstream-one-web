// import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import { useResponsive } from "@/components/layout/hooks/useResponsive";

interface Props {
  profile: any;
  onEdit: () => void;
}

const ProfileHeader = ({ profile, onEdit }: Props) => {
  const { isMobile } = useResponsive();

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
      {/* Profile Image with Apple-style ring */}
      <div className="relative group">
        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden ring-4 ring-white shadow-xl transition-transform group-hover:scale-105">
          <img
            src={profile?.photoURL || "/default-avatar.png"}
            alt={profile?.name || "Profile"}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Edit button overlay on hover (desktop only) */}
        {!isMobile && (
          <button
            onClick={onEdit}
            className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#FA2E6E] rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-[#E01E5A]"
            aria-label="Edit profile"
          >
            <EditIcon className="text-white" fontSize="small" />
          </button>
        )}
      </div>

      {/* User Info */}
      <div className="flex-1">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mb-1">
          {profile?.name || "User Name"}
        </h1>
        
        {/* Email with icon */}
        <div className="flex items-center justify-center sm:justify-start gap-1 text-gray-500 text-xs sm:text-sm mb-3">
          <span>{profile?.email || "user@example.com"}</span>
        </div>

        {/* User stats - Quick info */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 mb-4">
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold text-gray-900">156</p>
            <p className="text-[10px] text-gray-500">Songs</p>
          </div>
          <div className="w-px h-4 bg-gray-200"></div>
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold text-gray-900">24</p>
            <p className="text-[10px] text-gray-500">Playlists</p>
          </div>
          <div className="w-px h-4 bg-gray-200 hidden xs:block"></div>
          <div className="text-center sm:text-left hidden xs:block">
            <p className="text-sm font-semibold text-gray-900">12</p>
            <p className="text-[10px] text-gray-500">Followers</p>
          </div>
        </div>

        {/* Edit Profile Button - Apple Style */}
        <button
          onClick={onEdit}
          className="px-5 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium bg-[#FA2E6E] text-white rounded-full hover:bg-[#E01E5A] transition-colors duration-200 shadow-sm hover:shadow-md flex items-center gap-2 mx-auto sm:mx-0"
        >
          <EditIcon fontSize="small" />
          <span>Edit Profile</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileHeader;