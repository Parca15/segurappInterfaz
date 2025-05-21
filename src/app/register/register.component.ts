import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms'; // <-- Agrega esta línea


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ToastModule,
    FormsModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  providers: [MessageService]
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  cities = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Armenia'];
  showVerification = false;
  verificationCode = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      correo: ['', [Validators.required, Validators.email]],
      ciudad: ['', Validators.required],
      direccion: ['', Validators.required],
      tipoUsuario: ['Ciudadano', Validators.required]
    }, { validator: this.checkPasswords });
  }

  checkPasswords(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { notSame: true };
  }

  onSubmit() {
  if (this.registerForm.valid && !this.loading) {
    this.loading = true;
    const formData = this.registerForm.value;

    // Estructura de datos exacta que espera la API
    const apiData = {
      nombre: formData.nombre,
      nombreUsuario: formData.username,  // Campo renombrado
      contrasena: formData.password,     // Campo renombrado
      telefono: formData.telefono,
      correo: formData.correo,
      ciudad: formData.ciudad,
      direccion: formData.direccion,
      tipoUsuario: formData.tipoUsuario,
      estado: 'Pendiente'
    };

    this.apiService.registerUser(apiData).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Registro exitoso',
          detail: 'Se ha enviado un código de verificación a tu correo'
        });
        this.showVerification = true;
      },
      error: (err) => {
        console.error('Error completo:', err);
        let errorMessage = 'Ocurrió un error al registrar';
        
        if (err.error && err.error.message) {
          errorMessage = err.error.message;
        } else if (err.status === 400) {
          errorMessage = 'Datos de registro inválidos';
        } else if (err.status === 409) {
          errorMessage = 'El correo o nombre de usuario ya está registrado';
        } else if (err.status === 0) {
          errorMessage = 'No se pudo conectar al servidor';
        }
        
        this.messageService.add({
          severity: 'error',
          summary: 'Error en registro',
          detail: errorMessage
        });
        this.loading = false;
      }
    });
  }
}

  verifyAccount() {
    if (!this.verificationCode) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor ingresa el código de verificación'
      });
      return;
    }

    const email = this.registerForm.get('correo')?.value;
    
    this.apiService.verifyUserCode(email, this.verificationCode).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Verificación exitosa',
          detail: 'Tu cuenta ha sido verificada correctamente'
        });
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err) => {
        let errorMessage = 'Error al verificar el código';
        if (err.error && err.error.message) {
          errorMessage = err.error.message;
        } else if (err.status === 400) {
          errorMessage = 'Código inválido o expirado';
        } else if (err.status === 404) {
          errorMessage = 'Usuario no encontrado';
        }
        
        this.messageService.add({
          severity: 'error',
          summary: 'Error en verificación',
          detail: errorMessage
        });
      }
    });
  }
}