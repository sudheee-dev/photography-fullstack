import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

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
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }
  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
  ) {}

  uploadPost() {
    const formData = new FormData();

    formData.append('image', this.selectedFile);
    formData.append('description', this.description);
    formData.append('location', this.location);

    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http.post('http://localhost:3000/api/posts', formData, { headers }).subscribe({
      next: (res) => {
        console.log(res);
        alert('Post uploaded successfully');
        this.router.navigate(['/postlist']);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}
