import { Directive, Input, TemplateRef, ViewContainerRef, inject, OnInit } from '@angular/core';
import { UserService } from '../services/user';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private userService = inject(UserService);

  @Input() appHasPermission!: string;

  ngOnInit() {
    this.userService.currentUser$.subscribe(() => {
      this.updateView();
    });
  }

  private updateView() {
    if (this.userService.hasPermission(this.appHasPermission)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
