import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { ProjectModel } from '../../models/project-model';
import { ApiHelper } from '../../helpers/api-helper';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private httpClient = inject(HttpClient);
  // private baseUrl = "https://localhost:7110/";
  private baseUrl = "https://we-explore-mada.runasp.net/";

  getAllProject():Observable<ProjectModel[]>{
    return this.httpClient.get<ProjectModel[]>(this.baseUrl + 'project/getall',{withCredentials:true})
    .pipe(catchError(this.handleError))
  }

  newProject(model: ProjectModel):Observable<ProjectModel>{
    return this.httpClient.post<ProjectModel>(this.baseUrl + 'projet/new',model,{withCredentials:true})
    .pipe(catchError(this.handleError))
  }

  getOneProject(id: string):Observable<ProjectModel>{
    return this.httpClient.get<ProjectModel>(this.baseUrl + 'project/getone/' + id,{withCredentials:true})
    .pipe(catchError(this.handleError))
  }
  getApi():Observable<ApiHelper>{
    return this.httpClient.get<ApiHelper>(this.baseUrl + 'generate/apikey',{withCredentials:true})
    .pipe(catchError(this.handleError))
  }

  updateProject(model: ProjectModel):Observable<ProjectModel>{
    return this.httpClient.put<ProjectModel>(this.baseUrl + 'project/update', model,{withCredentials:true})
    .pipe(catchError(this.handleError))
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
