import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

// Visitor Components
import { Layout } from './Visitor/layout/layout';
import { Home } from './Visitor/home/home';
import { Properties } from './Visitor/properties/properties';
import { About } from './Visitor/about/about';
import { Agents } from './Visitor/agents/agents';
import { Contact } from './Visitor/contact/contact';
import { Login } from './Visitor/login/login';
import { Signup } from './Visitor/signup/signup';

// Admin Components
import { Dashboard as AdminDashboard } from './admin/dashboard/dashboard';
import { ListingList } from './admin/listings/listing-list/listing-list';
import { ListingDetail } from './admin/listings/listing-detail/listing-detail';
import { Categories } from './admin/listings/categories/categories';
import { Packages } from './admin/members/packages/packages';
import { Transactions } from './admin/reports/transactions/transactions';
import { SettingsGeneralComponent } from './admin/settings/general/general';
import { SettingsPaypalComponent } from './admin/settings/paypal/paypal';

// Agent Components
import { AgentDashboard as AgentDashboard } from './agent/dashboard/dashboard';
import { AgentProfile as AgentProfile } from './agent/profile/profile';
import { AgentListingList as AgentListingList } from './agent/my-listings/listing-list';
import { AgentPackagesPlans as AgentPlans } from './agent/packages/packages-plans';
import { AgentMyPackage as AgentMyPackage } from './agent/packages/my-package';



// Seller Components
import { SellerDashboard as SellerDashboard } from './seller/dashboard/dashboard';
import { SellerProfile as SellerProfile } from './seller/profile/profile';
import { ListingList as SellerListingList } from './seller/my-listings/listing-list/listing-list';
import { ListingCreate as SellerListingCreate } from './seller/my-listings/listing-create/listing-create';
// import { ListingEdit as SellerListingEdit } from './seller/my-listings/listing-edit/listing-edit';
import { SellerPlans   as SellerPlans } from './seller/packages/plans/plans';
import { MyPackage as SellerMyPackage } from './seller/packages/my-package/my-package';
import { PanelLayout } from './shared/panel-layout/panel-layout';
import { Statistics } from './admin/reports/statistics/statistics';
import { AgentCreateListing } from './agent/my-listings/create-listing';

export const routes: Routes = [

  // ==================== VISITOR ====================
  {
    path: '',
    component: Layout,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home',       component: Home },
      { path: 'properties', component: Properties },
      { path: 'about',      component: About },
      { path: 'agents',     component: Agents },
      { path: 'contact',    component: Contact },
      { path: 'login',      component: Login },
      { path: 'signup',     component: Signup },
    ]
  },

  // ==================== ADMIN ====================
  {
    path: 'admin',
    canActivate: [authGuard('Admin')],
    component: PanelLayout,
    children: [
      { path: '',                       redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',              component: AdminDashboard },
      { path: 'listings/listing-list',          component: ListingList },
      { path: 'listings/detail/:id',    component: ListingDetail },
      { path: 'listings/categories',    component: Categories },
      { path: 'members/packages',       component: Packages },
      { path: 'reports/transactions',   component: Transactions },
      { path: 'reports/statistics' , component: Statistics},
      { path: 'settings/general',       component: SettingsGeneralComponent },
      { path: 'settings/paypal',        component: SettingsPaypalComponent },
      // { path: 'settings/change-password', component: ChangePassword },
    ]
  },

  // ==================== AGENT ====================
  {
    path: 'agent',
    canActivate: [authGuard('Agent')],
    component: PanelLayout,
    children: [
      { path: '',                     redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',            component: AgentDashboard },
      { path: 'profile',              component: AgentProfile },
      { path: 'my-listings',          component: AgentListingList },
      { path: 'listings/createListing',          component: AgentCreateListing },
      { path: 'packages/plans',       component: AgentPlans },
      { path: 'packages/my-package',  component: AgentMyPackage },
    ]
  },

  // ==================== SELLER ====================
  {
    path: 'seller',
    canActivate: [authGuard('PrivateSeller')],
    component: PanelLayout,
    children: [
      { path: '',                     redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',            component: SellerDashboard },
      { path: 'profile',              component: SellerProfile },
      { path: 'my-listings',          component: SellerListingList },
      { path: 'my-listings/create',   component: SellerListingCreate },
      // { path: 'my-listings/edit/:id', component: SellerListingEdit },
      { path: 'packages/plans',       component: SellerPlans },
      { path: 'packages/my-package',  component: SellerMyPackage },
    ]
  },

  { path: '**', redirectTo: '' }
];