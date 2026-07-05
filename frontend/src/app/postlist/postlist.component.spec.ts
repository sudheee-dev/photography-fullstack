import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostlistComponent } from './postlist.component';

describe('PostlistComponent', () => {
  let component: PostlistComponent;
  let fixture: ComponentFixture<PostlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostlistComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
