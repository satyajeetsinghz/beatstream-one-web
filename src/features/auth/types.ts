// import { User } from "firebase/auth";

import { FieldValue } from "firebase/firestore";

export interface IUser {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  role?: "admin" | "user";
  status: any;
  createdAt: FieldValue;
  lastLoginAt: FieldValue
}

export interface IAuthContext {
  user: IUser | null;
  loading: boolean;
}
