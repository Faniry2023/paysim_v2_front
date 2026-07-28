import { patchState, signalStore, withMethods, withState } from "@ngrx/signals"

export interface PageState{
    page:'Account' | 'Sim' | 'Developer' | 'Project' | 'app_mobile' | 'historical'|'doc'|'historical-sms'
}

const initialState: PageState = {
    page: "Account"
}

export const PageStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withMethods((store,
        //methode
    ) =>({
        async setPageState(page: 'Account' | 'Sim' | 'Developer' | 'Project' | 'app_mobile' | 'historical' | 'doc' | 'historical-sms'){
            patchState(store,{page:page});
            localStorage.setItem('page',page);
        }
    }))
)