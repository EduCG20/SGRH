import React, { useState, useEffect } from "react";
import axios from "axios";
import "./css/empleados.css";

function Empleados() {
  // ========== ESTADOS DE AUTENTICACIÓN ==========
  const [autenticado, setAutenticado] = useState(false);
  const [contraseñaIngresada, setContraseñaIngresada] = useState("");
  const [errorContraseña, setErrorContraseña] = useState("");
  const [mostrarContraseña, setMostrarContraseña] = useState(false);
  
  // Estados para cambiar contraseña
  const [mostrarCambioContraseña, setMostrarCambioContraseña] = useState(false);
  const [contraseñaActual, setContraseñaActual] = useState("");
  const [contraseñaNueva, setContraseñaNueva] = useState("");
  const [contraseñaConfirmar, setContraseñaConfirmar] = useState("");
  const [errorCambioContraseña, setErrorCambioContraseña] = useState("");
  const [mostrarContraseñaActual, setMostrarContraseñaActual] = useState(false);
  const [mostrarContraseñaNueva, setMostrarContraseñaNueva] = useState(false);
  const [mostrarContraseñaConfirmar, setMostrarContraseñaConfirmar] = useState(false);
  
  // Obtener contraseña del localStorage o usar la predeterminada
  const [contraseñaSistema, setContraseñaSistema] = useState(() => {
    const contraseñaGuardada = localStorage.getItem("contraseña_sistema");
    return contraseñaGuardada || "admin123";
  });

  // ========== ESTADOS EXISTENTES ==========
  const [empleados, setEmpleados] = useState([]);
  const [nuevoEmpleado, setNuevoEmpleado] = useState({
    nombre: "",
    app: "",
    apm: "",
    fechaIngreso: new Date().toISOString().split("T")[0],
    pagoHora: "",
  });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState("registro");
  const [nomina, setNomina] = useState({});
  const [erroresValidacion, setErroresValidacion] = useState({});

  // ========== NUEVOS ESTADOS ==========
  const [registros, setRegistros] = useState([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  
  const [filtroReporte, setFiltroReporte] = useState({
    empleadoId: "",
    fechaInicio: obtenerPrimerDiaMes(),
    fechaFin: obtenerUltimoDiaMes(),
  });
  
  const [busqueda, setBusqueda] = useState("");
  const [fechaInicio, setFechaInicio] = useState(obtenerLunesActual());
  const [fechaFin, setFechaFin] = useState(obtenerSabadoActual());
  
  const [estadisticas, setEstadisticas] = useState({
    totalEmpleados: 0,
    horasTrabajadas: 0,
    nominaTotal: 0,
    promedioHoras: 0,
  });
// ========== FUNCIONES DE VALIDACIÓN ==========
  const validarSoloLetras = (texto) => {
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    return regex.test(texto);
  };

  const validarSoloNumeros = (texto) => {
    const regex = /^\d*\.?\d*$/;
    return regex.test(texto);
  };

  const validarFormularioEmpleado = () => {
    const errores = {};

    if (!nuevoEmpleado.nombre.trim()) {
      errores.nombre = "El nombre es obligatorio";
    } else if (!validarSoloLetras(nuevoEmpleado.nombre)) {
      errores.nombre = "El nombre solo puede contener letras";
    }

    if (nuevoEmpleado.app && !validarSoloLetras(nuevoEmpleado.app)) {
      errores.app = "El apellido paterno solo puede contener letras";
    }

    if (nuevoEmpleado.apm && !validarSoloLetras(nuevoEmpleado.apm)) {
      errores.apm = "El apellido materno solo puede contener letras";
    }

    if (!nuevoEmpleado.pagoHora) {
      errores.pagoHora = "El pago por hora es obligatorio";
    } else if (!validarSoloNumeros(nuevoEmpleado.pagoHora)) {
      errores.pagoHora = "El pago por hora solo puede contener números";
    } else if (parseFloat(nuevoEmpleado.pagoHora) <= 0) {
      errores.pagoHora = "El pago por hora debe ser mayor a 0";
    }

    setErroresValidacion(errores);
    return Object.keys(errores).length === 0;
  };

// ========== FUNCIONES DE AUTENTICACIÓN ==========
  const validarContraseña = () => {
    if (contraseñaIngresada === contraseñaSistema) {
      setAutenticado(true);
      setErrorContraseña("");
      setContraseñaIngresada("");
    } else {
      setErrorContraseña("Contraseña incorrecta. Intenta nuevamente.");
      setContraseñaIngresada("");
    }
  };

  const cerrarSesion = () => {
    if (window.confirm("¿Estás seguro de cerrar sesión?")) {
      setAutenticado(false);
      setSeccionActiva("registro");
    }
  };

  const manejarEnter = (e) => {
    if (e.key === "Enter") {
      validarContraseña();
    }
  };

  const seccionRequiereAutenticacion = (seccion) => {
    const seccionesProtegidas = ["dashboard", "lista", "formulario", "nomina", "reportes"];
    return seccionesProtegidas.includes(seccion);
  };

  const cambiarSeccion = (nuevaSeccion) => {
    if (seccionRequiereAutenticacion(nuevaSeccion) && !autenticado) {
      // Simplemente cambiar a la sección, el JSX mostrará el login automáticamente
      setSeccionActiva(nuevaSeccion);
      return;
    }
    setSeccionActiva(nuevaSeccion);
  };

// ========== FUNCIONES PARA CAMBIAR CONTRASEÑA ==========
  const abrirCambioContraseña = () => {
    setMostrarCambioContraseña(true);
    setContraseñaActual("");
    setContraseñaNueva("");
    setContraseñaConfirmar("");
    setErrorCambioContraseña("");
  };

  const cerrarCambioContraseña = () => {
    setMostrarCambioContraseña(false);
    setContraseñaActual("");
    setContraseñaNueva("");
    setContraseñaConfirmar("");
    setErrorCambioContraseña("");
    setMostrarContraseñaActual(false);
    setMostrarContraseñaNueva(false);
    setMostrarContraseñaConfirmar(false);
  };

  const cambiarContraseña = () => {
    if (contraseñaActual !== contraseñaSistema) {
      setErrorCambioContraseña("La contraseña actual es incorrecta");
      return;
    }

    if (!contraseñaNueva.trim()) {
      setErrorCambioContraseña("La nueva contraseña no puede estar vacía");
      return;
    }

    if (contraseñaNueva.length < 6) {
      setErrorCambioContraseña("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (contraseñaNueva !== contraseñaConfirmar) {
      setErrorCambioContraseña("Las contraseñas no coinciden");
      return;
    }

    if (contraseñaNueva === contraseñaActual) {
      setErrorCambioContraseña("La nueva contraseña debe ser diferente a la actual");
      return;
    }

    setContraseñaSistema(contraseñaNueva);
    localStorage.setItem("contraseña_sistema", contraseñaNueva);
    
    alert("✅ Contraseña cambiada exitosamente");
    cerrarCambioContraseña();
  };

  const restaurarContraseñaPorDefecto = () => {
    if (window.confirm("¿Estás seguro de restaurar la contraseña por defecto? (admin123)")) {
      setContraseñaSistema("admin123");
      localStorage.setItem("contraseña_sistema", "admin123");
      alert("✅ Contraseña restaurada a: admin123");
      cerrarCambioContraseña();
    }
  };

// ========== FUNCIONES AUXILIARES DE FECHA ==========
  function obtenerLunesActual() {
    const hoy = new Date();
    const dia = hoy.getDay();
    const diferencia = dia === 0 ? -6 : 1 - dia;
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() + diferencia);
    return lunes.toISOString().split("T")[0];
  }

  function obtenerSabadoActual() {
    const hoy = new Date();
    const dia = hoy.getDay();
    const diferencia = dia === 0 ? 0 : 6 - dia;
    const sabado = new Date(hoy);
    sabado.setDate(hoy.getDate() + diferencia);
    return sabado.toISOString().split("T")[0];
  }

  function obtenerPrimerDiaMes() {
    const hoy = new Date();
    return new Date(hoy.getFullYear(), hoy.getMonth(), 1)
      .toISOString()
      .split("T")[0];
  }

  function obtenerUltimoDiaMes() {
    const hoy = new Date();
    return new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];
  }

  function formatearFecha(fecha) {
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-MX', opciones);
  }

  function formatearHora(fecha) {
    return new Date(fecha).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

// ========== EFECTOS Y CARGA DE DATOS ==========
  useEffect(() => {
    cargarEmpleados();
    cargarRegistros();
  }, []);

  useEffect(() => {
    calcularEstadisticas();
  }, [empleados, registros]);

  const cargarEmpleados = () => {
    axios
      .get("http://localhost:8080/api/empleados")
      .then((response) => setEmpleados(response.data))
      .catch((error) => console.error("Error al obtener empleados:", error));
  };

  const cargarRegistros = () => {
    axios
      .get("http://localhost:8080/api/registros")
      .then((response) => setRegistros(response.data))
      .catch((error) => console.error("Error al obtener registros:", error));
  };

// ========== FUNCIONES CRUD EMPLEADOS ==========
  const guardarEmpleado = () => {
    if (!validarFormularioEmpleado()) {
      alert("Por favor corrige los errores en el formulario");
      return;
    }

    if (modoEdicion) {
      axios
        .put(
          `http://localhost:8080/api/empleados/${nuevoEmpleado.id}`,
          nuevoEmpleado
        )
        .then((response) => {
          setEmpleados(
            empleados.map((e) =>
              e.id === nuevoEmpleado.id ? response.data : e
            )
          );
          resetFormulario();
          setModoEdicion(false);
          setSeccionActiva("lista");
        })
        .catch((error) => console.error("Error al actualizar empleado:", error));
    } else {
      axios
        .post("http://localhost:8080/api/empleados", nuevoEmpleado)
        .then((response) => {
          setEmpleados([...empleados, response.data]);
          resetFormulario();
          setSeccionActiva("lista");
        })
        .catch((error) => console.error("Error al agregar empleado:", error));
    }
  };

  const eliminarEmpleado = (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este empleado?")) return;
    
    axios
      .delete(`http://localhost:8080/api/empleados/${id}`)
      .then(() => {
        setEmpleados(empleados.filter((e) => e.id !== id));
        setRegistros(registros.filter((r) => r.empleadoId !== id));
      })
      .catch((error) => console.error("Error al eliminar empleado:", error));
  };

  const editarEmpleado = (empleado) => {
    setNuevoEmpleado(empleado);
    setModoEdicion(true);
    setSeccionActiva("formulario");
  };

  const resetFormulario = () => {
    setNuevoEmpleado({
      nombre: "",
      app: "",
      apm: "",
      fechaIngreso: new Date().toISOString().split("T")[0],
      pagoHora: "",
    });
    setModoEdicion(false);
    setErroresValidacion({});
  };

// ========== FUNCIONES DE REGISTRO DE ENTRADAS/SALIDAS ==========
  const registrarEntrada = (empleadoId) => {
    const nuevoRegistro = {
      empleadoId,
      fechaHoraEntrada: new Date().toISOString(),
      fechaHoraSalida: null,
      horasTrabajadas: 0,
    };

    axios
      .post("http://localhost:8080/api/registros", nuevoRegistro)
      .then((response) => {
        setRegistros([...registros, response.data]);
        alert("Entrada registrada correctamente");
      })
      .catch((error) => console.error("Error al registrar entrada:", error));
  };

  const registrarSalida = (registroId) => {
    const registro = registros.find((r) => r.id === registroId);
    if (!registro) return;

    const fechaSalida = new Date();
    const fechaEntrada = new Date(registro.fechaHoraEntrada);
    const horasTrabajadas = (fechaSalida - fechaEntrada) / (1000 * 60 * 60);

    // Validar que se haya cumplido la jornada laboral mínima (8 horas)
    if (horasTrabajadas < 8) {
      const horasFaltantes = (8 - horasTrabajadas).toFixed(2);
      if (!window.confirm(
        `Aún no se ha cumplido la jornada laboral completa (8 horas).\n` +
        `Tiempo trabajado: ${horasTrabajadas.toFixed(2)} horas\n` +
        `Faltan: ${horasFaltantes} horas\n\n` +
        `¿Deseas registrar la salida de todas formas?`
      )) {
        return;
      }
    }

    const registroActualizado = {
      ...registro,
      fechaHoraSalida: fechaSalida.toISOString(),
      horasTrabajadas: horasTrabajadas.toFixed(2),
    };

    axios
      .put(`http://localhost:8080/api/registros/${registroId}`, registroActualizado)
      .then((response) => {
        setRegistros(
          registros.map((r) => (r.id === registroId ? response.data : r))
        );
        alert("Salida registrada correctamente");
      })
      .catch((error) => console.error("Error al registrar salida:", error));
  };

// ========== FUNCIONES DE NÓMINA ==========
  const manejarCambioDia = (empleadoId, dia, tipo, valor) => {
    setNomina((prev) => {
      const empleadoNomina = prev[empleadoId] || {
        dias: {},
        totalHoras: 0,
        pago: 0,
      };

      let nuevoDias = { ...empleadoNomina.dias };

      if (tipo === "checkbox") {
        if (valor) {
          nuevoDias[dia] = { horas: 10, checked: true };
        } else {
          nuevoDias[dia] = { horas: 0, checked: false };
        }
      } else if (tipo === "horas") {
        const horas = Number(valor) || 0;
        if (horas === 0) {
          nuevoDias[dia] = { horas: 0, checked: false, disabled: false };
        } else {
          nuevoDias[dia] = { horas, checked: false, disabled: true };
        }
      }

      const totalHoras = Object.values(nuevoDias).reduce(
        (acc, d) => acc + (d.horas || 0),
        0
      );

      const empleado = empleados.find((e) => e.id === empleadoId);
      const pagoHoraNum = Number(empleado?.pagoHora) || 0;
      const pago = totalHoras * pagoHoraNum;

      return {
        ...prev,
        [empleadoId]: { dias: nuevoDias, totalHoras, pago },
      };
    });
  };

  const calcularEstadisticas = () => {
    const totalEmpleados = empleados.length;
    
    // Calcular horas trabajadas totales desde registros
    const horasTrabajadas = registros.reduce(
      (acc, r) => acc + (parseFloat(r.horasTrabajadas) || 0),
      0
    );

    // Calcular nómina total basada en registros reales
    const nominaTotal = registros.reduce((acc, registro) => {
      const empleado = empleados.find(e => e.id === registro.empleadoId);
      if (!empleado) return acc;
      
      const pago = (parseFloat(registro.horasTrabajadas) || 0) * (parseFloat(empleado.pagoHora) || 0);
      return acc + pago;
    }, 0);

    const promedioHoras = totalEmpleados > 0 ? horasTrabajadas / totalEmpleados : 0;

    setEstadisticas({
      totalEmpleados,
      horasTrabajadas: horasTrabajadas.toFixed(2),
      nominaTotal: nominaTotal.toFixed(2),
      promedioHoras: promedioHoras.toFixed(2),
    });
  };

// ========== FUNCIONES DE REPORTES ==========
  const obtenerRegistrosFiltrados = () => {
    return registros.filter((registro) => {
      const cumpleFecha =
        (!filtroReporte.fechaInicio ||
          new Date(registro.fechaHoraEntrada) >= new Date(filtroReporte.fechaInicio)) &&
        (!filtroReporte.fechaFin ||
          new Date(registro.fechaHoraEntrada) <= new Date(filtroReporte.fechaFin + "T23:59:59"));

      const cumpleEmpleado =
        !filtroReporte.empleadoId ||
        registro.empleadoId === parseInt(filtroReporte.empleadoId);

      return cumpleFecha && cumpleEmpleado;
    });
  };

  const obtenerEmpleadosFiltrados = () => {
    return empleados.filter((emp) =>
      `${emp.nombre} ${emp.app} ${emp.apm}`
        .toLowerCase()
        .includes(busqueda.toLowerCase())
    );
  };

// ========== FUNCIONES DE EXPORTACIÓN ==========
  const exportarExcel = () => {
    const registrosFiltrados = obtenerRegistrosFiltrados();
    
    let csv = "Empleado,Fecha Entrada,Hora Entrada,Fecha Salida,Hora Salida,Horas Trabajadas,Pago\n";
    
    registrosFiltrados.forEach((registro) => {
      const empleado = empleados.find((e) => e.id === registro.empleadoId);
      if (!empleado) return;

      const nombreCompleto = `${empleado.nombre} ${empleado.app} ${empleado.apm}`;
      const fechaEntrada = new Date(registro.fechaHoraEntrada);
      const fechaSalida = registro.fechaHoraSalida ? new Date(registro.fechaHoraSalida) : null;
      const pago = (parseFloat(registro.horasTrabajadas) * parseFloat(empleado.pagoHora)).toFixed(2);

      csv += `"${nombreCompleto}",`;
      csv += `${fechaEntrada.toLocaleDateString()},`;
      csv += `${fechaEntrada.toLocaleTimeString()},`;
      csv += `${fechaSalida ? fechaSalida.toLocaleDateString() : "N/A"},`;
      csv += `${fechaSalida ? fechaSalida.toLocaleTimeString() : "N/A"},`;
      csv += `${registro.horasTrabajadas || 0},`;
      csv += `$${pago}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `reporte_${new Date().getTime()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportarPDF = () => {
    window.print();
  };

  const imprimirNomina = () => {
    const contenido = document.querySelector(".tabla-nomina");
    if (!contenido) return;

    const ventana = window.open("", "_blank");
    ventana.document.write(`
      <html>
        <head>
          <title>Nómina Semanal</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            th { background-color: #4CAF50; color: white; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Nómina Semanal</h1>
          <p>Período: ${formatearFecha(fechaInicio)} - ${formatearFecha(fechaFin)}</p>
          ${contenido.outerHTML}
        </body>
      </html>
    `);
    ventana.document.close();
    ventana.print();
  };
  
// ========== RENDER - COMPONENTE JSX ==========
  return (
    <div className="contenedor-empleados">
      {/* Sidebar con menú */}
      <aside className="sidebar">
        <div className="header-sidebar">
          <h3>📋 Sistema RH</h3>
          {autenticado && (
            <div className="botones-sesion">
              <button className="btn-cambiar-contraseña" onClick={abrirCambioContraseña}>
                🔑 Cambiar Contraseña
              </button>
              <button className="btn-cerrar-sesion" onClick={cerrarSesion}>
                🚪 Cerrar Sesión
              </button>
            </div>
          )}
        </div>

        <button
          className={`menu-btn ${seccionActiva === "registro" ? "activo" : ""}`}
          onClick={() => cambiarSeccion("registro")}
        >
          🕐 Registro Entrada/Salida
        </button>

        <div className="separador-menu"></div>
        
        <button
          className={`menu-btn ${seccionActiva === "dashboard" ? "activo" : ""} ${!autenticado ? "bloqueado" : ""}`}
          onClick={() => cambiarSeccion("dashboard")}
        >
          📊 Dashboard {!autenticado && "🔒"}
        </button>
        
        <button
          className={`menu-btn ${seccionActiva === "lista" ? "activo" : ""} ${!autenticado ? "bloqueado" : ""}`}
          onClick={() => cambiarSeccion("lista")}
        >
          📋 Lista de empleados {!autenticado && "🔒"}
        </button>
        
        <button
          className={`menu-btn ${seccionActiva === "formulario" ? "activo" : ""} ${!autenticado ? "bloqueado" : ""}`}
          onClick={() => cambiarSeccion("formulario")}
        >
          {modoEdicion ? "✏️ Editar empleado" : "➕ Agregar empleado"} {!autenticado && "🔒"}
        </button>
        
        <button
          className={`menu-btn ${seccionActiva === "nomina" ? "activo" : ""} ${!autenticado ? "bloqueado" : ""}`}
          onClick={() => cambiarSeccion("nomina")}
        >
          💵 Nómina {!autenticado && "🔒"}
        </button>
        
        <button
          className={`menu-btn ${seccionActiva === "reportes" ? "activo" : ""} ${!autenticado ? "bloqueado" : ""}`}
          onClick={() => cambiarSeccion("reportes")}
        >
          📈 Reportes {!autenticado && "🔒"}
        </button>
      </aside>

      {/* Contenido principal */}
      <main className="contenido">
{/* ========== PANTALLA DE LOGIN ========== */}
        {!autenticado && seccionRequiereAutenticacion(seccionActiva) && (
          <div className="pantalla-login">
            <div className="contenedor-login">
              <div className="icono-login">🔐</div>
              <h2>Acceso Restringido</h2>
              <p>Esta sección requiere autenticación</p>
              
              <div className="formulario-login">
                <div className="campo-login">
                  <label>Contraseña:</label>
                  <div className="input-password-wrapper">
                    <input
                      type={mostrarContraseña ? "text" : "password"}
                      placeholder="Ingresa la contraseña"
                      value={contraseñaIngresada}
                      onChange={(e) => setContraseñaIngresada(e.target.value)}
                      onKeyPress={manejarEnter}
                      className={errorContraseña ? "input-error" : ""}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="btn-mostrar-password"
                      onClick={() => setMostrarContraseña(!mostrarContraseña)}
                    >
                      {mostrarContraseña ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                  {errorContraseña && (
                    <span className="mensaje-error">{errorContraseña}</span>
                  )}
                </div>
                
                <div className="botones-login">
                  <button className="btn-login" onClick={validarContraseña}>
                    Iniciar Sesión
                  </button>
                  <button 
                    className="btn-cancelar-login" 
                    onClick={() => {
                      setSeccionActiva("registro");
                      setContraseñaIngresada("");
                      setErrorContraseña("");
                    }}
                  >
                    Cancelar
                  </button>
                </div>
                
                <div className="ayuda-login">
                  <p>💡 Presiona <strong>Enter</strong> para acceder rápidamente</p>
                </div>
              </div>
            </div>
          </div>
        )}

{/* ========== REGISTRO ENTRADA/SALIDA ========== */}
        {seccionActiva === "registro" && (
          <>
            <h2>🕐 Registro de Entrada/Salida</h2>

            <div className="panel-registro">
              <h3>Registrar Entrada</h3>
              <div className="selector-empleado">
                <select
                  value={empleadoSeleccionado || ""}
                  onChange={(e) => setEmpleadoSeleccionado(Number(e.target.value))}
                  className="select-empleado"
                >
                  <option value="">Seleccione un empleado</option>
                  {empleados.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nombre} {emp.app} {emp.apm}
                    </option>
                  ))}
                </select>
                <button
                  className="btn-entrada"
                  onClick={() => {
                    if (empleadoSeleccionado) {
                      registrarEntrada(empleadoSeleccionado);
                      setEmpleadoSeleccionado(null);
                    } else {
                      alert("Selecciona un empleado");
                    }
                  }}
                >
                  ✓ Registrar Entrada
                </button>
              </div>
            </div>

            <div className="tabla-registros-hoy">
              <h3>Registros Activos (Sin Salida)</h3>
              <table className="tabla-empleados">
                <thead>
                  <tr>
                    <th>Empleado</th>
                    <th>Fecha</th>
                    <th>Hora Entrada</th>
                    <th>Tiempo Transcurrido</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {registros
                    .filter((r) => !r.fechaHoraSalida)
                    .map((registro) => {
                      const empleado = empleados.find(
                        (e) => e.id === registro.empleadoId
                      );
                      if (!empleado) return null;

                      const entrada = new Date(registro.fechaHoraEntrada);
                      const ahora = new Date();
                      const tiempoTranscurrido = (
                        (ahora - entrada) /
                        (1000 * 60 * 60)
                      ).toFixed(2);

                      return (
                        <tr key={registro.id}>
                          <td>{`${empleado.nombre} ${empleado.app} ${empleado.apm}`}</td>
                          <td>{entrada.toLocaleDateString()}</td>
                          <td>{formatearHora(registro.fechaHoraEntrada)}</td>
                          <td>{tiempoTranscurrido} hrs</td>
                          <td>
                            <button
                              className="btn-salida"
                              onClick={() => registrarSalida(registro.id)}
                            >
                              ✓ Registrar Salida
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            <div className="historial-registros">
              <h3>Historial de Registros Completados</h3>
              <table className="tabla-empleados">
                <thead>
                  <tr>
                    <th>Empleado</th>
                    <th>Fecha</th>
                    <th>Entrada</th>
                    <th>Salida</th>
                    <th>Horas Trabajadas</th>
                    <th>Pago</th>
                  </tr>
                </thead>
                <tbody>
                  {registros
                    .filter((r) => r.fechaHoraSalida)
                    .slice(-10)
                    .reverse()
                    .map((registro) => {
                      const empleado = empleados.find(
                        (e) => e.id === registro.empleadoId
                      );
                      if (!empleado) return null;

                      const pago = (
                        parseFloat(registro.horasTrabajadas) *
                        parseFloat(empleado.pagoHora)
                      ).toFixed(2);

                      return (
                        <tr key={registro.id}>
                          <td>{`${empleado.nombre} ${empleado.app}`}</td>
                          <td>
                            {new Date(
                              registro.fechaHoraEntrada
                            ).toLocaleDateString()}
                          </td>
                          <td>{formatearHora(registro.fechaHoraEntrada)}</td>
                          <td>{formatearHora(registro.fechaHoraSalida)}</td>
                          <td>{registro.horasTrabajadas} hrs</td>
                          <td>${pago}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </>
        )}

{/* ========== DASHBOARD ========== */}
        {autenticado && seccionActiva === "dashboard" && (
          <div className="dashboard">
            <h2>📊 Resumen General</h2>
            
            <div className="tarjetas-estadisticas">
              <div className="tarjeta-stat">
                <div className="icono-stat">👥</div>
                <div className="info-stat">
                  <h3>Total Empleados</h3>
                  <p className="numero-grande">{estadisticas.totalEmpleados}</p>
                </div>
              </div>

              <div className="tarjeta-stat">
                <div className="icono-stat">⏰</div>
                <div className="info-stat">
                  <h3>Horas Trabajadas</h3>
                  <p className="numero-grande">{estadisticas.horasTrabajadas}</p>
                </div>
              </div>

              <div className="tarjeta-stat">
                <div className="icono-stat">💰</div>
                <div className="info-stat">
                  <h3>Nómina Total</h3>
                  <p className="numero-grande">${estadisticas.nominaTotal}</p>
                </div>
              </div>

              <div className="tarjeta-stat">
                <div className="icono-stat">📊</div>
                <div className="info-stat">
                  <h3>Promedio Horas</h3>
                  <p className="numero-grande">{estadisticas.promedioHoras}</p>
                </div>
              </div>
            </div>

            <div className="seccion-recientes">
              <h3>Últimos Registros de Hoy</h3>
              <table className="tabla-dashboard">
                <thead>
                  <tr>
                    <th>Empleado</th>
                    <th>Entrada</th>
                    <th>Salida</th>
                    <th>Horas</th>
                  </tr>
                </thead>
                <tbody>
                  {registros
                    .filter((r) => {
                      const hoy = new Date().toDateString();
                      const fechaRegistro = new Date(r.fechaHoraEntrada).toDateString();
                      return hoy === fechaRegistro;
                    })
                    .slice(-5)
                    .reverse()
                    .map((registro) => {
                      const empleado = empleados.find((e) => e.id === registro.empleadoId);
                      if (!empleado) return null;

                      return (
                        <tr key={registro.id}>
                          <td>{`${empleado.nombre} ${empleado.app}`}</td>
                          <td>{formatearHora(registro.fechaHoraEntrada)}</td>
                          <td>
                            {registro.fechaHoraSalida
                              ? formatearHora(registro.fechaHoraSalida)
                              : "En turno"}
                          </td>
                          <td>{registro.horasTrabajadas || 0} hrs</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

{/* ========== LISTA DE EMPLEADOS ========== */}
        {autenticado && seccionActiva === "lista" && (
          <>
            <h2>📋 Lista de Empleados</h2>
            
            <div className="barra-busqueda">
              <input
                type="text"
                placeholder="Buscar empleado..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="input-busqueda"
              />
            </div>

            <table className="tabla-empleados">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Nombre</th>
                  <th>Apellido Paterno</th>
                  <th>Apellido Materno</th>
                  <th>Fecha de ingreso</th>
                  <th>Pago por hora</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {obtenerEmpleadosFiltrados().map((e, index) => (
                  <tr key={e.id}>
                    <td>{index + 1}</td>
                    <td>{e.nombre}</td>
                    <td>{e.app}</td>
                    <td>{e.apm}</td>
                    <td>{formatearFecha(e.fechaIngreso)}</td>
                    <td>${e.pagoHora}</td>
                    <td>
                      <button
                        className="btn-editar"
                        onClick={() => editarEmpleado(e)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn-eliminar"
                        onClick={() => eliminarEmpleado(e.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

{/* ========== FORMULARIO EMPLEADO ========== */}
        {autenticado && seccionActiva === "formulario" && (
          <>
            <h3>{modoEdicion ? "✏️ Editar Empleado" : "➕ Agregar Empleado"}</h3>
            <div className="formulario">
              <div className="campo-form">
                <label>Nombre *</label>
                <input
                  placeholder="Nombre"
                  value={nuevoEmpleado.nombre}
                  onChange={(e) => {
                    const valor = e.target.value;
                    if (valor === "" || validarSoloLetras(valor)) {
                      setNuevoEmpleado({ ...nuevoEmpleado, nombre: valor });
                      setErroresValidacion({ ...erroresValidacion, nombre: "" });
                    }
                  }}
                  required
                  className={erroresValidacion.nombre ? "input-error" : ""}
                />
                {erroresValidacion.nombre && (
                  <span className="mensaje-error">{erroresValidacion.nombre}</span>
                )}
              </div>

              <div className="campo-form">
                <label>Apellido Paterno</label>
                <input
                  placeholder="Apellido Paterno"
                  value={nuevoEmpleado.app}
                  onChange={(e) => {
                    const valor = e.target.value;
                    if (valor === "" || validarSoloLetras(valor)) {
                      setNuevoEmpleado({ ...nuevoEmpleado, app: valor });
                      setErroresValidacion({ ...erroresValidacion, app: "" });
                    }
                  }}
                  className={erroresValidacion.app ? "input-error" : ""}
                />
                {erroresValidacion.app && (
                  <span className="mensaje-error">{erroresValidacion.app}</span>
                )}
              </div>

              <div className="campo-form">
                <label>Apellido Materno</label>
                <input
                  placeholder="Apellido Materno"
                  value={nuevoEmpleado.apm}
                  onChange={(e) => {
                    const valor = e.target.value;
                    if (valor === "" || validarSoloLetras(valor)) {
                      setNuevoEmpleado({ ...nuevoEmpleado, apm: valor });
                      setErroresValidacion({ ...erroresValidacion, apm: "" });
                    }
                  }}
                  className={erroresValidacion.apm ? "input-error" : ""}
                />
                {erroresValidacion.apm && (
                  <span className="mensaje-error">{erroresValidacion.apm}</span>
                )}
              </div>

              <div className="campo-form">
                <label>Fecha de ingreso</label>
                <input
                  type="date"
                  value={nuevoEmpleado.fechaIngreso}
                  onChange={(e) =>
                    setNuevoEmpleado({
                      ...nuevoEmpleado,
                      fechaIngreso: e.target.value,
                    })
                  }
                />
              </div>

              <div className="campo-form">
                <label>Pago por hora *</label>
                <input
                  placeholder="Pago por hora"
                  type="text"
                  value={nuevoEmpleado.pagoHora}
                  onChange={(e) => {
                    const valor = e.target.value;
                    if (valor === "" || validarSoloNumeros(valor)) {
                      setNuevoEmpleado({
                        ...nuevoEmpleado,
                        pagoHora: valor,
                      });
                      setErroresValidacion({ ...erroresValidacion, pagoHora: "" });
                    }
                  }}
                  required
                  className={erroresValidacion.pagoHora ? "input-error" : ""}
                />
                {erroresValidacion.pagoHora && (
                  <span className="mensaje-error">{erroresValidacion.pagoHora}</span>
                )}
              </div>

              <div className="botones-form">
                <button className="btn-guardar" onClick={guardarEmpleado}>
                  {modoEdicion ? "✓ Actualizar" : "✓ Agregar"}
                </button>
                <button
                  className="btn-cancelar"
                  onClick={() => {
                    resetFormulario();
                    setSeccionActiva("lista");
                  }}
                >
                  ✗ Cancelar
                </button>
              </div>
            </div>
          </>
        )}

{/* ========== NÓMINA ========== */}
        {autenticado && seccionActiva === "nomina" && (
          <>
            <h2>💵 Nómina semanal</h2>

            <div className="filtros-nomina">
              <div className="campo-fecha-nomina">
                <label>Fecha Inicio:</label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>
              <div className="campo-fecha-nomina">
                <label>Fecha Fin:</label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>
            </div>

            <table className="tabla-nomina">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Nombre completo</th>
                  <th>L</th>
                  <th>M</th>
                  <th>M</th>
                  <th>J</th>
                  <th>V</th>
                  <th>S</th>
                  <th>Total Hrs</th>
                  <th>Pago</th>
                  <th>Abono</th>
                  <th>Observaciones</th>
                  <th>Firma</th>
                </tr>
              </thead>
              <tbody>
                {empleados.map((empleado, index) => {
                  const nominaEmpleado = nomina[empleado.id] || { dias: {}, totalHoras: 0, pago: 0 };
                  
                  return (
                    <tr key={empleado.id}>
                      <td>{index + 1}</td>
                      <td>{`${empleado.nombre} ${empleado.app} ${empleado.apm}`}</td>

                      {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"].map(
                        (dia) => {
                          const datosDia = nominaEmpleado.dias[dia] || {
                            horas: 0,
                            checked: false,
                          };

                          return (
                            <td key={dia}>
                              <div className="celda-dia">
                                <input
                                  type="checkbox"
                                  checked={datosDia.checked}
                                  disabled={datosDia.disabled}
                                  onChange={(e) =>
                                    manejarCambioDia(
                                      empleado.id,
                                      dia,
                                      "checkbox",
                                      e.target.checked
                                    )
                                  }
                                />
                                <input
                                  type="number"
                                  min="0"
                                  max="24"
                                  step="0.5"
                                  placeholder="hrs"
                                  className="campo-horas"
                                  value={datosDia.checked ? 10 : datosDia.horas || ""}
                                  disabled={datosDia.checked}
                                  onChange={(e) =>
                                    manejarCambioDia(
                                      empleado.id,
                                      dia,
                                      "horas",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            </td>
                          );
                        }
                      )}

                      <td>
                        <strong>{nominaEmpleado.totalHoras}</strong>
                      </td>
                      <td>
                        <input
                          type="number"
                          className="campo-pago"
                          value={nominaEmpleado.pago.toFixed(2)}
                          readOnly
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="campo-abono"
                          placeholder="0.00"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="campo-observaciones"
                          placeholder="Notas..."
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="campo-firma"
                          placeholder="Firma"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="total-nomina">
                  <td colSpan="9"><strong>TOTAL GENERAL</strong></td>
                  <td>
                    <strong>
                      $
                      {Object.values(nomina)
                        .reduce((acc, n) => acc + n.pago, 0)
                        .toFixed(2)}
                    </strong>
                  </td>
                  <td colSpan="3"></td>
                </tr>
              </tfoot>
            </table>

            <div className="botones-nomina">
              <button className="btn-imprimir" onClick={imprimirNomina}>
                🖨️ Imprimir Nómina
              </button>
              <button className="btn-exportar" onClick={exportarExcel}>
                📊 Exportar a Excel
              </button>
            </div>
          </>
        )}
        
{/* ========== REPORTES ========== */}
        {autenticado && seccionActiva === "reportes" && (
          <>
            <h2>📈 Reportes y Análisis</h2>

            <div className="filtros-reporte">
              <div className="campo-filtro">
                <label>Empleado:</label>
                <select
                  value={filtroReporte.empleadoId}
                  onChange={(e) =>
                    setFiltroReporte({
                      ...filtroReporte,
                      empleadoId: e.target.value,
                    })
                  }
                  className="select-filtro"
                >
                  <option value="">Todos los empleados</option>
                  {empleados.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nombre} {emp.app} {emp.apm}
                    </option>
                  ))}
                </select>
              </div>

              <div className="campo-filtro">
                <label>Fecha Inicio:</label>
                <input
                  type="date"
                  value={filtroReporte.fechaInicio}
                  onChange={(e) =>
                    setFiltroReporte({
                      ...filtroReporte,
                      fechaInicio: e.target.value,
                    })
                  }
                />
              </div>

              <div className="campo-filtro">
                <label>Fecha Fin:</label>
                <input
                  type="date"
                  value={filtroReporte.fechaFin}
                  onChange={(e) =>
                    setFiltroReporte({
                      ...filtroReporte,
                      fechaFin: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="botones-exportar">
              <button className="btn-exportar-excel" onClick={exportarExcel}>
                📊 Exportar a Excel
              </button>
              <button className="btn-exportar-pdf" onClick={exportarPDF}>
                📄 Exportar a PDF
              </button>
            </div>

            <div className="resumen-reporte">
              <h3>Resumen del Período</h3>
              <div className="tarjetas-resumen">
                <div className="tarjeta-resumen">
                  <h4>Total Registros</h4>
                  <p className="numero-resumen">
                    {obtenerRegistrosFiltrados().length}
                  </p>
                </div>
                <div className="tarjeta-resumen">
                  <h4>Total Horas</h4>
                  <p className="numero-resumen">
                    {obtenerRegistrosFiltrados()
                      .reduce(
                        (acc, r) => acc + (parseFloat(r.horasTrabajadas) || 0),
                        0
                      )
                      .toFixed(2)}
                  </p>
                </div>
                <div className="tarjeta-resumen">
                  <h4>Total a Pagar</h4>
                  <p className="numero-resumen">
                    $
                    {obtenerRegistrosFiltrados()
                      .reduce((acc, r) => {
                        const empleado = empleados.find(
                          (e) => e.id === r.empleadoId
                        );
                        return (
                          acc +
                          (parseFloat(r.horasTrabajadas) || 0) *
                            (parseFloat(empleado?.pagoHora) || 0)
                        );
                      }, 0)
                      .toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="tabla-reporte">
              <h3>Detalle de Registros</h3>
              <table className="tabla-empleados">
                <thead>
                  <tr>
                    <th>Empleado</th>
                    <th>Fecha</th>
                    <th>Entrada</th>
                    <th>Salida</th>
                    <th>Horas</th>
                    <th>Pago/Hora</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {obtenerRegistrosFiltrados().map((registro) => {
                    const empleado = empleados.find(
                      (e) => e.id === registro.empleadoId
                    );
                    if (!empleado) return null;

                    const total = (
                      parseFloat(registro.horasTrabajadas) *
                      parseFloat(empleado.pagoHora)
                    ).toFixed(2);

                    return (
                      <tr key={registro.id}>
                        <td>{`${empleado.nombre} ${empleado.app} ${empleado.apm}`}</td>
                        <td>
                          {new Date(
                            registro.fechaHoraEntrada
                          ).toLocaleDateString()}
                        </td>
                        <td>{formatearHora(registro.fechaHoraEntrada)}</td>
                        <td>
                          {registro.fechaHoraSalida
                            ? formatearHora(registro.fechaHoraSalida)
                            : "N/A"}
                        </td>
                        <td>{registro.horasTrabajadas || 0} hrs</td>
                        <td>${empleado.pagoHora}</td>
                        <td>${total}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
</main>

      {/* ========== MODAL CAMBIAR CONTRASEÑA ========== */}
      {mostrarCambioContraseña && (
        <div className="modal-overlay" onClick={cerrarCambioContraseña}>
          <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2> Cambiar Contraseña</h2>
              <button className="btn-cerrar-modal" onClick={cerrarCambioContraseña}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="campo-modal">
                <label>Contraseña Actual *</label>
                <div className="input-password-wrapper">
                  <input
                    type={mostrarContraseñaActual ? "text" : "password"}
                    placeholder="Ingresa tu contraseña actual"
                    value={contraseñaActual}
                    onChange={(e) => setContraseñaActual(e.target.value)}
                    className={errorCambioContraseña ? "input-error" : ""}
                  />
                  <button
                    type="button"
                    className="btn-mostrar-password"
                    onClick={() => setMostrarContraseñaActual(!mostrarContraseñaActual)}
                  >
                    {mostrarContraseñaActual ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <div className="campo-modal">
                <label>Nueva Contraseña *</label>
                <div className="input-password-wrapper">
                  <input
                    type={mostrarContraseñaNueva ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={contraseñaNueva}
                    onChange={(e) => setContraseñaNueva(e.target.value)}
                    className={errorCambioContraseña ? "input-error" : ""}
                  />
                  <button
                    type="button"
                    className="btn-mostrar-password"
                    onClick={() => setMostrarContraseñaNueva(!mostrarContraseñaNueva)}
                  >
                    {mostrarContraseñaNueva ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <div className="campo-modal">
                <label>Confirmar Nueva Contraseña *</label>
                <div className="input-password-wrapper">
                  <input
                    type={mostrarContraseñaConfirmar ? "text" : "password"}
                    placeholder="Repite la nueva contraseña"
                    value={contraseñaConfirmar}
                    onChange={(e) => setContraseñaConfirmar(e.target.value)}
                    className={errorCambioContraseña ? "input-error" : ""}
                  />
                  <button
                    type="button"
                    className="btn-mostrar-password"
                    onClick={() => setMostrarContraseñaConfirmar(!mostrarContraseñaConfirmar)}
                  >
                    {mostrarContraseñaConfirmar ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              {errorCambioContraseña && (
                <div className="alerta-error">
                   {errorCambioContraseña}
                </div>
              )}

              <div className="info-contraseña">
                <p> La contraseña debe tener al menos 6 caracteres</p>
                <p> Asegúrate de recordar tu nueva contraseña</p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-modal-restaurar" onClick={restaurarContraseñaPorDefecto}>
                 Restaurar por Defecto
              </button>
              <button className="btn-modal-cancelar" onClick={cerrarCambioContraseña}>
                Cancelar
              </button>
              <button className="btn-modal-guardar" onClick={cambiarContraseña}>
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Empleados;