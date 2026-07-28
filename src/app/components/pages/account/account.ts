import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UserModel } from '../../../models/user-model';
import { UserStore } from '../../../store/user.store';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-account',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './account.html',
  styleUrl: './account.css',
})
export class Account implements OnInit{
  userStore = inject(UserStore);
  fb = inject(FormBuilder);

  isEditingUser = signal<boolean>(false);
  isEditingConfidentiality = signal<boolean>(false);

  initials = computed(() => {
    const u = this.userStore.user();
    const a = u?.firstName?.charAt(0) ?? '';
    const b = u?.lastName?.charAt(0) ?? '';
    return (a + b).toUpperCase() || '??';
  });

  fullName = computed(() => {
    const u = this.userStore.user();
    return [u?.firstName, u?.lastName].filter(Boolean).join(' ') || 'Utilisateur';
  });

  // ── Formulaire infos personnelles (UserModel) ──
  userForm: FormGroup = this.fb.group({
    firstName: [null], // Nom
    lastName: [null],  // Prénom
    address: [null],
    birthday: [null]
  });

  // ── Formulaire confidentialité (ConfidentialityModel) ──
  confidentialityForm: FormGroup = this.fb.group({
    email: [null],
    password: [null], // toujours vide car le backend ne renvoie jamais le mot de passe
    passwordConf:[null]
  });

  async ngOnInit() {
    await this.userStore.Me();
    await this.userStore.getConfidentiality();

    this.userForm.patchValue({
      firstName: this.userStore.user()?.firstName,
      lastName: this.userStore.user()?.lastName,
      address: this.userStore.user()?.address,
      birthday: this.userStore.user()?.birthday
    });

    this.confidentialityForm.patchValue({
      email: this.userStore.confidentiality()?.email
    });
  }

  // ── Actions infos personnelles ──
  startEditUser() {
    this.isEditingUser.set(true);
  }

  cancelEditUser() {
    this.userForm.patchValue({
      firstName: this.userStore.user()?.firstName,
      lastName: this.userStore.user()?.lastName,
      address: this.userStore.user()?.address,
      birthday: this.userStore.user()?.birthday
    });
    this.isEditingUser.set(false);
  }

  async saveUser() {
    //tu appelles ici le store pour enregistrer le update (this.userForm.value)
    this.isEditingUser.set(false);
  }

  // ── Actions confidentialité ──
  startEditConfidentiality() {
    this.isEditingConfidentiality.set(true);
  }

  cancelEditConfidentiality() {
    this.confidentialityForm.reset({
      email: this.userStore.confidentiality()?.email,
      password: null
    });
    this.isEditingConfidentiality.set(false);
  }

  async saveConfidentiality() {
    //tu appelles ici le store pour enregistrer le update (this.confidentialityForm.value)
    this.isEditingConfidentiality.set(false);
  }
}
