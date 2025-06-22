import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeView1 } from './home-view-1';

describe('HomeView1', () => {
  let component: HomeView1;
  let fixture: ComponentFixture<HomeView1>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeView1]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeView1);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
