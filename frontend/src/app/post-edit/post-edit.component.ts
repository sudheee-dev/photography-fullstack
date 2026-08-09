import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Post } from '../services/post';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-post-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-edit.component.html',
  styleUrl: './post-edit.component.css',
})
export class PostEditComponent implements OnInit {
  postId!: number;
  description = signal('');
  location = signal('');
  imageUrl = signal('');
  loading = signal(true);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: Post,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.postId = Number(this.route.snapshot.paramMap.get('id'));

    this.postService.getPostById(this.postId).subscribe({
      next: (data: any) => {
        this.description.set(data.description);
        this.location.set(data.location);
        this.imageUrl.set(data.image_url);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
      },
    });
  }

  save() {
    this.postService
      .updatePost(this.postId, { description: this.description(), location: this.location() })
      .subscribe({
        next: () => {
          this.snackBar.open('Post updated successfully ✅', 'Close', { duration: 3000 });
          this.router.navigate(['/post-edit']);
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open(err?.error?.message || 'Failed to update post', 'Close', {
            duration: 3000,
          });
        },
      });
  }
  cancel() {
    this.router.navigate(['/post-edit']);
  }
}
