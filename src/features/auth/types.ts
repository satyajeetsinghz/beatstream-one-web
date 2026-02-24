// import { User } from "firebase/auth";

export interface IUser {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  role?: "admin" | "user";
  createdAt: Date;
}

export interface IAuthContext {
  user: IUser | null;
  loading: boolean;
}
