import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GratitudeList } from './gratitude-list';

describe('GratitudeList', () => {
  let component: GratitudeList;
  let fixture: ComponentFixture<GratitudeList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GratitudeList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GratitudeList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
