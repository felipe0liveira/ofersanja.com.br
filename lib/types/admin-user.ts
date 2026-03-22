export type AdminUser = {
  id: string; // Firestore document ID
  uid: string | null; // Firebase Auth UID (null if user was pre-created and never logged in)
  email: string;
  name: string | null;
  photo: string | null;
  roles: string[];
  lastLoginAt: string | null; // ISO string
};
