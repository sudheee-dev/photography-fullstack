import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Post } from '../services/post';
import { AuthService } from '../auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-post-edit-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './post-edit-list.component.html',
  styleUrl: './post-edit-list.component.css',
})
export class PostEditListComponent implements OnInit {
  posts = signal<any[]>([]);
  isAdmin = false;

  constructor(
    private postService: Post,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadPosts();
  }

  loadPosts() {
    const request = this.isAdmin ? this.postService.getPosts() : this.postService.getMyPosts();

    request.subscribe({
      next: (data: any) => {
        this.posts.set([...data]);
      },
    });
  }

  editPost(postId: number) {
    this.router.navigate(['/edit-post', postId]);
  }

  deletePost(postId: number) {
    if (!confirm('Delete this post? This cannot be undone.')) {
      return;
    }
    this.postService.deletePost(postId).subscribe({
      next: () => {
        this.snackBar.open('Post deleted successfully ✅', 'Close', { duration: 3000 });
        this.loadPosts();
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Failed to delete post', 'Close', { duration: 3000 });
      },
    });
  }
}
