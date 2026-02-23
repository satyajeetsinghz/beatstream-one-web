import { useAuth } from "@/features/auth/hooks/useAuth";

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          
          {/* Header */}
          <div className="flex items-center gap-6">
            <img
              src={user?.photoURL || "/default-avatar.png"}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border"
            />

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user?.name || "User"}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {user?.email}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Role: {user?.role}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="my-8 border-t"></div>

          {/* Account Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
              <label className="text-xs text-gray-500">User ID</label>
              <p className="text-sm text-gray-900 break-all">
                {user?.uid}
              </p>
            </div>

            <div>
              <label className="text-xs text-gray-500">Account Type</label>
              <p className="text-sm text-gray-900 capitalize">
                {user?.role}
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
