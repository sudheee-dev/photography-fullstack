import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Post } from '../services/post';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-post-component',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './post-component.html',
  styleUrl: './post-component.css',
})
export class PostComponent {
  description = signal('');
  location = signal('');

  previewImageUrl = signal<string | null>(null);
  aiSuggestion = signal('');
  showAISuggestion = signal(false);
  generatingDescription = signal(false);
  uploadInProgress = signal(false);

  selectedFile: File | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private postService: Post,
  ) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];

    if (this.selectedFile) {
      // Show image preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImageUrl.set(e.target.result);
      };
      reader.readAsDataURL(this.selectedFile);

      //  ADD 1-SECOND DELAY - ensures Cloudinary upload completes
      setTimeout(() => {
        this.generateAIDescription();
      }, 1000);
    }
  }

  // GENERATE AI DESCRIPTION
  generateAIDescription() {
    if (!this.selectedFile) {
      alert('Please select an image first');
      return;
    }

    this.generatingDescription.set(true);
    this.aiSuggestion.set('Analyzing your photo...');
    this.showAISuggestion.set(true);

    const formData = new FormData();
    formData.append('image', this.selectedFile);

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    console.log('Sending image for analysis...');

    this.http
      .post(`${environment.apiUrl}/posts/generate-description-from-file`, formData, { headers })
      .subscribe({
        next: (response: any) => {
          console.log('AI description generated:', response.description);
          this.aiSuggestion.set(response.description);
          this.generatingDescription.set(false);
        },
        error: (err) => {
          console.error(' Error generating description:', err);
          this.aiSuggestion.set('Failed to generate. Write your own.');
          this.generatingDescription.set(false);
        },
      });
  }

  //  USE AI SUGGESTION
  useAISuggestion() {
    this.description.set(this.aiSuggestion());
    this.showAISuggestion.set(false);
  }

  //  DISMISS AI SUGGESTION
  dismissAISuggestion() {
    this.showAISuggestion.set(false);
    this.aiSuggestion.set('');
  }

  uploadPost() {
    if (!this.selectedFile) {
      alert('Please select an image');
      return;
    }

    this.uploadInProgress.set(true);

    const formData = new FormData();
    formData.append('image', this.selectedFile);
    formData.append('description', this.description());
    formData.append('location', this.location());

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http.post(`${environment.apiUrl}/posts`, formData, { headers }).subscribe({
      next: (res: any) => {
        console.log(' Post uploaded successfully:', res);
        alert('Post uploaded successfully! ');

        this.description.set('');
        this.location.set('');
        this.selectedFile = null;
        this.previewImageUrl.set(null);
        this.aiSuggestion.set('');
        this.showAISuggestion.set(false);
        this.uploadInProgress.set(false);

        this.router.navigate(['/postlist']);
      },
      error: (err) => {
        console.error('Upload error:', err);
        alert('Failed to upload post: ' + (err.error?.message || err.message));
        this.uploadInProgress.set(false);
      },
    });
  }
}
