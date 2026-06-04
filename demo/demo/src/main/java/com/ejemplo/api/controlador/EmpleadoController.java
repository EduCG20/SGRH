package com.ejemplo.api.controlador;

import com.ejemplo.api.modelo.Empleados;
import com.ejemplo.api.repositorio.EmpleadosRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/empleados")
public class EmpleadoController {

    @Autowired
    private EmpleadosRepository empleadosRepository;

    // GET todos
    @GetMapping
    public ResponseEntity<List<Empleados>> obtenerTodos() {
        List<Empleados> empleados = empleadosRepository.findAll();
        return ResponseEntity.ok(empleados);
    }

    // GET por ID
    @GetMapping("/{id}")
    public ResponseEntity<Empleados> obtenerPorId(@PathVariable int id) {
        Optional<Empleados> empleado = empleadosRepository.findById(id);
        return empleado.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET buscar por nombre
    @GetMapping("/buscar")
    public ResponseEntity<List<Empleados>> buscarPorNombre(@RequestParam String nombre) {
        List<Empleados> resultados = empleadosRepository
                .findByNombreContainingIgnoreCaseOrAppContainingIgnoreCaseOrApmContainingIgnoreCase(
                        nombre, nombre, nombre);
        return ResponseEntity.ok(resultados);
    }

    // POST (crear)
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Empleados> crearEmpleado(@RequestBody Empleados nuevoEmpleado) {
        // Validaciones básicas
        if (nuevoEmpleado.getNombre() == null || nuevoEmpleado.getNombre().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        if (nuevoEmpleado.getPagoHora() <= 0) {
            return ResponseEntity.badRequest().build();
        }

        // Si no tiene fecha de ingreso, asignar la actual
        if (nuevoEmpleado.getFechaIngreso() == null || nuevoEmpleado.getFechaIngreso().isEmpty()) {
            nuevoEmpleado.setFechaIngreso(java.time.LocalDate.now().toString());
        }

        Empleados empleadoGuardado = empleadosRepository.save(nuevoEmpleado);
        return ResponseEntity.status(HttpStatus.CREATED).body(empleadoGuardado);
    }

    // PUT (actualizar)
    @PutMapping("/{id}")
    public ResponseEntity<Empleados> actualizarEmpleado(@PathVariable int id, @RequestBody Empleados actualizado) {
        // Validaciones básicas
        if (actualizado.getNombre() == null || actualizado.getNombre().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        if (actualizado.getPagoHora() <= 0) {
            return ResponseEntity.badRequest().build();
        }

        // Verificar que el empleado existe
        if (!empleadosRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        actualizado.setId(id); // Asegurar que conserve el mismo ID
        Empleados empleadoActualizado = empleadosRepository.save(actualizado);
        return ResponseEntity.ok(empleadoActualizado);
    }

    // DELETE (eliminar)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarEmpleado(@PathVariable int id) {
        if (!empleadosRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        empleadosRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // GET estadísticas
    @GetMapping("/estadisticas")
    public ResponseEntity<EstadisticasEmpleados> obtenerEstadisticas() {
        List<Empleados> empleados = empleadosRepository.findAll();

        EstadisticasEmpleados stats = new EstadisticasEmpleados();
        stats.totalEmpleados = empleados.size();

        if (!empleados.isEmpty()) {
            stats.pagoPromedioHora = empleados.stream()
                    .mapToDouble(Empleados::getPagoHora)
                    .average()
                    .orElse(0.0);
            stats.pagoMinimoHora = empleados.stream()
                    .mapToDouble(Empleados::getPagoHora)
                    .min()
                    .orElse(0.0);
            stats.pagoMaximoHora = empleados.stream()
                    .mapToDouble(Empleados::getPagoHora)
                    .max()
                    .orElse(0.0);
        }

        return ResponseEntity.ok(stats);
    }

    // Clase interna para estadísticas
    public static class EstadisticasEmpleados {
        public int totalEmpleados;
        public double pagoPromedioHora;
        public double pagoMinimoHora;
        public double pagoMaximoHora;
    }
}