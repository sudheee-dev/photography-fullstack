import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { PostlistComponent } from './postlist/postlist.component';
import { PostEditComponent } from './post-edit/post-edit.component';
import { PostEditListComponent } from './post-edit-list/post-edit-list.component';
import { EditProfileComponent } from './editprofile/editprofile-component';
import { PostComponent } from './post/post-component';
import { FollowingFollowers } from './following-followers/following-followers';

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'auth', component: AuthComponent },
  { path: 'postlist', component: PostlistComponent },

  { path: 'post-edit', component: PostEditListComponent },
  { path: 'edit-post/:id', component: PostEditComponent },
  { path: 'editprofile', component: EditProfileComponent },
  {
    path: 'following-followers/:type',
    component: FollowingFollowers,
  },

  { path: 'post', component: PostComponent },
];
