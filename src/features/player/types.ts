export interface ITrack {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  duration?: string;
  audioUrl?: string;
}

// export interface IPlayerContext {
//   currentTrack: ITrack | null;
//   isPlaying: boolean;
//   currentTime: number;
//   duration: number;
//   volume: number;
//   setVolume: React.Dispatch<React.SetStateAction<number>>;
//   isMuted: boolean;
//   toggleMute: () => void;


//   queue: ITrack[];
//   currentIndex: number;

//   playTrack: (track: ITrack, trackList?: ITrack[]) => void;
//   togglePlay: () => void;
//   seek: (time: number) => void;
//   playNext: () => void;
//   playPrevious: () => void;
// }
export interface IPlayerContext {
    currentTrack: ITrack | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    queue: ITrack[];
    currentIndex: number;
    volume: number;
    isMuted: boolean;
    playTrack: (track: ITrack, trackList?: ITrack[]) => Promise<void>;
    togglePlay: () => void;
    seek: (time: number) => void;
    playNext: () => void;
    playPrevious: () => void;
    setVolume: (volume: number) => void;
    toggleMute: () => void;
}

