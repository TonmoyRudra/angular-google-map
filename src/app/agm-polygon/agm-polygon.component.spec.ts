import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgmPolygonComponent } from './agm-polygon.component';

describe('AgmPolygonComponent', () => {
  let component: AgmPolygonComponent;
  let fixture: ComponentFixture<AgmPolygonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgmPolygonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgmPolygonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
