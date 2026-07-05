import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { roleGuard } from './role.guard';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App {
  logout() {}
}
