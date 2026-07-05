import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Post } from '../services/post';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editprofile-component.html',
  styleUrl: './editprofile-component.css',
})
export class EditProfileComponent implements OnInit {
  username = signal('');
  first_name = signal('');
  last_name = signal('');
  bio = signal('');
  loading = signal(true);

  constructor(
    private postService: Post,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.router.navigate(['/auth']);
      return;
    }

    this.postService.getProfile(Number(userId)).subscribe({
      next: (data: any) => {
        this.username.set(data.username);
        this.first_name.set(data.first_name);
        this.last_name.set(data.last_name);
        this.bio.set(data.bio);
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
      .updateProfile({
        username: this.username(),
        first_name: this.first_name(),
        last_name: this.last_name(),
        bio: this.bio(),
      })
      .subscribe({
        next: () => {
          this.snackBar.open('Profile updated successfully ✅', 'Close', { duration: 3000 });
          this.router.navigate(['/postlist']);
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open(err?.error?.message || 'Failed to update profile', 'Close', {
            duration: 3000,
          });
        },
      });
  }
}
