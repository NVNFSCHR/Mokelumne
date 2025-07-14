import { Component, Input, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { Product } from '../../services/home-view';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-home-view-1',
  imports: [RouterModule],
  standalone: true,
  templateUrl: './home-view-1.html',
  styleUrls: ['./home-view-1.scss'],
})
export class HomeView1 implements OnChanges {
  @Input() product?: Product;

  quantity: number = 1;
  isAddingToCart: boolean = false;

  private router = inject(Router);
  private cartService = inject(CartService);

  protected title?: string;
  protected subtitle?: string;
  protected description?: string;
  protected price?: number;
  protected imageUrl?: string;
  protected stock: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] && this.product) {
      this.title = this.product.name;
      this.subtitle = this.product.subtitle;
      this.description = this.product.description;
      this.price = this.product.price;
      this.stock = this.product.stock || 0;
      this.imageUrl = "/api/images/" + this.product?.images?.[0];
    }
  }
    navigateToProduct() {
    this.router.navigate(['/product', this.product?.id]);
  }
    addToCart() {
      if (!this.product || this.isAddingToCart) return;

      this.isAddingToCart = true;
      this.cartService.addItem(this.product.id.toString(), this.quantity).subscribe({
        next: (response) => {
          console.log('Erfolgreich zum Warenkorb hinzugefügt:', response);
          this.isAddingToCart = false;
          this.router.navigate(['/cart']);
        },
        error: (error) => {
          console.error('Fehler beim Hinzufügen zum Warenkorb:', error);
          this.isAddingToCart = false;
        }
      });
    }
}
