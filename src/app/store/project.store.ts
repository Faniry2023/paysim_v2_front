import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { ApiHelper } from "../helpers/api-helper";
import { ProjectModel } from "../models/project-model";
import { inject } from "@angular/core";
import { ProjectService } from "../services/project/project.service";
import { ToastrService } from "ngx-toastr";
import { firstValueFrom } from "rxjs";

export interface ProjectState{
    project: ProjectModel | null;
    projects: ProjectModel[] | [];
    isError: boolean;
    error: string | null;
    loading: boolean;
    api: ApiHelper | null;
}

const initialState: ProjectState = {
    project: null,
    projects: [] as ProjectModel[],
    isError: false,
    error: null,
    loading: false,
    api: null
}

export const ProjectStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withMethods((store,
        service = inject(ProjectService),
        toastr = inject(ToastrService)
    ) => ({
        async NewProject(model: ProjectModel){
            patchState(store,{loading:true, isError: false, error: null,project:null});
            try{
                const project = await firstValueFrom(service.newProject(model));
                patchState(store,{loading:false,projects :[project,...(store.projects() ?? [])], project:project});
                toastr.info('Un nouvea projet créer', 'OK');
            }catch (err: any) {
                const msgError = err?.detail;
                patchState(store, { error: msgError, loading: false ,isError:true});
                toastr.error(msgError,'Erreur');
            }
        },

        async GetAllProject(){
            patchState(store,{loading:true, isError: false, error: null,});
            try{
                const projects = await firstValueFrom(service.getAllProject());
                patchState(store,{loading:false,projects:projects});
            }catch (err: any) {
                const msgError = err?.detail;
                patchState(store, { error: msgError, loading: false ,isError:true});
                toastr.error(msgError,'Erreur');
            }
        },

        async GetOneProject(id: string){
            patchState(store,{loading:true, isError: false, error: null,project:null});
            try{
                const project = await firstValueFrom(service.getOneProject(id));
                patchState(store,{loading:false,project:project})
            }catch (err: any) {
                const msgError = err?.detail;
                patchState(store, { error: msgError, loading: false ,isError:true});
                toastr.error(msgError,'Erreur');
            }
        },

        async GenerateApi(){
            patchState(store,{loading:true, isError: false, error: null,api:null});
            try{
                const api = await firstValueFrom(service.getApi());
                patchState(store,{loading:false,api:api});
            }catch (err: any) {
                const msgError = err?.detail;
                patchState(store, { error: msgError, loading: false ,isError:true});
                toastr.error(msgError,'Erreur');
            }
        },

        async UpdateProject(model: ProjectModel, old: ProjectModel){
            patchState(store,{loading:true, isError:false, error:null});
            try{
                const updateProject = await firstValueFrom(service.updateProject(model));
                patchState(store,{loading:false, projects :[updateProject,...store.projects().filter(v => v!==old)]});
                toastr.info('Mise à jours éfféctuer', 'Mise à jours OK');
            }catch (err: any) {
                const msgError = err?.detail;
                patchState(store, { error: msgError, loading: false ,isError:true});
                toastr.error(msgError,'Erreur');
            }
        }
    }))
)