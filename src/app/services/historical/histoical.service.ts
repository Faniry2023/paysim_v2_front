import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { HistoricalHelper } from '../../helpers/historical-helper';
import { HistoricalSearchHelper } from '../../helpers/historical-search-helper';

@Injectable({
  providedIn: 'root',
})
export class HistoicalService {
  private httpClient = inject(HttpClient);
  // private baseUrl = "https://localhost:7110/";
  private baseUrl = "https://paysim.runasp.net/";

  getAllHistorical(page: number, step: number): Observable<HistoricalHelper>{
    return this.httpClient.
    get<HistoricalHelper>(this.baseUrl + 'get/historical/user/' + page + '/' + step,{
      withCredentials:true
    }).pipe(catchError(this.handleError))
  }

  searchHistorical(model: HistoricalSearchHelper):Observable<HistoricalHelper>{
    return this.httpClient.post<HistoricalHelper>(this.baseUrl + 'get/historical/user/seach',
      model, {withCredentials:true}
    ).pipe(catchError(this.handleError))
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
