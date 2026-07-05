import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Post {
  private baseUrl = 'http://localhost:3000/api/posts';

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getPosts() {
    return this.http.get(this.baseUrl, {
      headers: this.authHeaders(),
    });
  }

  getMyPosts() {
    return this.http.get(`${this.baseUrl}/mine`, { headers: this.authHeaders() });
  }

  getPostById(id: number) {
    return this.http.get(`${this.baseUrl}/${id}`, { headers: this.authHeaders() });
  }

  updatePost(id: number, data: { description: string; location: string }) {
    return this.http.put(`${this.baseUrl}/${id}`, data, { headers: this.authHeaders() });
  }

  deletePost(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`, { headers: this.authHeaders() });
  }

  reactPost(postId: number, reactionType: string) {
    return this.http.post(
      `${this.baseUrl}/${postId}/react`,
      { reaction_type: reactionType },
      { headers: this.authHeaders() },
    );
  }
  follow(userId: number) {
    return this.http.post(
      `${this.baseUrl}/${userId}/follow`,
      {},

      { headers: this.authHeaders() },
    );
  }

  unfollow(userId: number) {
    return this.http.delete(`${this.baseUrl}/${userId}/follow`, {
      headers: this.authHeaders(),
    });
  }

  getProfile(userId: number) {
    return this.http.get(`${this.baseUrl}/${userId}/profile`, { headers: this.authHeaders() });
  }

  updateProfile(data: { username: string; first_name: string; last_name: string; bio: string }) {
    return this.http.put(`${this.baseUrl}/me/profile`, data, { headers: this.authHeaders() });
  }

  getFollowers() {
    return this.http.get<any[]>(`${this.baseUrl}/followers`, { headers: this.authHeaders() });
  }

  getFollowing() {
    return this.http.get<any[]>(`${this.baseUrl}/following`, { headers: this.authHeaders() });
  }
}
