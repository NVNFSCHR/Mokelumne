import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Product} from '../services/home-view';

@Component({
  selector: 'app-home-view-2',
  imports: [],
  templateUrl: './home-view-2.html',
  styleUrl: './home-view-2.scss'
})
export class HomeView2 implements OnChanges {
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
      this.imageUrl = "/api/images/" + this.product?.images?.[0];
    }
  }
}
