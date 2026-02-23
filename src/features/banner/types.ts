export interface IBanner {
  id: string;
  title: string;
  subtitle: string;
  mediaType: "image" | "video";
  mediaUrl: string;
  imageUrl: string;
  buttonText: string;
  redirectType: "song" | "artist" | "section";
  redirectId: string;
  isActive: boolean;
  order: number;
}

