package com.ejemplo.api.modelo;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "empleados")
public class Empleados {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 100)
    private String app; // Apellido paterno

    @Column(length = 100)
    private String apm; // Apellido materno

    @Column(name = "fecha_ingreso", nullable = false)
    private String fechaIngreso;

    @Column(name = "pago_hora", nullable = false)
    private double pagoHora;

    // Constructor vacío (requerido por JPA)
    public Empleados() {
    }

    // Constructor completo
    public Empleados(int id, String nombre, String app, String apm, String fechaIngreso, double pagoHora) {
        this.id = id;
        this.nombre = nombre;
        this.app = app;
        this.apm = apm;
        this.fechaIngreso = fechaIngreso;
        this.pagoHora = pagoHora;
    }

    // Constructor alternativo (sin ID para crear nuevos)
    public Empleados(String nombre, String app, String apm, String fechaIngreso, double pagoHora) {
        this.nombre = nombre;
        this.app = app;
        this.apm = apm;
        this.fechaIngreso = fechaIngreso;
        this.pagoHora = pagoHora;
    }

    // Getters y Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getApp() {
        return app;
    }

    public void setApp(String app) {
        this.app = app;
    }

    public String getApm() {
        return apm;
    }

    public void setApm(String apm) {
        this.apm = apm;
    }

    public String getFechaIngreso() {
        return fechaIngreso;
    }

    public void setFechaIngreso(String fechaIngreso) {
        this.fechaIngreso = fechaIngreso;
    }

    public double getPagoHora() {
        return pagoHora;
    }

    public void setPagoHora(double pagoHora) {
        this.pagoHora = pagoHora;
    }

    @Override
    public String toString() {
        return "Empleados{" +
                "id=" + id +
                ", nombre='" + nombre + '\'' +
                ", app='" + app + '\'' +
                ", apm='" + apm + '\'' +
                ", fechaIngreso='" + fechaIngreso + '\'' +
                ", pagoHora=" + pagoHora +
                '}';
    }
}