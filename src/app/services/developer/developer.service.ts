import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { DeveloperModel } from '../../models/developer-model';
import { catchError, Observable, throwError } from 'rxjs';
import { ApiHelper } from '../../helpers/api-helper';

@Injectable({
  providedIn: 'root',
})
export class DeveloperService {
  private httpClient = inject(HttpClient);
  //  private baseUrl = "https://localhost:7110/";
  private baseUrl = "https://paysim.runasp.net/";

  newDeveloper(model: DeveloperModel):Observable<DeveloperModel>{
    console.log(model);
    return this.httpClient.post<DeveloperModel>(this.baseUrl + 'developer/new',model,{withCredentials:true})
    .pipe(catchError(this.handleError))
  }

  updateDeveloper(model: DeveloperModel):Observable<DeveloperModel>{
    return this.httpClient.put<DeveloperModel>(this.baseUrl + 'developer/update', model, {withCredentials:true})
    .pipe(catchError(this.handleError))
  }

  getDeveloper():Observable<DeveloperModel>{
    return this.httpClient.get<DeveloperModel>(this.baseUrl + 'developer/get',{withCredentials:true})
    .pipe(catchError(this.handleError))
  }

  
  // getDeveloper():Observable<DeveloperModel>{
  //   return this.httpClient.get<DeveloperModel>(this.baseUrl + '')
  // }



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
