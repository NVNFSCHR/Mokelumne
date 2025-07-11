export interface UserProfile {
  _id: string;
  firebaseUid: string;
  email: string;
  name?: string;
  role: 'customer' | 'admin';
  address?: {
    street?: string;
    postalCode?: string;
    city?: string;
    country?: string;
  };
  phoneNumber?: string;
}

