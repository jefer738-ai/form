/**
 * ============================================================================
 * CONTROLADOR PRINCIPAL Y FLUJO DE APLICACIÓN (SPA)
 * Plataforma Corporativa de Capacitación - Conecta Carga
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Mapeo estricto de pantallas de la aplicación por ID
  const PANTALLAS = [
    'pantalla-bienvenida',
    'pantalla-formulario',
    'pantalla-lectura',
    'pantalla-examen',
    'pantalla-confirmaciones',
    'pantalla-firma',
    'pantalla-finalizado'
  ];

  // Estado del bloque de lectura actual
  let bloqueActual = 1;
  const TOTAL_BLOQUES = 5;

  /**
   * Cambia la visibilidad de las pantallas en la SPA de forma segura.
   * @param {string} idPantalla - ID de la sección a mostrar.
   */
  function mostrarPantalla(idPantalla) {
    PANTALLAS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        if (id === idPantalla) {
          el.classList.remove('oculta', 'd-none');
          el.classList.add('activa');
          el.style.display = 'block';
        } else {
          el.classList.remove('activa');
          el.classList.add('oculta');
          el.style.display = 'none';
        }
      }
    });

    // Acciones automáticas al ingresar a pantallas específicas
    if (idPantalla === 'pantalla-lectura') {
      if (typeof GestorProgreso !== 'undefined') {
        GestorProgreso.iniciarTemporizadorLectura();
      }
    } else if (typeof GestorProgreso !== 'undefined') {
      GestorProgreso.detenerTemporizadorLectura();
    }

    if (idPantalla === 'pantalla-examen' && typeof EvaluacionUI !== 'undefined') {
      EvaluacionUI.renderizarPreguntas();
    }

    if (idPantalla === 'pantalla-firma' && typeof FirmaDigital !== 'undefined') {
      try {
        FirmaDigital.inicializar('canvas-firma');
      } catch (err) {
        console.warn('No se pudo inicializar el canvas de firma al mostrar pantalla:', err);
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * PANTALLA 1: BIENVENIDA
   */
  function configurarBienvenida() {
    const btnIniciar = document.getElementById('btn-iniciar-capacitacion');
    if (btnIniciar) {
      btnIniciar.addEventListener('click', (e) => {
        e.preventDefault();
        mostrarPantalla('pantalla-formulario');
      });
    }
  }

  /**
   * PANTALLA 2: FORMULARIO DE REGISTRO
   */
  function configurarFormularioRegistro() {
    const formRegistro = document.getElementById('form-datos-empleado');
    const btnVolver = document.getElementById('btn-volver-bienvenida');

    if (btnVolver) {
      btnVolver.addEventListener('click', (e) => {
        e.preventDefault();
        mostrarPantalla('pantalla-bienvenida');
      });
    }

    if (formRegistro) {
      formRegistro.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btnSubmit = formRegistro.querySelector('button[type="submit"]');
        const nombreInput = document.getElementById('input-nombre');
        const correoInput = document.getElementById('input-correo');
        const errorNombre = document.getElementById('error-nombre');
        const errorCorreo = document.getElementById('error-correo');
        const alertaFormulario = document.getElementById('alerta-formulario');

        if (errorNombre) errorNombre.classList.add('oculta');
        if (errorCorreo) errorCorreo.classList.add('oculta');
        if (alertaFormulario) alertaFormulario.classList.add('oculta');

        const nombre = nombreInput ? nombreInput.value.trim() : '';
        const correo = correoInput ? correoInput.value.trim() : '';

        let tieneErrores = false;

        if (!nombre || nombre.length < 3) {
          if (errorNombre) errorNombre.classList.remove('oculta');
          tieneErrores = true;
        }

        const correoValido = typeof Utilidades !== 'undefined'
          ? Utilidades.validarCorreo(correo)
          : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

        if (!correo || !correoValido) {
          if (errorCorreo) errorCorreo.classList.remove('oculta');
          tieneErrores = true;
        }

        if (tieneErrores) return;

        if (btnSubmit) btnSubmit.disabled = true;
        if (typeof Utilidades !== 'undefined') Utilidades.toggleCargando(true, 'Verificando registro previo...');

        try {
          let resultadoVerificacion = { duplicado: false };
          if (typeof SheetsAPI !== 'undefined') {
            resultadoVerificacion = await SheetsAPI.verificarCorreoDuplicado(correo);
          }

          if (resultadoVerificacion.duplicado) {
            if (alertaFormulario) {
              alertaFormulario.innerHTML = `<p><strong>Atención:</strong> Este correo ya registró una capacitación el <strong>${resultadoVerificacion.fecha || 'día registrado'}</strong>. No es necesario realizarla nuevamente.</p>`;
              alertaFormulario.className = 'alert-box alert-warning';
              alertaFormulario.classList.remove('oculta');
            }
            return;
          }

          if (typeof GestorProgreso !== 'undefined') {
            GestorProgreso.establecerUsuario(nombre, correo);
          }

          mostrarPantalla('pantalla-lectura');
        } catch (err) {
          console.error('Error al verificar correo duplicado:', err);
          if (alertaFormulario) {
            alertaFormulario.innerHTML = '<p><strong>Error:</strong> Ocurrió un problema de conexión al verificar tus datos. Por favor, intenta de nuevo.</p>';
            alertaFormulario.className = 'alert-box alert-danger';
            alertaFormulario.classList.remove('oculta');
          }
        } finally {
          if (btnSubmit) btnSubmit.disabled = false;
          if (typeof Utilidades !== 'undefined') Utilidades.toggleCargando(false);
        }
      });
    }
  }

  /**
   * PANTALLA 3: NAVEGACIÓN DE LECTURA POR BLOQUES (LA FUNCIÓN QUE FALTABA)
   */
  function configurarLectura() {
    const btnContinuar = document.getElementById('btn-lectura-continuar');
    const btnAnterior = document.getElementById('btn-lectura-anterior');

    if (btnContinuar) {
      btnContinuar.addEventListener('click', (e) => {
        e.preventDefault();

        if (bloqueActual < TOTAL_BLOQUES) {
          // Ocultar bloque actual
          const elActual = document.getElementById(`bloque-${bloqueActual}`);
          if (elActual) {
            elActual.classList.add('oculta');
            elActual.style.display = 'none';
          }

          bloqueActual++;

          // Mostrar bloque siguiente
          const elSiguiente = document.getElementById(`bloque-${bloqueActual}`);
          if (elSiguiente) {
            elSiguiente.classList.remove('oculta');
            elSiguiente.style.display = 'block';
          }

          actualizarNavegacionLectura();
        } else {
          // Al superar el bloque 5, pasa al examen
          mostrarPantalla('pantalla-examen');
        }
      });
    }

    if (btnAnterior) {
      btnAnterior.addEventListener('click', (e) => {
        e.preventDefault();

        if (bloqueActual > 1) {
          const elActual = document.getElementById(`bloque-${bloqueActual}`);
          if (elActual) {
            elActual.classList.add('oculta');
            elActual.style.display = 'none';
          }

          bloqueActual--;

          const elAnterior = document.getElementById(`bloque-${bloqueActual}`);
          if (elAnterior) {
            elAnterior.classList.remove('oculta');
            elAnterior.style.display = 'block';
          }

          actualizarNavegacionLectura();
        }
      });
    }
  }

  function actualizarNavegacionLectura() {
    const indicador = document.getElementById('bloque-indicador');
    const barra = document.getElementById('lectura-barra-relleno');
    const btnContinuar = document.getElementById('btn-lectura-continuar');
    const btnAnterior = document.getElementById('btn-lectura-anterior');

    if (indicador) {
      indicador.textContent = `Bloque ${bloqueActual} de ${TOTAL_BLOQUES}`;
    }

    if (barra) {
      barra.style.width = `${(bloqueActual / TOTAL_BLOQUES) * 100}%`;
    }

    if (btnAnterior) {
      btnAnterior.disabled = (bloqueActual === 1);
    }

    if (btnContinuar) {
      btnContinuar.textContent = (bloqueActual === TOTAL_BLOQUES) ? 'Ir a la Evaluación' : 'Continuar Lectura';
    }
  }

  function configurarEventosGenerales() {
    window.addEventListener('cambioDePantalla', (e) => {
      if (e.detail && e.detail.pantalla) {
        mostrarPantalla(e.detail.pantalla);
      }
    });

    document.addEventListener('click', (e) => {
      if (e.target && e.target.closest('#btn-iniciar-capacitacion')) {
        e.preventDefault();
        mostrarPantalla('pantalla-formulario');
      }
    });
  }

  function configurarConfirmaciones() {
    const checkLectura = document.getElementById('check-lectura');
    const checkComprension = document.getElementById('check-comprension');
    const btnIrFirma = document.getElementById('btn-ir-firma');
    const alertaConfirmaciones = document.getElementById('alerta-confirmaciones');

    function validarChecks() {
      const ambosAceptados = checkLectura && checkLectura.checked && checkComprension && checkComprension.checked;
      if (btnIrFirma) btnIrFirma.disabled = !ambosAceptados;
      if (alertaConfirmaciones && ambosAceptados) {
        alertaConfirmaciones.classList.add('oculta');
      }
    }

    if (checkLectura) checkLectura.addEventListener('change', validarChecks);
    if (checkComprension) checkComprension.addEventListener('change', validarChecks);

    if (btnIrFirma) {
      btnIrFirma.addEventListener('click', (e) => {
        e.preventDefault();
        if (checkLectura && checkComprension && checkLectura.checked && checkComprension.checked) {
          mostrarPantalla('pantalla-firma');
        } else if (alertaConfirmaciones) {
          alertaConfirmaciones.classList.remove('oculta');
        }
      });
    }
  }

  function configurarFirma() {
    const btnLimpiar = document.getElementById('btn-limpiar-firma');
    const btnVolver = document.getElementById('btn-volver-confirmaciones');
    const btnGuardar = document.getElementById('btn-guardar-capacitacion');
    const errorFirma = document.getElementById('error-firma');

    if (btnVolver) {
      btnVolver.addEventListener('click', (e) => {
        e.preventDefault();
        mostrarPantalla('pantalla-confirmaciones');
      });
    }

    if (btnLimpiar) {
      btnLimpiar.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof FirmaDigital !== 'undefined') FirmaDigital.limpiar();
      });
    }

    if (btnGuardar) {
      btnGuardar.addEventListener('click', async (e) => {
        e.preventDefault();
        if (errorFirma) errorFirma.classList.add('oculta');

        if (typeof FirmaDigital !== 'undefined' && !FirmaDigital.esValida()) {
          if (errorFirma) {
            errorFirma.textContent = 'Debes realizar tu firma digital antes de guardar y finalizar la capacitación.';
            errorFirma.classList.remove('oculta');
          }
          return;
        }

        const firmaBase64 = typeof FirmaDigital !== 'undefined' ? FirmaDigital.obtenerBase64() : '';
        const estado = typeof GestorProgreso !== 'undefined' ? GestorProgreso.obtenerEstado() : {};

        const payload = {
          nombre: (estado.datosUsuario && estado.datosUsuario.nombre) || document.getElementById('input-nombre')?.value || 'N/A',
          correo: (estado.datosUsuario && estado.datosUsuario.correo) || document.getElementById('input-correo')?.value || 'N/A',
          fecha: typeof Utilidades !== 'undefined' ? Utilidades.obtenerFechaActual() : new Date().toLocaleDateString('es-CO'),
          hora: typeof Utilidades !== 'undefined' ? Utilidades.obtenerHoraActual() : new Date().toLocaleTimeString('es-CO'),
          tiempoLectura: estado.tiempoLecturaSegundos || 0,
          intentos: estado.intentosEvaluacion || 1,
          errores: estado.erroresAcumulados || 0,
          firmaBase64: firmaBase64
        };

        btnGuardar.disabled = true;
        if (typeof Utilidades !== 'undefined') Utilidades.toggleCargando(true, 'Guardando registro oficial de capacitación...');

        try {
          let resultadoEnvio = { exito: true };
          if (typeof SheetsAPI !== 'undefined') {
            resultadoEnvio = await SheetsAPI.registrarCapacitacion(payload);
          }

          if (resultadoEnvio && resultadoEnvio.exito) {
            renderizarResumenFinal(payload);
            mostrarPantalla('pantalla-finalizado');
          } else {
            if (errorFirma) {
              errorFirma.textContent = (resultadoEnvio && resultadoEnvio.mensaje) || 'Error al guardar en el servidor. Por favor reintenta.';
              errorFirma.classList.remove('oculta');
            }
          }
        } catch (err) {
          console.error('Error al registrar la capacitación:', err);
          if (errorFirma) {
            errorFirma.textContent = 'Ocurrió un fallo de conexión al enviar el registro. Inténtalo de nuevo.';
            errorFirma.classList.remove('oculta');
          }
        } finally {
          btnGuardar.disabled = false;
          if (typeof Utilidades !== 'undefined') Utilidades.toggleCargando(false);
        }
      });
    }
  }

  function renderizarResumenFinal(datos) {
    const elNombre = document.getElementById('resumen-nombre');
    const elCorreo = document.getElementById('resumen-correo');
    const elFecha = document.getElementById('resumen-fecha');
    const elTiempo = document.getElementById('resumen-tiempo');
    const elIntentos = document.getElementById('resumen-intentos');

    if (elNombre) elNombre.textContent = datos.nombre;
    if (elCorreo) elCorreo.textContent = datos.correo;
    if (elFecha) elFecha.textContent = `${datos.fecha} - ${datos.hora}`;
    if (elTiempo) elTiempo.textContent = typeof Utilidades !== 'undefined' ? Utilidades.formatearTiempo(datos.tiempoLectura) : `${datos.tiempoLectura} seg`;
    if (elIntentos) elIntentos.textContent = datos.intentos;

    const btnReiniciar = document.getElementById('btn-reiniciar-portal');
    if (btnReiniciar) {
      btnReiniciar.onclick = (e) => {
        e.preventDefault();

        bloqueActual = 1;
        if (typeof GestorProgreso !== 'undefined') GestorProgreso.reiniciar();

        const formRegistro = document.getElementById('form-datos-empleado');
        if (formRegistro) formRegistro.reset();

        const checkLectura = document.getElementById('check-lectura');
        const checkComprension = document.getElementById('check-comprension');
        const btnIrFirma = document.getElementById('btn-ir-firma');

        if (checkLectura) checkLectura.checked = false;
        if (checkComprension) checkComprension.checked = false;
        if (btnIrFirma) btnIrFirma.disabled = true;

        if (typeof FirmaDigital !== 'undefined') FirmaDigital.limpiar();

        mostrarPantalla('pantalla-bienvenida');
      };
    }
  }

  /**
   * INICIALIZACIÓN SEGURA DE LA APLICACIÓN
   */
  function inicializarApp() {
    try { configurarBienvenida(); } catch (e) { console.error('Error en bienvenida:', e); }
    try { configurarFormularioRegistro(); } catch (e) { console.error('Error en formulario:', e); }
    try { configurarLectura(); } catch (e) { console.error('Error en lectura:', e); }
    try { configurarEventosGenerales(); } catch (e) { console.error('Error en eventos generales:', e); }
    try { configurarConfirmaciones(); } catch (e) { console.error('Error en confirmaciones:', e); }
    try { configurarFirma(); } catch (e) { console.error('Error en firma:', e); }

    if (typeof FirmaDigital !== 'undefined') {
      try {
        FirmaDigital.inicializar('canvas-firma');
      } catch (err) {
        console.warn('No se pudo inicializar canvas al arrancar:', err);
      }
    }

    mostrarPantalla('pantalla-bienvenida');

    if (typeof Utilidades !== 'undefined') {
      Utilidades.toggleCargando(false);
    }
  }

  // Arrancar aplicación
  inicializarApp();
});
