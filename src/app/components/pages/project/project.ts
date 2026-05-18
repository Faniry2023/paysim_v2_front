import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ProjectStore } from '../../../store/project.store';
import { DeveloperStore } from '../../../store/developer.store';
import { DeveloperModel } from '../../../models/developer-model';
import { ProjectModel } from '../../../models/project-model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-project',
  imports: [ReactiveFormsModule,MatFormFieldModule,MatInputModule,MatButtonModule,MatProgressSpinnerModule],
  templateUrl: './project.html',
  styleUrl: './project.css',
})
export class Project implements OnInit{
  async ngOnInit() {
    await this.developerStore.GetDeveloer();
    if(this.developerStore.developer() !== null){
      await this.store.GetAllProject();
    }
    this.apiKey.set(undefined)
  }
  isUpdate = signal(false);
  apiKey = signal<string | undefined>(undefined);
  store = inject(ProjectStore);
  showApi = signal(false);
  developerSelect = signal<DeveloperModel | null>(null);
  developerStore = inject(DeveloperStore)
  projectSelect = signal<ProjectModel | null>(null);
  private formBuilder = inject(FormBuilder);


  projectFormGroup = this.formBuilder.group({
    proj_name:['',[Validators.required]],
    link:['https://',[Validators.required]],
    api:[{value:'',disabled:true},Validators.required]
  })

  select(item: ProjectModel){
    this.projectSelect.set(item);
  }

  async save(){
    if(this.projectFormGroup.valid){
      const newProject: ProjectModel ={
        id: this.isUpdate() ? this.projectSelect()?.id! : '',
        idDeveloper: this.developerSelect()?.id!,
        projectName: this.projectFormGroup.value.proj_name!,
        link: this.projectFormGroup.value.link!,
        apiKey: (this.apiKey() !== undefined) ? this.apiKey()! : 'N/A',
      }
      if(this.isUpdate()){
        await this.store.UpdateProject(newProject,this.projectSelect()!);
        this.isUpdate.set(false)
      }else{
        await this.store.NewProject(newProject);  
      }
      this.projectFormGroup.reset();
      this.apiKey.set(undefined);
    }
  }

  update(){
    this.isUpdate.set(true);
    this.projectFormGroup.get('proj_name')?.setValue(this.projectSelect()?.projectName!);
    this.projectFormGroup.get('link')?.setValue(this.projectSelect()?.link!); 
  }


  async getNewAPi(){
    await this.store.GenerateApi();
    if(!this.store.isError()){
      this.apiKey.set(this.store.api()?.api)
    }
  }

}
