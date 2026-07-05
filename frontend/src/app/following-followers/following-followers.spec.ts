import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowingFollowers } from './following-followers';

describe('FollowingFollowers', () => {
  let component: FollowingFollowers;
  let fixture: ComponentFixture<FollowingFollowers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FollowingFollowers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FollowingFollowers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
