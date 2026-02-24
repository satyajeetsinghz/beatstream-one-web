// src/features/sections/types.ts
export interface ISection {
  id: string;
  title: string;
  isActive: boolean;
  createdAt?: any;
  itemCount?: number; // Add this optional property
}