/**
 * ============================================================================
 * CONTROLADOR PRINCIPAL Y FLUJO DE APLICACIÓN (SPA)
 * Plataforma Corporativa de Capacitación - Conecta Carga
 * Sincronizado exactamente con las pantallas e IDs del index.html
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

    /**
     * Cambia la visibilidad de las pantallas en la SPA.
     * @param {string} idPantalla - ID de la sección a mostrar.
     */
    function mostrarPantalla(idPantalla) {
        PANTALLAS.forEach((id) => {
            const el = document.getElementById(id);
            if (el) {
                if (id === idPantalla) {
                    el.classList.remove('oculta', 'd-none');
                    el.classList.add('activa');
                } else {
                    el.classList.remove('activa');
                    el.classList.add('oculta');
                }
            }
        });

        // Acciones automáticas al ingresar a pantallas específicas
        if (idPantalla === 'pantalla-lectura' && typeof GestorProgreso !== 'undefined') {
            GestorProgreso.iniciarTemporizadorLectura();
        } else if (typeof GestorProgreso !== 'undefined') {
            GestorProgreso.detenerTemporizadorLectura();
        }

        if (idPantalla === 'pantalla-examen' && typeof EvaluacionUI !== 'undefined') {
            EvaluacionUI.renderizarPreguntas();
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * PANTALLA 1: BIENVENIDA
     */
    function configurarBienvenida() {
        const btnIniciar = document.getElementById('btn-iniciar-capacitacion');
        if (btnIniciar) {
            btnIniciar.addEventListener('click', () => {
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
            btnVolver.addEventListener('click', () => {
                mostrarPantalla('pantalla-bienvenida');
            });
        }

        if (formRegistro) {
            formRegistro.addEventListener('submit', async (e) => {
                e.preventDefault();

                const nombreInput = document.getElementById('input-nombre');
                const correoInput = document.getElementById('input-correo');
                const errorNombre = document.getElementById('error-nombre');
                const errorCorreo = document.getElementById('error-correo');
                const alertaFormulario = document.getElementById('alerta-formulario');

                // Ocultar mensajes previos
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

                // Mostrar cargador y validar correo duplicado en Google Sheets
                if (typeof Utilidades !== 'undefined') Utilidades.toggleCargando(true, 'Verificando registro previo...');

                let resultadoVerificacion = { duplicado: false };
                if (typeof SheetsAPI !== 'undefined') {
                    resultadoVerificacion = await SheetsAPI.verificarCorreoDuplicado(correo);
                }

                if (typeof Utilidades !== 'undefined') Utilidades.toggleCargando(false);

                if (resultadoVerificacion.duplicado) {
                    if (alertaFormulario) {
                        alertaFormulario.innerHTML = `<p><strong>Atención:</strong> Este correo ya registró una capacitación el <strong>${resultadoVerificacion.fecha || 'día registrado'}</strong>. No es necesario realizarla nuevamente.</p>`;
                        alertaFormulario.className = 'alert-box alert-warning';
                        alertaFormulario.classList.remove('oculta');
                    }
                    return;
                }

                // Guardar usuario en el estado y pasar a lectura
                if (typeof GestorProgreso !== 'undefined') {
                    GestorProgreso.establecerUsuario(nombre, correo);
                }

                mostrarPantalla('pantalla-lectura');
            });
        }
    }

    /**
     * PANTALLA 3 Y 4: LECTURA Y EXAMEN
     */
    function configurarEventosGenerales() {
        // Escuchar eventos globales de la aplicación si existen en otros módulos
        window.addEventListener('cambioDePantalla', (e) => {
            if (e.detail && e.detail.pantalla) {
                mostrarPantalla(e.detail.pantalla);
            }
        });
    }

    /**
     * PANTALLA 5: CONFIRMACIONES LEGALES
     */
    function configurarConfirmaciones() {
        const checkLectura = document.getElementById('check-lectura');
        const checkComprension = document.getElementById('check-comprension');
        const btnIrFirma = document.getElementById('btn-ir-firma');
        const alertaConfirmaciones = document.getElementById('alerta-confirmaciones');

        function validarChecks() {
            const ambosAceptados = checkLectura && checkLectura.checked && checkComprension && checkComprension.checked;
            if (btnIrFirma) btnIrFirma.disabled = !ambosAceptados;
            if (alertaConfirmaciones) {
                if (ambosAceptados) alertaConfirmaciones.classList.add('oculta');
            }
        }

        if (checkLectura) checkLectura.addEventListener('change', validarChecks);
        if (checkComprension) checkComprension.addEventListener('change', validarChecks);

        if (btnIrFirma) {
            btnIrFirma.addEventListener('click', () => {
                if (checkLectura && checkComprension && checkLectura.checked && checkComprension.checked) {
                    mostrarPantalla('pantalla-firma');
                } else if (alertaConfirmaciones) {
                    alertaConfirmaciones.classList.remove('oculta');
                }
            });
        }
    }

    /**
     * PANTALLA 6: FIRMA DIGITAL Y ENVÍO FINAL
     */
    function configurarFirma() {
        const btnLimpiar = document.getElementById('btn-limpiar-firma');
        const btnVolver = document.getElementById('btn-volver-confirmaciones');
        const btnGuardar = document.getElementById('btn-guardar-capacitacion');
        const errorFirma = document.getElementById('error-firma');

        if (btnVolver) {
            btnVolver.addEventListener('click', () => {
                mostrarPantalla('pantalla-confirmaciones');
            });
        }

        if (btnLimpiar) {
            btnLimpiar.addEventListener('click', () => {
                if (typeof FirmaDigital !== 'undefined') FirmaDigital.limpiar();
            });
        }

        if (btnGuardar) {
            btnGuardar.addEventListener('click', async () => {
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

                if (typeof Utilidades !== 'undefined') Utilidades.toggleCargando(true, 'Guardando registro oficial de capacitación...');

                let resultadoEnvio = { exito: true };
                if (typeof SheetsAPI !== 'undefined') {
                    resultadoEnvio = await SheetsAPI.registrarCapacitacion(payload);
                }

                if (typeof Utilidades !== 'undefined') Utilidades.toggleCargando(false);

                if (resultadoEnvio.exito) {
                    renderizarResumenFinal(payload);
                    mostrarPantalla('pantalla-finalizado');
                } else {
                    if (errorFirma) {
                        errorFirma.textContent = resultadoEnvio.mensaje || 'Error al guardar en el servidor. Por favor reintenta.';
                        errorFirma.classList.remove('oculta');
                    }
                }
            });
        }
    }

    /**
     * PANTALLA 7: RESUMEN FINAL Y REINICIO
     * @param {Object} datos 
     */
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
            btnReiniciar.onclick = () => {
                if (typeof GestorProgreso !== 'undefined') GestorProgreso.reiniciar();
                mostrarPantalla('pantalla-bienvenida');
            };
        }
    }

    /**
     * INICIALIZACIÓN GENERAL DE LA APLICACIÓN
     */
    function inicializarApp() {
        // Inicializar Canvas de firma digital
        if (typeof FirmaDigital !== 'undefined') {
            FirmaDigital.inicializar('canvas-firma');
        }

        // Configurar escuchadores de eventos
        configurarBienvenida();
        configurarFormularioRegistro();
        configurarEventosGenerales();
        configurarConfirmaciones();
        configurarFirma();

        // Mostrar la pantalla inicial de bienvenida
        mostrarPantalla('pantalla-bienvenida');

        // Garantizar que el loader esté oculto al iniciar
        if (typeof Utilidades !== 'undefined') {
            Utilidades.toggleCargando(false);
        }
    }

    // Ejecutar inicio
    inicializarApp();
});
