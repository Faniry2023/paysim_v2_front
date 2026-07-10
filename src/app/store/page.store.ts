import { patchState, signalStore, withMethods, withState } from "@ngrx/signals"

export interface PageState{
    page:'Home' | 'Sim' | 'Developer' | 'Project' | 'app_mobile' | 'historical'
}

const initialState: PageState = {
    page: "Home"
}

export const PageStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withMethods((store,
        //methode
    ) =>({
        async setPageState(page: 'Home' | 'Sim' | 'Developer' | 'Project' | 'app_mobile' | 'historical'){
            patchState(store,{page:page});
            localStorage.setItem('page',page);
        }
    }))
)