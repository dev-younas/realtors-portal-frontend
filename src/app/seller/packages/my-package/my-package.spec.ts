import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPackage } from './my-package';

describe('MyPackage', () => {
  let component: MyPackage;
  let fixture: ComponentFixture<MyPackage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyPackage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyPackage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
