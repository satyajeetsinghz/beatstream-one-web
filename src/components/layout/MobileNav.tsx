// components/layout/MobileNav.tsx
import { Link, useLocation } from "react-router-dom";
import HomeIcon from '@mui/icons-material/Home';
// import SearchIcon from '@mui/icons-material/Search';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
// import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonIcon from '@mui/icons-material/Person';

const MobileNav = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: HomeIcon, label: 'Home' },
    // { path: '/search', icon: SearchIcon, label: 'Search' },
    { path: '/library', icon: LibraryMusicIcon, label: 'Library' },
    // { path: '/liked', icon: FavoriteIcon, label: 'Liked' },
    { path: '/profile', icon: PersonIcon, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-40 lg:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center px-3 py-1 rounded-lg transition-colors ${
                isActive ? 'text-[#FA2E6E]' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon fontSize="small" />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              {/* {isActive && (
                <span className="absolute -top-1 w-1 h-1 bg-[#FA2E6E] rounded-full" />
              )} */}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;