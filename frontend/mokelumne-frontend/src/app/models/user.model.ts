export interface UserProfile {
  _id: string;
  firebaseUid: string;
  email: string;
  title?: 'Herr' | 'Frau' | 'Divers' | 'Dr.' | '';
  name?: string; // Optional combined name field
  first_name?: string;
  last_name?: string;
  role: 'customer' | 'admin';
  address?: {
    street?: string;
    postalCode?: string;
    city?: string;
    country?: string;
  };
  phoneNumber?: string;
}

