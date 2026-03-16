export interface IUser {
  uid: string;
  name: string;
  email: string;
  photoURL: string;

  role: "user" | "admin";
  status: "active" | "banned" | "suspended";

  createdAt: any;
  lastLoginAt?: any;
}