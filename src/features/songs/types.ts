import { Timestamp } from "firebase/firestore";

export interface ISong {
  id: string;
  title: string;
  artist: string;
  audioUrl?: string;
  coverUrl: string;
  duration?: string;
  album?: string;
  sectionIds: string[];
  likeCount: number;
  createdAt?: Timestamp;
}
