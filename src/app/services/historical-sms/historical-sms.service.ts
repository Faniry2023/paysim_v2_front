import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { HistoricalSmsHelper } from '../../helpers/historical-sms-helper';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HistoricalSmsSearchHelper } from '../../helpers/historical-sms-search-helper';

@Injectable({
  providedIn: 'root',
})
export class HistoricalSmsService {
  private httpClient = inject(HttpClient);
  private baseUrl = "https://localhost:7110/";
  // private baseUrl = "https://paysim.runasp.net/";

  getAllHistorical(page: number, step: number): Observable<HistoricalSmsHelper>{
    return this.httpClient.
    get<HistoricalSmsHelper>(this.baseUrl + 'get/historical/dev/' + page + '/' + step,{
      withCredentials:true
    }).pipe(catchError(this.handleError))
  }

  searchHistorical(model: HistoricalSmsSearchHelper):Observable<HistoricalSmsHelper>{
    return this.httpClient.post<HistoricalSmsHelper>(this.baseUrl + 'get/historical/dev/seach',
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
