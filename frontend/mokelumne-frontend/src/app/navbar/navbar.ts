import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { UserService } from '../services/user';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {
  public authService = inject(AuthService);
  public userService = inject(UserService);
  private router = inject(Router);

  isDropdownOpen = false;

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      this.isDropdownOpen = false;
    }
  }

  getUserInitials(user: User): string {
    if (user?.displayName) {
      const names = user.displayName.split(' ');
      if (names.length >= 2) {
        return (names[0]![0]! + names[1]![0]!).toUpperCase();
      }
      return names[0]![0]!.toUpperCase();
    } else if (user?.email) {
      return user.email[0]!.toUpperCase();
    }
    return 'U';
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  viewProfile(): void {
    this.isDropdownOpen = false;
    this.router.navigate(['/profile']);
  }

  viewAdminPanel(): void {
    this.isDropdownOpen = false;
    this.router.navigate(['/manage']);
  }

  viewSettings(): void {
    this.isDropdownOpen = false;
    this.router.navigate(['/settings']);
  }

  logout(): void {
    this.isDropdownOpen = false;
    this.authService.logout();
  }
  navigateToCart() {
    this.router.navigate(['/cart']);
  }
}
