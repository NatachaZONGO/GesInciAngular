import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "./auth.service";

export const authGuard: CanActivateFn = (
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) => {
        const authService = inject(AuthService);
        const router = inject(Router);
        if(authService.accessToken == undefined){
            router.navigateByUrl('login');
        }
        return true;
}