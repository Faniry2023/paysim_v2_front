import { inject, Injectable, signal } from '@angular/core';
import { UserModel } from '../../models/user-model';
import { ConfidentialityModel } from '../../models/confidentiality-model';
import { catchError, Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CompletUserHelper } from '../../helpers/complet-user-helper';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private httpClient = inject(HttpClient);
  // private baseUrl = "https://localhost:7110/";
  private baseUrl = "https://we-explore-mada.runasp.net/";

  signup(model: ConfidentialityModel):Observable<UserModel>{
    console.log('arrive login service')
    return this.httpClient.post<UserModel>(this.baseUrl + 'user/signup', model,{withCredentials:true})
    .pipe(
      catchError(this.handleError)
    );
  }

  signin(model: CompletUserHelper):Observable<boolean>{
    return this.httpClient.post<boolean>(this.baseUrl + 'user/signin',model)
    .pipe(
      catchError(this.handleError)
    );
  }

  logout():Observable<void>{
    return this.httpClient.post<void>(this.baseUrl + 'logout',{},{withCredentials:true})
    .pipe(catchError(this.handleError));
  }

  getUser():Observable<UserModel | null >{
    return this.httpClient.get<UserModel>(this.baseUrl + 'user/me',{withCredentials:true})
    .pipe(
      catchError(this.handleError)
    )
  }


  private handleError(error: HttpErrorResponse) {
    if (error.error?.title && error.error?.detail) {
      // Erreur ProblemDetails (provenant de .NET 8)
      return throwError(() => ({
        status: error.status,
        title: error.error.title,
        detail: error.error.detail
      }));
    }
    // Erreur générique
    return throwError(() => ({
      status: error.status,
      title: "Erreur inconnue",
      detail: "Une erreur inattendue est survenue."
    }));
  }
}
