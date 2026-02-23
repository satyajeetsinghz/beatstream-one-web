export interface ITrack {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  coverUrl: string;
}

export interface IPlayerContext {
  currentTrack: ITrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  setVolume: React.Dispatch<React.SetStateAction<number>>;
  isMuted: boolean;
  toggleMute: () => void;


  queue: ITrack[];
  currentIndex: number;

  playTrack: (track: ITrack, trackList?: ITrack[]) => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  playNext: () => void;
  playPrevious: () => void;
}


