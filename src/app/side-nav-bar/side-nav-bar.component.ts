import { CommonModule } from '@angular/common';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AboutComponent } from '../about/about.component';

@Component({
  selector: 'app-side-nav-bar',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './side-nav-bar.component.html',
  styleUrl: './side-nav-bar.component.scss'
})
export class SideNavBarComponent implements OnInit{

  constructor(private router: Router, private renderer: Renderer2) {
  }
  ngOnInit(): void {
    this.loadChatbotScript();
  }
isSidebarOpen = true;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout() {
    // Replace this with actual logout logic
    localStorage.clear();
    this.router.navigate(['/login']);
  }
  loadChatbotScript(): void {
    const script = this.renderer.createElement('script');
    script.src = 'https://cdn.jotfor.ms/agent/embedjs/0196f60ff58e78b08d574de940c8088fd862/embed.js?skipWelcome=1&maximizable=1';
    script.async = true;
    script.defer = true;

    const container = document.getElementById('chatbot-container');
    if (container) {
      container.appendChild(script);
    }
  }
  isFinanceOpen = false;
  toggleFinanceDropdown() {
    this.isFinanceOpen = !this.isFinanceOpen;
  }

  isFinanceRouteActive(): boolean {
    const url = this.router.url;
    return url.includes('/invoice') || url.includes('/payage') || url.includes('/credit');
  }
  


}
