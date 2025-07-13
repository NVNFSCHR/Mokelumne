import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Navbar } from './navbar/navbar';
import { HttpUserService } from './services/http/http-user.service';
import { Footer } from './footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Navbar, Footer],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit {
  private userService = inject(HttpUserService);

  constructor(public router: Router) {}

  ngOnInit() {
    // Benutzer beim App-Start laden
    this.initAuth();
  }

  private async initAuth() {
    try {
      await this.userService.loadUser();
      console.log('Benutzer beim App-Start geladen');
    } catch (error) {
      console.log('Kein aktiver Benutzer beim App-Start');
    }
  }
}
