package com.ejemplo.api.modelo;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "registros")
public class Registros {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "empleado_id", nullable = false)
    private int empleadoId;

    @Column(name = "fecha_hora_entrada", nullable = false)
    private String fechaHoraEntrada;  // ISO 8601 format: "2024-12-02T08:30:00"

    @Column(name = "fecha_hora_salida")
    private String fechaHoraSalida;   // ISO 8601 format o null si no ha salido

    @Column(name = "horas_trabajadas")
    private double horasTrabajadas;

    // Constructor vacío (requerido por JPA)
    public Registros() {
        this.horasTrabajadas = 0.0;
    }

    // Constructor completo
    public Registros(int id, int empleadoId, String fechaHoraEntrada, String fechaHoraSalida, double horasTrabajadas) {
        this.id = id;
        this.empleadoId = empleadoId;
        this.fechaHoraEntrada = fechaHoraEntrada;
        this.fechaHoraSalida = fechaHoraSalida;
        this.horasTrabajadas = horasTrabajadas;
    }

    // Constructor para crear registro de entrada (sin salida)
    public Registros(int id, int empleadoId, String fechaHoraEntrada) {
        this.id = id;
        this.empleadoId = empleadoId;
        this.fechaHoraEntrada = fechaHoraEntrada;
        this.fechaHoraSalida = null;
        this.horasTrabajadas = 0.0;
    }

    // Constructor sin ID para crear nuevos
    public Registros(int empleadoId, String fechaHoraEntrada) {
        this.empleadoId = empleadoId;
        this.fechaHoraEntrada = fechaHoraEntrada;
        this.fechaHoraSalida = null;
        this.horasTrabajadas = 0.0;
    }

    // Getters y Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getEmpleadoId() {
        return empleadoId;
    }

    public void setEmpleadoId(int empleadoId) {
        this.empleadoId = empleadoId;
    }

    public String getFechaHoraEntrada() {
        return fechaHoraEntrada;
    }

    public void setFechaHoraEntrada(String fechaHoraEntrada) {
        this.fechaHoraEntrada = fechaHoraEntrada;
    }

    public String getFechaHoraSalida() {
        return fechaHoraSalida;
    }

    public void setFechaHoraSalida(String fechaHoraSalida) {
        this.fechaHoraSalida = fechaHoraSalida;
    }

    public double getHorasTrabajadas() {
        return horasTrabajadas;
    }

    public void setHorasTrabajadas(double horasTrabajadas) {
        this.horasTrabajadas = horasTrabajadas;
    }

    // Método auxiliar para calcular horas trabajadas automáticamente
    public void calcularHorasTrabajadas() {
        if (fechaHoraEntrada != null && fechaHoraSalida != null) {
            try {
                LocalDateTime entrada = LocalDateTime.parse(fechaHoraEntrada);
                LocalDateTime salida = LocalDateTime.parse(fechaHoraSalida);
                long minutos = ChronoUnit.MINUTES.between(entrada, salida);
                this.horasTrabajadas = Math.round((minutos / 60.0) * 100.0) / 100.0;
            } catch (Exception e) {
                this.horasTrabajadas = 0.0;
            }
        }
    }

    // Verificar si el registro está activo (no tiene salida)
    public boolean isActivo() {
        return fechaHoraSalida == null;
    }

    @Override
    public String toString() {
        return "Registros{" +
                "id=" + id +
                ", empleadoId=" + empleadoId +
                ", fechaHoraEntrada='" + fechaHoraEntrada + '\'' +
                ", fechaHoraSalida='" + fechaHoraSalida + '\'' +
                ", horasTrabajadas=" + horasTrabajadas +
                '}';
    }
}