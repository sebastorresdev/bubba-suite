import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './not-found.html'
})
export class NotFound {
  private router = inject(Router);
  private location = inject(Location);

  goToHome() {
    // Redirects to the home page
    this.router.navigate(['/home']);
  }

  goBack() {
    // Returns to the previous page in the browser history
    this.location.back();
  }
}
