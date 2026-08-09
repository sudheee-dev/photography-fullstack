import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Post } from '../services/post'; // ← ADD THIS IMPORT
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
  description = '';
  location = '';
  selectedFile!: File;

  // 🤖 AI DESCRIPTION STATES
  previewImageUrl: string | null = null;
  aiSuggestion: string = '';
  showAISuggestion: boolean = false;
  generatingDescription: boolean = false;
  uploadInProgress: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private postService: Post, // ← This needs to be imported above
  ) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];

    if (this.selectedFile) {
      // Show image preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImageUrl = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);

      // AUTO-GENERATE AI DESCRIPTION
      this.generateAIDescription();
    }
  }

  // 🤖 GENERATE AI DESCRIPTION - FIXED VERSION
  generateAIDescription() {
    if (!this.selectedFile) {
      alert('Please select an image first');
      return;
    }

    this.generatingDescription = true;
    this.aiSuggestion = '';
    this.showAISuggestion = false;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const base64Image = e.target.result; // ← Create base64Image

      // Call service with the base64Image
      this.postService.generateAIDescriptionFromUrl(base64Image).subscribe({
        next: (response: any) => {
          console.log('✅ AI description generated:', response.description);
          this.aiSuggestion = response.description;
          this.showAISuggestion = true;
          this.generatingDescription = false;
        },
        error: (err) => {
          console.error('❌ Error generating description:', err);
          this.generatingDescription = false;
        },
      });
    };

    reader.readAsDataURL(this.selectedFile);
  }

  // ✅ USE AI SUGGESTION
  useAISuggestion() {
    this.description = this.aiSuggestion;
    this.showAISuggestion = false;
  }

  // ❌ DISMISS AI SUGGESTION
  dismissAISuggestion() {
    this.showAISuggestion = false;
    this.aiSuggestion = '';
  }

  // 📤 UPLOAD POST
  uploadPost() {
    if (!this.selectedFile) {
      alert('Please select an image');
      return;
    }

    this.uploadInProgress = true;

    const formData = new FormData();
    formData.append('image', this.selectedFile);
    formData.append('description', this.description);
    formData.append('location', this.location);

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http.post(`${environment.apiUrl}/posts`, formData, { headers }).subscribe({
      next: (res: any) => {
        console.log('✅ Post uploaded successfully:', res);
        alert('Post uploaded successfully! 🎉');

        // Reset form
        this.description = '';
        this.location = '';
        this.selectedFile = null as any;
        this.previewImageUrl = null;
        this.aiSuggestion = '';
        this.showAISuggestion = false;
        this.uploadInProgress = false;

        this.router.navigate(['/postlist']);
      },
      error: (err) => {
        console.error('❌ Upload error:', err);
        alert('Failed to upload post: ' + (err.error?.message || err.message));
        this.uploadInProgress = false;
      },
    });
  }
}
