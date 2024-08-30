import { HttpEvent, HttpHandler, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";
import { Router } from "@angular/router";

export function accessInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
    const authService = inject(AuthService);
    const router = inject(Router);
    if (authService.accessToken == undefined) {
        router.navigateByUrl('login');
    }else{
        req = req.clone({
            setHeaders: {
                "Authorization": `Bearer ${authService.accessToken}`
            }
        });
    }
    return next(req);
}