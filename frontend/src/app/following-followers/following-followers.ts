import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Post } from '../services/post';

@Component({
  selector: 'app-following-followers',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './following-followers.html',
  styleUrl: './following-followers.css',
})
export class FollowingFollowers implements OnInit {
  users = signal<any[]>([]);
  title = signal('');

  constructor(
    private route: ActivatedRoute,
    private postService: Post,
    private router: Router,
  ) {
    console.log('Component instance:', this);
  }

  ngOnInit() {
    const type = this.route.snapshot.paramMap.get('type');

    if (type === 'followers') {
      this.title.set('Followers');

      this.postService.getFollowers().subscribe((res: any[]) => {
        this.users.set(res);
        this.title.set('Followers (' + res.length + ')');

        console.log('Users:', this.users());
      });
    } else {
      this.title.set('Following');

      this.postService.getFollowing().subscribe((res: any[]) => {
        this.users.set(res);
        this.title.set('Following (' + res.length + ')');

        console.log('Users:', this.users());
      });
    }
  }

  Backto_Feed() {
    this.router.navigate(['/postlist']);
  }
}
