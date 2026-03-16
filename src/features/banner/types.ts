// types.ts
import { Timestamp } from "firebase/firestore";

export interface IBanner {
  id: string;
  title: string;
  subtitle?: string;
  
  // Media fields - consistent naming
  mediaType: 'image' | 'video'; // Make required with default
  imageUrl: string; // Required for fallback
  mediaUrl?: string; // For videos (optional)
  
  redirectType?: "song" | "playlist" | "artist" | "section";
  redirectId?: string;
  
  startDate?: Timestamp;
  endDate?: Timestamp;
  
  order?: number;
  priority?: number;
  
  isActive: boolean;
  buttonText?: string; // Add this if used
}