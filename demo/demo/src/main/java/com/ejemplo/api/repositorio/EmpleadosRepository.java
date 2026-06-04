package com.ejemplo.api.repositorio;

import com.ejemplo.api.modelo.Empleados;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmpleadosRepository extends JpaRepository<Empleados, Integer> {

    // Buscar empleados por nombre (ignora mayúsculas/minúsculas)
    List<Empleados> findByNombreContainingIgnoreCase(String nombre);

    // Buscar por apellido paterno
    List<Empleados> findByAppContainingIgnoreCase(String app);

    // Buscar por apellido materno
    List<Empleados> findByApmContainingIgnoreCase(String apm);

    // Buscar por cualquier campo de nombre
    List<Empleados> findByNombreContainingIgnoreCaseOrAppContainingIgnoreCaseOrApmContainingIgnoreCase(
            String nombre, String app, String apm);
}
