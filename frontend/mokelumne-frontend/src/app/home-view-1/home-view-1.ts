import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Product } from '../services/home-view';

@Component({
  selector: 'app-home-view-1',
  imports: [],
  templateUrl: './home-view-1.html',
  styleUrl: './home-view-1.scss'
})
export class HomeView1 implements OnChanges {
  @Input() product?: Product;

  protected title?: string;
  protected subtitle?: string;
  protected description?: string;
  protected price?: number;
  protected imageUrl?: string;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] && this.product) {
      this.title = this.product.name;
      this.subtitle = this.product.subtitle;
      this.description = this.product.description;
      this.price = this.product.price;
      this.imageUrl = "http://image-service:4000/api/" + this.product?.images?.[0];
    }
  }
}
