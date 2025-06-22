import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeView2 } from './home-view-2';

describe('HomeView2', () => {
  let component: HomeView2;
  let fixture: ComponentFixture<HomeView2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeView2]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeView2);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
