import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  providers: [MessageService]
})
export class ReportsComponent implements OnInit {
  reports: any[] = [];
  loading = false;
  user: any;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private messageService: MessageService
  ) {
    this.user = this.authService.getCurrentUser();
  }

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    this.loading = true;
    this.apiService.getReports().subscribe({
      next: (data) => {
        this.reports = data;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los reportes'
        });
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  approveReport(id: number) {
    this.apiService.approveReport(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Reporte aprobado'
        });
        this.loadReports();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error.message || 'Error al aprobar reporte'
        });
      }
    });
  }

  rejectReport(id: number) {
    this.apiService.rejectReport(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Reporte rechazado'
        });
        this.loadReports();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error.message || 'Error al rechazar reporte'
        });
      }
    });
  }
}