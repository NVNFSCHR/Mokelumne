import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { UserProfile } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class HttpUserService {
  private http = inject(HttpClient);
  private auth = inject(Auth);
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  getAuth(): Auth {
    return this.auth;
  }

  async loadUser(): Promise<UserProfile | null> {
    try {
      // Auf Auth-Status warten
      await new Promise<void>((resolve) => {
        const unsubscribe = this.auth.onAuthStateChanged((user) => {
          unsubscribe();
          resolve();
        });
      });

      const currentUser = this.auth.currentUser;

      if (!currentUser) {
        console.log('Kein angemeldeter Benutzer gefunden');
        this.currentUserSubject.next(null);
        return null;
      }

      const token = await currentUser.getIdToken();
      const headers = { Authorization: `Bearer ${token}` };

      const backendUser = await firstValueFrom(
        this.http.get<any>('/api/user/me', { headers })
      );

      const userProfile: UserProfile = {
        _id: backendUser._id,
        firebaseUid: backendUser.firebaseUid,
        email: backendUser.email,
        name: backendUser.name,
        role: backendUser.role,
        address: backendUser.address,
        phoneNumber: backendUser.phoneNumber
      };

      this.currentUserSubject.next(userProfile);
      console.log('Benutzer erfolgreich geladen:', userProfile.email);
      return userProfile;
    } catch (error) {
      console.error('Fehler beim Laden des Benutzers:', error);
      this.currentUserSubject.next(null);
      return null;
    }
  }

  async updateUser(updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const token = await this.auth.currentUser?.getIdToken();
      if (!token) return null;

      const headers = { Authorization: `Bearer ${token}` };

      const updatedUser = await firstValueFrom(
        this.http.put<any>('/api/user/me', updates, { headers })
      );

      const userProfile: UserProfile = {
        _id: updatedUser._id,
        firebaseUid: updatedUser.firebaseUid,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        address: updatedUser.address,
        phoneNumber: updatedUser.phoneNumber
      };

      this.currentUserSubject.next(userProfile);
      return userProfile;
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Benutzers:', error);
      return null;
    }
  }

  hasPermission(permission: string): boolean {
    const currentUser = this.currentUserSubject.value;
    if (currentUser?.role === 'admin') {
      return true; // Admins haben alle Permissions
    }

    // Kunden haben nur basic permissions
    const customerPermissions = ['PLACE_ORDER', 'VIEW_PROFILE'];
    return customerPermissions.includes(permission);
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'admin';
  }

  isCustomer(): boolean {
    return this.currentUserSubject.value?.role === 'customer';
  }

  clearCurrentUser(): void {
    this.currentUserSubject.next(null);
  }
}
