import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';
import { Post } from '../services/post';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-postlist',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './postlist.component.html',
  styleUrls: ['./postlist.component.css'],
})
export class PostlistComponent implements OnInit {
  isAdminUser = false;
  posts = signal<any[]>([]); // 👈 was: posts: any[] = []

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
    }

    this.loadPosts();
  }

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private postService: Post,
  ) {}

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('role');
    }
    this.router.navigate(['/auth']);
  }

  loadPosts() {
    this.postService.getPosts().subscribe({
      next: (data: any) => {
        this.posts.set([...data]); // 👈 was: this.posts = [...data]
      },
    });
  }

  react(postId: number, reactionType: string) {
    this.postService.reactPost(postId, reactionType).subscribe({
      next: () => {
        this.loadPosts();
      },
    });
  }

  follow(userId: number) {
    this.postService.follow(userId).subscribe({
      next: (res: any) => {
        console.log(res);

        alert(res.message);

        this.loadPosts();
      },
      error: (err) => {
        console.log(err);

        alert(err.error.message);
      },
    });
  }

  toggleFollow(post: any) {
    if (post.is_following) {
      this.postService.unfollow(post.user_id).subscribe({
        next: () => {
          this.loadPosts();
        },
        error: (err) => {
          alert(err.error.message);
        },
      });
    } else {
      this.postService.follow(post.user_id).subscribe({
        next: () => {
          this.loadPosts();
        },
        error: (err) => {
          alert(err.error.message);
        },
      });
    }
  }
}
