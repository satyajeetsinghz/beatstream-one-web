import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
// import { useResponsive } from "@/components/layout/hooks/useResponsive";

interface Props {
  profile: any;
}

const ProfileInfo = ({ profile }: Props) => {
  // const { isMobile } = useResponsive();

  // Format date if available
  const formatDate = (timestamp?: any) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
      {/* Account Information Section */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900">Account Information</h3>
        </div>
        
        <div className="divide-y divide-gray-100">
          {/* Display Name */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 sm:p-5">
            <div className="flex items-center gap-3 sm:w-48">
              <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
                <PersonIcon className="text-gray-500" fontSize="small" />
              </div>
              <p className="text-xs text-gray-500 sm:hidden">Display Name</p>
            </div>
            <div className="flex-1">
              <p className="hidden sm:block text-xs text-gray-500 mb-1">Display Name</p>
              <p className="text-sm font-medium text-gray-900 break-all">
                {profile?.name || profile?.displayName || 'Not set'}
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 sm:p-5">
            <div className="flex items-center gap-3 sm:w-48">
              <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
                <EmailIcon className="text-gray-500" fontSize="small" />
              </div>
              <p className="text-xs text-gray-500 sm:hidden">Email Address</p>
            </div>
            <div className="flex-1">
              <p className="hidden sm:block text-xs text-gray-500 mb-1">Email Address</p>
              <p className="text-sm text-gray-900 break-all">
                {profile?.email || 'Not provided'}
              </p>
            </div>
          </div>

          {/* Role */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 sm:p-5">
            <div className="flex items-center gap-3 sm:w-48">
              <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
                <BadgeIcon className="text-gray-500" fontSize="small" />
              </div>
              <p className="text-xs text-gray-500 sm:hidden">Account Type</p>
            </div>
            <div className="flex-1">
              <p className="hidden sm:block text-xs text-gray-500 mb-1">Account Type</p>
              <p className="text-sm font-medium text-gray-900 capitalize">
                {profile?.role || 'User'}
              </p>
            </div>
          </div>

          {/* User ID */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 sm:p-5">
            <div className="flex items-center gap-3 sm:w-48">
              <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
                <VpnKeyIcon className="text-gray-500" fontSize="small" />
              </div>
              <p className="text-xs text-gray-500 sm:hidden">User ID</p>
            </div>
            <div className="flex-1">
              <p className="hidden sm:block text-xs text-gray-500 mb-1">User ID</p>
              <p className="text-xs font-mono text-gray-500 break-all bg-gray-50 p-2 sm:p-3 rounded-lg">
                {profile?.uid || 'N/A'}
              </p>
            </div>
          </div>

          {/* Member Since */}
          {profile?.createdAt && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 sm:p-5">
              <div className="flex items-center gap-3 sm:w-48">
                <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <CalendarTodayIcon className="text-gray-500" fontSize="small" />
                </div>
                <p className="text-xs text-gray-500 sm:hidden">Member Since</p>
              </div>
              <div className="flex-1">
                <p className="hidden sm:block text-xs text-gray-500 mb-1">Member Since</p>
                <p className="text-sm text-gray-900">
                  {formatDate(profile?.createdAt)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions - Mobile Only */}
      {/* {isMobile && (
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
            <PersonIcon className="text-gray-500" fontSize="small" />
            <span className="text-xs font-medium text-gray-700">Edit Profile</span>
          </button>
          <button className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
            <BadgeIcon className="text-gray-500" fontSize="small" />
            <span className="text-xs font-medium text-gray-700">Settings</span>
          </button>
        </div>
      )} */}
    </div>
  );
};

export default ProfileInfo;