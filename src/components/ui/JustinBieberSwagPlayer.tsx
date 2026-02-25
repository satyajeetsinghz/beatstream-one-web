import React from "react";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import AddIcon from '@mui/icons-material/Add';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ExplicitIcon from '@mui/icons-material/Explicit';

type Track = {
  id: number;
  title: string;
  duration: string;
  artist?: string;
  active?: boolean;
};

const tracks: Track[] = [
  { id: 1, title: "ALL I CAN TAKE", duration: "4:08", active: true },
  { id: 2, title: "DAISIES", duration: "2:56" },
  { id: 3, title: "YUKON", duration: "2:44" },
  { id: 4, title: "GO BABY", duration: "3:15" },
  { id: 5, title: "THINGS YOU DO", duration: "1:48" },
  { id: 6, title: "BUTTERFLIES", duration: "3:14" },
  { id: 7, title: "WAY IT IS", duration: "3:15", artist: "Justin Bieber, Gunna" },
];

const JustinBieberSwagPlayer: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white px-4 sm:px-6 md:px-8 py-6 md:py-10">
      
      {/* Top Section - Responsive */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-10">
        
        {/* Album Cover - Centered on mobile */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 mx-auto md:mx-0 bg-black rounded-md shadow-2xl overflow-hidden">
          <img
            src="https://images.genius.com/6c453e589e3901e2724e33edfaae707a.1000x1000x1.png"
            alt="album"
            className="w-full h-full object-cover opacity-80"
          />
        </div>

        {/* Album Info */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-wide">SWAG</h1>
              <ExplicitIcon className="text-zinc-400" fontSize="small" />
            </div>

            <h2 className="text-[#FA2E6E] text-xl sm:text-2xl mt-2 font-medium text-center md:text-left">
              Justin Bieber
            </h2>

            <div className="text-xs sm:text-sm text-zinc-400 mt-2 flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span>Pop</span>
              <span className="w-1 h-1 rounded-full bg-zinc-500" />
              <span>2025</span>
              <span className="w-1 h-1 rounded-full bg-zinc-500" />
              <span>Dolby Atmos</span>
              <span className="w-1 h-1 rounded-full bg-zinc-500" />
              <span>Lossless</span>
            </div>

            <p className="text-zinc-400 text-xs sm:text-sm mt-4 max-w-xl leading-relaxed text-center md:text-left">
              The day before the surprise release of Justin Bieber’s seventh
              album, a series of billboards popped up from Atlanta to
              Reykjavik—earnest black-and-white photos of the shirtless
              superstar posing with his wife...
            </p>

            {/* Buttons - Responsive */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-6">
              <button className="bg-[#FA2E6E] hover:bg-[#E01E5A] transition px-5 sm:px-6 py-2 rounded-md font-medium flex items-center gap-2 text-sm sm:text-base">
                <PlayArrowIcon fontSize="small" /> Play
              </button>

              <button className="bg-[#FA2E6E] hover:bg-[#E01E5A] transition px-5 sm:px-6 py-2 rounded-md font-medium flex items-center gap-2 text-sm sm:text-base">
                <ShuffleIcon fontSize="small" /> Shuffle
              </button>

              <button className="ml-auto text-[#FA2E6E] hover:text-[#E01E5A] font-medium text-sm sm:text-base">
                <AddIcon fontSize="small" className="inline mr-1" /> Add
              </button>

              <button className="text-[#FA2E6E] hover:text-[#E01E5A]">
                <MoreHorizIcon fontSize="medium" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Track List - With alternating row colors */}
      <div className="mt-8 md:mt-10">
        {tracks.map((track, index) => {
          // Alternate between dark and lighter background
          const rowColor = index % 2 === 0 
            ? 'bg-zinc-800/60' // Darker for even rows (1st, 3rd, 5th, etc.)
            : 'bg-zinc-800/20'; // Lighter for odd rows (2nd, 4th, 6th, etc.)
          
          return (
            <div
              key={track.id}
              className={`group flex items-center justify-between px-3 sm:px-4 py-3 sm:py-4 rounded-md transition-all duration-200 
                ${rowColor} 
                ${track.active ? 'bg-zinc-700/80' : 'hover:bg-zinc-400/20'}`}
            >
              <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
                <span className="w-5 text-zinc-400 text-sm sm:text-base">{track.id}</span>

                <div className="min-w-0">
                  <p
                    className={`font-medium text-sm sm:text-base truncate ${
                      track.active ? 'text-white' : 'text-zinc-300'
                    }`}
                  >
                    {track.title}
                  </p>

                  {track.artist && (
                    <p className="text-xs text-zinc-500 mt-1 truncate">
                      {track.artist}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
                <span className="text-zinc-400 text-xs sm:text-sm">
                  {track.duration}
                </span>
                <button className="opacity-0 group-hover:opacity-100 text-[#FA2E6E] hover:text-[#E01E5A] transition">
                  <MoreHorizIcon fontSize="small" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JustinBieberSwagPlayer;