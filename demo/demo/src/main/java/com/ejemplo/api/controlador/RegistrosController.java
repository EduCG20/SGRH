package com.ejemplo.api.controlador;

import com.ejemplo.api.modelo.Registros;
import com.ejemplo.api.repositorio.RegistrosRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/registros")
public class RegistrosController {

    @Autowired
    private RegistrosRepository registrosRepository;

    // GET todos los registros
    @GetMapping
    public ResponseEntity<List<Registros>> obtenerTodos() {
        List<Registros> registros = registrosRepository.findAll();
        return ResponseEntity.ok(registros);
    }

    // GET registro por ID
    @GetMapping("/{id}")
    public ResponseEntity<Registros> obtenerPorId(@PathVariable int id) {
        Optional<Registros> registro = registrosRepository.findById(id);
        return registro.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET registros por empleado
    @GetMapping("/empleado/{empleadoId}")
    public ResponseEntity<List<Registros>> obtenerPorEmpleado(@PathVariable int empleadoId) {
        List<Registros> registrosEmpleado = registrosRepository.findByEmpleadoId(empleadoId);
        return ResponseEntity.ok(registrosEmpleado);
    }

    // GET registros activos (sin salida)
    @GetMapping("/activos")
    public ResponseEntity<List<Registros>> obtenerActivos() {
        List<Registros> activos = registrosRepository.findByFechaHoraSalidaIsNull();
        return ResponseEntity.ok(activos);
    }

    // GET registros por rango de fechas
    @GetMapping("/rango")
    public ResponseEntity<List<Registros>> obtenerPorRango(
            @RequestParam String fechaInicio,
            @RequestParam String fechaFin) {

        try {
            String inicio = fechaInicio + "T00:00:00";
            String fin = fechaFin + "T23:59:59";

            List<Registros> registrosRango = registrosRepository.findByRangoFechas(inicio, fin);
            return ResponseEntity.ok(registrosRango);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // POST crear nuevo registro (entrada)
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Registros> crearRegistro(@RequestBody Registros nuevoRegistro) {
        // Validar que tenga empleadoId
        if (nuevoRegistro.getEmpleadoId() <= 0) {
            return ResponseEntity.badRequest().build();
        }

        // Verificar si el empleado ya tiene un registro activo
        Optional<Registros> registroActivo = registrosRepository
                .findByEmpleadoIdAndFechaHoraSalidaIsNull(nuevoRegistro.getEmpleadoId());

        if (registroActivo.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build(); // 409 Conflict
        }

        // Si no tiene fecha de entrada, asignar la actual
        if (nuevoRegistro.getFechaHoraEntrada() == null || nuevoRegistro.getFechaHoraEntrada().isEmpty()) {
            nuevoRegistro.setFechaHoraEntrada(LocalDateTime.now().toString());
        }

        // Asegurar que no tenga salida
        nuevoRegistro.setFechaHoraSalida(null);
        nuevoRegistro.setHorasTrabajadas(0.0);

        Registros registroGuardado = registrosRepository.save(nuevoRegistro);
        return ResponseEntity.status(HttpStatus.CREATED).body(registroGuardado);
    }

    // PUT actualizar registro (registrar salida)
    @PutMapping("/{id}")
    public ResponseEntity<Registros> actualizarRegistro(
            @PathVariable int id,
            @RequestBody Registros registroActualizado) {

        Optional<Registros> registroOpt = registrosRepository.findById(id);

        if (!registroOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Registros registro = registroOpt.get();

        // Actualizar solo los campos permitidos
        if (registroActualizado.getFechaHoraSalida() != null) {
            registro.setFechaHoraSalida(registroActualizado.getFechaHoraSalida());
        }

        // Si se proporcionaron horas trabajadas, usarlas; si no, calcular
        if (registroActualizado.getHorasTrabajadas() > 0) {
            registro.setHorasTrabajadas(registroActualizado.getHorasTrabajadas());
        } else {
            registro.calcularHorasTrabajadas();
        }

        Registros registroGuardado = registrosRepository.save(registro);
        return ResponseEntity.ok(registroGuardado);
    }

    // DELETE eliminar registro
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarRegistro(@PathVariable int id) {
        if (!registrosRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        registrosRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // GET estadísticas de registros
    @GetMapping("/estadisticas")
    public ResponseEntity<EstadisticasRegistros> obtenerEstadisticas() {
        List<Registros> registros = registrosRepository.findAll();

        EstadisticasRegistros stats = new EstadisticasRegistros();
        stats.totalRegistros = registros.size();
        stats.registrosActivos = (int) registros.stream().filter(Registros::isActivo).count();
        stats.registrosCompletados = stats.totalRegistros - stats.registrosActivos;
        stats.totalHorasTrabajadas = registros.stream()
                .mapToDouble(Registros::getHorasTrabajadas)
                .sum();
        stats.promedioHorasPorRegistro = stats.registrosCompletados > 0
                ? stats.totalHorasTrabajadas / stats.registrosCompletados
                : 0.0;

        return ResponseEntity.ok(stats);
    }

    // Clase interna para estadísticas
    public static class EstadisticasRegistros {
        public int totalRegistros;
        public int registrosActivos;
        public int registrosCompletados;
        public double totalHorasTrabajadas;
        public double promedioHorasPorRegistro;
    }
}