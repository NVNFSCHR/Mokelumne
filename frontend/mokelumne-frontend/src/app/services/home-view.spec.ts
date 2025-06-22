import { TestBed } from '@angular/core/testing';

import { HomeView } from './home-view';

describe('Data', () => {
  let service: HomeView;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HomeView);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
