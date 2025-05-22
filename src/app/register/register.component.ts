import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router'; // RouterLink para enlaces
import { CommonModule } from '@angular/common'; // Para directivas como *ngIf
import { ApiService, RegistrationData, RegistrationResponse } from '../services/api.service'; // Importa las interfaces

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // Necesario para FormGroup
    RouterLink // Si tienes enlaces como <a routerLink="/login">...</a>
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup; // "!" para asignación definitiva
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Para la verificación de código
  showVerificationPrompt: boolean = false;
  verificationForm!: FormGroup;
  emailForVerification: string = ''; // Guardaremos el email aquí para la verificación
  verificationErrorMessage: string = '';
  verificationSuccessMessage: string = '';


  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      username: ['', Validators.required], // Este es 'nombreUsuario' para la API
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]+$')]], // Solo números
      correo: ['', [Validators.required, Validators.email]],
      ciudad: ['', Validators.required],
      direccion: ['', Validators.required],
      // Asumo que el usuario que se registra siempre será de tipo 'Usuario'
      // y el estado inicial será 'Pendiente'.
      // Si el usuario puede elegir su tipo, necesitarás un campo en el form.
    }, { validator: this.passwordMatchValidator });

    this.verificationForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]] // Asumiendo código de 6 dígitos
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.errorMessage = 'Por favor, completa todos los campos correctamente y asegúrate que las contraseñas coincidan.';
      // Marcar todos los campos como "touched" para mostrar errores de validación si es necesario
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = this.registerForm.value;

    // Prepara los datos según la interfaz RegistrationData
    const apiData: RegistrationData = {
      nombre: formData.nombre,
      nombreUsuario: formData.username, // Mapea 'username' del form a 'nombreUsuario' para la API
      contrasena: formData.password,
      telefono: formData.telefono,
      correo: formData.correo,
      ciudad: formData.ciudad,
      direccion: formData.direccion,
      tipoUsuario: 'Usuario', // Valor por defecto para nuevos registros
      estado: 'Pendiente'     // Estado inicial por defecto
    };

    this.apiService.registerUser(apiData).subscribe({
      next: (response: RegistrationResponse) => {
        this.isLoading = false;
        this.successMessage = response.message || '¡Registro exitoso! Se ha enviado un código de verificación a tu correo.';
        console.log('Registro exitoso:', response);
        this.emailForVerification = apiData.correo; // Guarda el email para la verificación
        this.showVerificationPrompt = true; // Muestra el formulario de verificación
        this.registerForm.reset(); // Limpia el formulario de registro
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error en el registro:', err);
        if (err.error && err.error.mensaje) { // Tu API devuelve {error: true, mensaje: "..."}
            this.errorMessage = err.error.mensaje;
        } else if (err.error && typeof err.error === 'string') { // Si el error es solo un string
            this.errorMessage = err.error;
        } else if (err.status === 400) {
          this.errorMessage = 'Datos inválidos. Por favor, verifica la información ingresada.';
        } else if (err.status === 403) {
          this.errorMessage = 'No tienes permisos para realizar esta acción. Contacta al administrador.';
        } else if (err.status === 409) {
          this.errorMessage = 'El nombre de usuario o correo electrónico ya están registrados.';
        } else if (err.status === 0 || err.status === 503) {
          this.errorMessage = 'No se pudo conectar con el servidor. Inténtalo más tarde.';
        } else {
          this.errorMessage = 'Ocurrió un error inesperado durante el registro.';
        }
      }
    });
  }

  onVerifyCodeSubmit(): void {
    if (this.verificationForm.invalid) {
      this.verificationErrorMessage = 'Por favor, ingresa un código válido.';
      return;
    }

    this.isLoading = true;
    this.verificationErrorMessage = '';
    this.verificationSuccessMessage = '';
    const codigo = this.verificationForm.value.codigo;

    this.apiService.verifyUserCode(this.emailForVerification, codigo).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.verificationSuccessMessage = response.message || '¡Correo verificado exitosamente! Ahora puedes iniciar sesión.';
        console.log('Verificación exitosa:', response);
        this.showVerificationPrompt = false; // Oculta el prompt de verificación
        // Opcionalmente, redirige al login
        setTimeout(() => { // Pequeña demora para que el usuario lea el mensaje
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error en la verificación:', err);
        if (err.error && err.error.mensaje) {
          this.verificationErrorMessage = err.error.mensaje;
        } else if (err.error && typeof err.error === 'string') {
            this.verificationErrorMessage = err.error;
        } else if (err.status === 400 || err.status === 404) { // 404 si el correo/código no coincide
          this.verificationErrorMessage = 'El código de verificación es incorrecto o ha expirado.';
        } else {
          this.verificationErrorMessage = 'Ocurrió un error durante la verificación.';
        }
      }
    });
  }
}