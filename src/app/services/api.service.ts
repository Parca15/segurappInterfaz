import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.production 
    ? 'http://localhost:8080/swagger-ui.html' 
    : '/api'; // Usa proxy en desarrollo

  constructor(private http: HttpClient) {}

    registerUser(userData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Si es requerido
    });

    return this.http.post(`${this.baseUrl}/usuarios/registrarUsuario`, userData, { headers });
  }

  // Método para verificar código (ajustado según Swagger)
  verifyUserCode(email: string, code: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/usuarios/verificarCodigoUsuario`, {
      correo: email,
      codigo: code  // Ajustado según el parámetro "codigo" en Swagger
    }, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }

  // Método para login (ajustado según Swagger)
  login(credentials: { correo: string, contrasena: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/usuarios/login`, {
      correo: credentials.correo,
      contrasena: credentials.contrasena
    }, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }

  // Método para crear reporte
  createReport(reportData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/reportes`, reportData, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }

  // Método para obtener reportes
  getReports(): Observable<any> {
    return this.http.get(`${this.baseUrl}/reportes`);
  }

  // Método para rechazar reporte
  rejectReport(reportId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/reportes/rechazarReporte/${reportId}`, {}, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }

  // Método para aprobar reporte
  approveReport(reportId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/reportes/aprobarReporte/${reportId}`, {}, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }
}