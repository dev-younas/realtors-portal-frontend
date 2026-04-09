import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-panel-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './panel-layout.html',
  styleUrls: ['./panel-layout.css']
})
export class PanelLayout implements OnInit {

  role = '';
  userEmail = '';
  profileRoute = '';
  menuItems: any[] = [];
  isCollapsed = false;

// =====================
// ADMIN MENU
// =====================
adminMenu = [
  {
    label: 'Dashboard',
    icon: 'bi-grid',
    route: '/admin/dashboard'
  },
  {
    label: 'Listings',
    icon: 'bi-house-door',
    children: [
      { label: 'All Listings', icon: 'bi-list-ul', route: '/admin/listings/listing-list' },
      { label: 'Categories', icon: 'bi-tags', route: '/admin/listings/categories' },
    ]
  },
  {
    label: 'Members',
    icon: 'bi-people',
    children: [
      { label: 'Packages', icon: 'bi-box-seam', route: '/admin/members/packages' },
      { label: 'All Users', icon: 'bi-person-lines-fill', route: '/admin/members/allUsers' },
    ]
  },
  {
    label: 'Reports',
    icon: 'bi-bar-chart',
    children: [
      { label: 'Statistics', icon: 'bi-graph-up', route: '/admin/reports/statistics' },
    ]
  },
  {
    label: 'Settings',
    icon: 'bi-gear',
    children: [
      { label: 'General', icon: 'bi-sliders', route: '/admin/settings/general' },
      { label: 'PayPal', icon: 'bi-paypal', route: '/admin/settings/paypal' },
      { label: 'Change Password', icon: 'bi-key', route: '/admin/settings/change-password' },
    ]
  },
];


// =====================
// AGENT MENU
// =====================
agentMenu = [
  {
    label: 'Dashboard',
    icon: 'bi-grid',
    route: '/agent/dashboard'
  },
  {
    label: 'My Listings',
    icon: 'bi-house',
    children: [
      { label: 'All Listings', route: '/agent/my-listings' },
      { label: 'Post New Ad', route: '/agent/listings/createListing' },
    ]
  },
  {
    label: 'Packages',
    icon: 'bi-box-seam',
    children: [
      { label: 'Available Plans', route: '/agent/packages/plans' },
      { label: 'My Package', route: '/agent/packages/my-package' },
    ]
  },
  {
    label: 'Profile',
    icon: 'bi-person',
    route: '/agent/profile'
  },
];


// =====================
// SELLER MENU
// =====================
sellerMenu = [
  {
    label: 'Dashboard',
    icon: 'bi-grid',
    route: '/seller/dashboard'
  },
  {
    label: 'My Listings',
    icon: 'bi-house',
    children: [
      { label: 'All Listings', route: '/seller/my-listings' },
      { label: 'Post New Ad', route: '/seller/my-listings/create' },
    ]
  },
  {
    label: 'Packages',
    icon: 'bi-box-seam',
    children: [
      { label: 'Available Plans', route: '/seller/packages/plans' },
      { label: 'My Package', route: '/seller/packages/my-package' },
    ]
  },
  {
    label: 'Profile',
    icon: 'bi-person',
    route: '/seller/profile'
  },
];

  constructor(private router: Router) { }

  ngOnInit() {
    this.role = localStorage.getItem('role') || '';
    this.userEmail = localStorage.getItem('userEmail') || 'User';

    if (this.role === 'Admin') {
      this.menuItems = this.adminMenu;
      this.profileRoute = '/admin/settings/general';
    } else if (this.role === 'Agent') {
      this.menuItems = this.agentMenu;
      this.profileRoute = '/agent/profile';
    } else if (this.role === 'PrivateSeller') {
      this.menuItems = this.sellerMenu;
      this.profileRoute = '/seller/profile';
    }
    if (!this.menuItems.length) {
      this.router.navigate(['/login']);
    }
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}