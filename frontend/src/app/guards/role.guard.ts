import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private router: Router) {}

canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
  const allowedRoles = (route.data['roles'] as string[]).map(r => r.toUpperCase());
  const token = localStorage.getItem('token');
  console.log('Token from localStorage:', token); 
  if (!token) {
    this.router.navigate(['/login']);
    return false;
  }

  let userRole: string | null = null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    userRole = payload.role || payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    if (userRole) userRole = userRole.toUpperCase();
  } catch (e) {
    this.router.navigate(['/login']);
    return false;
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    this.router.navigate(['/login']);
    return false;
  }

  return true;
}
}