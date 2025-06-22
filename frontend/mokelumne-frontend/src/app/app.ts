import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {CommonModule} from '@angular/common';

import { HomeView, Product } from './services/home-view';

import { Navbar } from './navbar/navbar';
import { HomeView1 } from './home-view-1/home-view-1';
import {HomeView2} from './home-view-2/home-view-2';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, Navbar, HomeView1, HomeView2],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private HomeViewService = inject(HomeView);
  products: Product[] = [];

  ngOnInit() {
    this.HomeViewService.getHomeViewData().subscribe(data => {
      // data ist bereits ein Array, nicht data.products
      this.products = data;
      console.log('Products:', this.products);
    });
  }
}
