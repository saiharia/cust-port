import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginService } from './login.service';
import { ContactComponent } from './contact/contact.component';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [CommonModule, FormsModule,ContactComponent]
})
export class LoginComponent{
  showContactPopup = false;
openContactPopup() {
this.showContactPopup = true;
}
  closeContactPopup() {
    this.showContactPopup = false;
  }
  customerId = '';
  password = '';
  showPassword: boolean = false;

  constructor(private router: Router, private loginService: LoginService) {}

  login() {
    // Placeholder validation
    
    this.loginService.login(this.customerId, this.password).subscribe({
      next: (res) => {
      console.log('Login response:', res);
      if (res.message === 'Login successful.') {
        localStorage.setItem('customerId', res.customerId);
        this.router.navigate(['/dashboard']);
      } else {
        alert(res.message); // Show the appropriate message and stay on login
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