import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id: number;
  name: string;
  subtitle: string
  description: string;
  images: string[];
  price: number;
  stock: number;
  display_rank: number;
}

@Injectable({
  providedIn: 'root'
})
export class HomeView {

  constructor(private http: HttpClient) { }

  getHomeViewData(): Observable<any> {
    return this.http.get<any>("/api/products");
  }
}
