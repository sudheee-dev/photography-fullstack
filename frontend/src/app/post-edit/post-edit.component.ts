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
  generatingDescription = signal(false);
  showAISuggestion = signal(false);
  aiSuggestion = signal('');

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

  // NEW METHOD: Generate AI description
  generateAIDescription() {
    this.generatingDescription.set(true);
    this.postService.generateAIDescription(this.postId).subscribe({
      next: (response: any) => {
        this.aiSuggestion.set(response.description);
        this.showAISuggestion.set(true);
        this.generatingDescription.set(false);
        this.snackBar.open('Description generated successfully! ✨', 'Close', { duration: 3000 });
      },
      error: (err) => {
        console.error(err);
        this.generatingDescription.set(false);
        this.snackBar.open(err?.error?.error || 'Failed to generate description', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  // NEW METHOD: Use AI suggestion
  useAISuggestion() {
    this.description.set(this.aiSuggestion());
    this.showAISuggestion.set(false);
    this.aiSuggestion.set('');
    this.snackBar.open('AI suggestion applied!', 'Close', { duration: 2000 });
  }

  // NEW METHOD: Dismiss AI suggestion
  dismissAISuggestion() {
    this.showAISuggestion.set(false);
    this.aiSuggestion.set('');
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
