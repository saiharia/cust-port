import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginService } from './login.service';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class LoginComponent {
  customerId = '';
  password = '';
  showPassword: boolean = false;
  showAboutPopup = false;
  showContactPopup = false;

  constructor(private router: Router, private loginService: LoginService) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  openAboutPopup() {
    this.showAboutPopup = true;
    document.body.style.overflow = 'hidden';
  }

  closeAboutPopup() {
    this.showAboutPopup = false;
    document.body.style.overflow = 'auto';
  }

  openContactPopup() {
    this.showContactPopup = true;
    document.body.style.overflow = 'hidden';
  }

  closeContactPopup() {
    this.showContactPopup = false;
    document.body.style.overflow = 'auto';
  }

  login() {
    this.loginService.login(this.customerId, this.password).subscribe({
      next: (res) => {
        console.log('Login response:', res);
        if (res.message === 'Login successful.') {
          localStorage.setItem('customerId', res.customerId);
          this.router.navigate(['/dashboard']);
        } else {
          alert(res.message);
        }
      },
      error: (err) => {
        console.error('Login error:', err);
        alert(err.error?.error || 'Login failed');
      }
    });
  }

  resetPassword() {
    alert("Redirect to reset password page or modal.");
  }

  resetFields() {
    this.customerId = '';
    this.password = '';
  }
}