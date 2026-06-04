package com.ejemplo.api.repositorio;

import com.ejemplo.api.modelo.Registros;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrosRepository extends JpaRepository<Registros, Integer> {

    // Buscar registros por empleado
    List<Registros> findByEmpleadoId(int empleadoId);

    // Buscar registros activos (sin salida)
    List<Registros> findByFechaHoraSalidaIsNull();

    // Buscar registros completados
    List<Registros> findByFechaHoraSalidaIsNotNull();

    // Buscar registro activo de un empleado específico
    Optional<Registros> findByEmpleadoIdAndFechaHoraSalidaIsNull(int empleadoId);

    // Buscar registros en un rango de fechas
    @Query("SELECT r FROM Registros r WHERE r.fechaHoraEntrada >= :fechaInicio AND r.fechaHoraEntrada <= :fechaFin")
    List<Registros> findByRangoFechas(
            @Param("fechaInicio") String fechaInicio,
            @Param("fechaFin") String fechaFin
    );

    // Calcular total de horas trabajadas por empleado
    @Query("SELECT SUM(r.horasTrabajadas) FROM Registros r WHERE r.empleadoId = :empleadoId")
    Double calcularTotalHorasPorEmpleado(@Param("empleadoId") int empleadoId);
}
