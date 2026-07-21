/**
 * ============================================================================
 * CONTROLADOR PRINCIPAL Y FLUJO DE APLICACIÓN
 * Plataforma Corporativa de Capacitación - Conecta Carga
 * ============================================================================
 */

/**
 * ============================================================================
 * CONTROLADOR PRINCIPAL Y FLUJO DE APLICACIÓN
 * Plataforma Corporativa de Capacitación - Conecta Carga
 * ============================================================================
 */

(() => {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        // Referencias a las vistas/pasos en el DOM
        const pasos = {
            1: document.getElementById('paso-registro'),
            2: document.getElementById('paso-lectura'),
            3: document.getElementById('paso-evaluacion'),
            4: document.getElementById('paso-firma'),
            5: document.getElementById('paso-completado')
        };

        const inicializarApp = () => {
            configurarNavegacionPasoAPaso();
            configurarFormularioRegistro();
            configurarLectorCapacitacion();
            configurarEvaluacionEventos();
            configurarFirmaEventos();

            FirmaDigital.inicializar('canvas-firma');

            const estadoActual = GestorProgreso.obtenerEstado();
            mostrarPaso(estadoActual.pasoActual || 1);

            Utilidades.toggleCargando(false);
        };

        // ... resto de las funciones auxiliares (mostrarPaso, configurarNavegacionPasoAPaso, etc.) ...

        inicializarApp();
    });
})();
    const mostrarPaso = (numeroPaso) => {
        Object.keys(pasos).forEach((pKey) => {
            if (pasos[pKey]) {
                if (parseInt(pKey, 10) === numeroPaso) {
                    pasos[pKey].classList.remove('d-none');
                } else {
                    pasos[pKey].classList.add('d-none');
                }
            }
        });

        // Acciones específicas al entrar a cada paso
        if (numeroPaso === 2) {
            GestorProgreso.iniciarTemporizadorLectura();
        } else {
            GestorProgreso.detenerTemporizadorLectura();
        }

        if (numeroPaso === 3) {
            EvaluacionUI.renderizarPreguntas();
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    /**
     * Vincula el evento de cambio de paso emitido por el GestorProgreso.
     */
    const configurarNavegacionPasoAPaso = () => {
        window.addEventListener('cambioDePaso', (e) => {
            mostrarPaso(e.detail.paso);
        });

        // Evento de actualización del reloj de lectura
        window.addEventListener('tiempoLecturaActualizado', (e) => {
            const contadorEl = document.getElementById('contador-tiempo-lectura');
            if (contadorEl) {
                contadorEl.textContent = Utilidades.formatearTiempo(e.detail.segundos);
            }
        });
    };

    /**
     * Gestiona el registro inicial e integra la verificación de correo duplicado en Google Sheets.
     */
    const configurarFormularioRegistro = () => {
        const formRegistro = document.getElementById('form-registro-colaborador');
        if (!formRegistro) return;

        formRegistro.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nombreInput = document.getElementById('reg-nombre');
            const correoInput = document.getElementById('reg-correo');
            const errorMsg = document.getElementById('reg-error-msg');

            const nombre = nombreInput ? nombreInput.value.trim() : '';
            const correo = correoInput ? correoInput.value.trim() : '';

            if (errorMsg) errorMsg.classList.add('d-none');

            if (!nombre || !Utilidades.validarCorreo(correo)) {
                if (errorMsg) {
                    errorMsg.textContent = 'Por favor, ingresa un nombre válido y un correo electrónico corporativo correcto.';
                    errorMsg.classList.remove('d-none');
                }
                return;
            }

            Utilidades.toggleCargando(true, 'Verificando registro previo...');

            // Consultar a Google Sheets si el correo ya realizó la capacitación
            const resultadoVerificacion = await SheetsAPI.verificarCorreoDuplicado(correo);
            Utilidades.toggleCargando(false);

            if (resultadoVerificacion.duplicado) {
                if (errorMsg) {
                    errorMsg.textContent = `Este correo ya registró una capacitación el ${resultadoVerificacion.fecha}. No es necesario realizarla nuevamente.`;
                    errorMsg.classList.remove('d-none');
                }
                return;
            }

            // Registrar usuario en estado local y pasar a lectura
            GestorProgreso.establecerUsuario(nombre, correo);
            GestorProgreso.cambiarPaso(2);
        });
    };

    /**
     * Configura la verificación de lectura obligatoria del material.
     */
    const configurarLectorCapacitacion = () => {
        const btnEntendido = document.getElementById('btn-confirmar-lectura');
        const checkLectura = document.getElementById('check-confirmacion-lectura');

        if (checkLectura && btnEntendido) {
            checkLectura.addEventListener('change', () => {
                btnEntendido.disabled = !checkLectura.checked;
            });
        }

        if (btnEntendido) {
            btnEntendido.addEventListener('click', () => {
                GestorProgreso.setLecturaCompletada(true);
                GestorProgreso.cambiarPaso(3);
            });
        }
    };

    /**
     * Vincula los botones de acción de la evaluación.
     */
    const configurarEvaluacionEventos = () => {
        const btnEnviar = document.getElementById('btn-enviar-evaluacion');
        const btnReintentar = document.getElementById('btn-reintentar-evaluacion');
        const btnIrFirma = document.getElementById('btn-ir-firma');

        if (btnEnviar) {
            btnEnviar.addEventListener('click', () => {
                EvaluacionUI.procesarEvaluacion();
            });
        }

        if (btnReintentar) {
            btnReintentar.addEventListener('click', () => {
                EvaluacionUI.reiniciarEvaluacion();
            });
        }

        if (btnIrFirma) {
            btnIrFirma.addEventListener('click', () => {
                GestorProgreso.cambiarPaso(4);
            });
        }
    };

    /**
     * Configura el lienzo de firma, checkboxes de conformidad y el envío final de datos.
     */
    const configurarFirmaEventos = () => {
        const btnLimpiar = document.getElementById('btn-limpiar-firma');
        const checkComprension = document.getElementById('check-declaracion-comprension');
        const btnFinalizar = document.getElementById('btn-finalizar-capacitacion');
        const errorFirmaMsg = document.getElementById('firma-error-msg');

        if (btnLimpiar) {
            btnLimpiar.addEventListener('click', () => {
                FirmaDigital.limpiar();
            });
        }

        if (btnFinalizar) {
            btnFinalizar.addEventListener('click', async () => {
                if (errorFirmaMsg) errorFirmaMsg.classList.add('d-none');

                if (!FirmaDigital.esValida()) {
                    if (errorFirmaMsg) {
                        errorFirmaMsg.textContent = 'Por favor, dibuje su firma manuscrita en el recuadro antes de continuar.';
                        errorFirmaMsg.classList.remove('d-none');
                    }
                    return;
                }

                if (checkComprension && !checkComprension.checked) {
                    if (errorFirmaMsg) {
                        errorFirmaMsg.textContent = 'Debe declarar que ha leído y comprendido todo el material aceptando el término.';
                        errorFirmaMsg.classList.remove('d-none');
                    }
                    return;
                }

                // Extraer la firma e integrar en el estado
                const firmaBase64 = FirmaDigital.obtenerBase64();
                GestorProgreso.guardarFirma(firmaBase64);

                const estadoCompleto = GestorProgreso.obtenerEstado();

                const payloadEnvio = {
                    nombre: estadoCompleto.datosUsuario.nombre,
                    correo: estadoCompleto.datosUsuario.correo,
                    fecha: Utilidades.obtenerFechaActual(),
                    hora: Utilidades.obtenerHoraActual(),
                    tiempoLectura: estadoCompleto.tiempoLecturaSegundos,
                    intentos: estadoCompleto.intentosEvaluacion,
                    errores: estadoCompleto.erroresAcumulados,
                    checkLectura: estadoCompleto.lecturaCompletada,
                    checkComprension: estadoCompleto.comprensionAceptada,
                    firmaBase64: estadoCompleto.firmaBase64
                };

                Utilidades.toggleCargando(true, 'Guardando registro oficial de capacitación...');

                const resultadoEnvio = await SheetsAPI.registrarCapacitacion(payloadEnvio);

                Utilidades.toggleCargando(false);

                if (resultadoEnvio.exito) {
                    GestorProgreso.cambiarPaso(5);
                    renderizarResumenFinal(payloadEnvio);
                } else {
                    if (errorFirmaMsg) {
                        errorFirmaMsg.textContent = resultadoEnvio.mensaje || 'Error al guardar la información. Por favor, reintente.';
                        errorFirmaMsg.classList.remove('d-none');
                    }
                }
            });
        }
    };

    /**
     * Renderiza el comprobante final de conclusión exitosa.
     * @param {Object} datos 
     */
    const renderizarResumenFinal = (datos) => {
        const contenedorResumen = document.getElementById('resumen-comprobante');
        if (!contenedorResumen) return;

        contenedorResumen.innerHTML = `
            <div class="card border-success p-4 shadow-sm bg-light">
                <h5 class="fw-bold text-success mb-3"><i class="bi bi-shield-check me-2"></i>Comprobante Digital de Registro</h5>
                <ul class="list-group list-group-flush mb-3">
                    <li class="list-group-item bg-transparent"><strong>Colaborador:</strong> ${Utilidades.sanitizarHTML(datos.nombre)}</li>
                    <li class="list-group-item bg-transparent"><strong>Correo:</strong> ${Utilidades.sanitizarHTML(datos.correo)}</li>
                    <li class="list-group-item bg-transparent"><strong>Fecha / Hora:</strong> ${datos.fecha} a las ${datos.hora}</li>
                    <li class="list-group-item bg-transparent"><strong>Tiempo de Lectura:</strong> ${Utilidades.formatearTiempo(datos.tiempoLectura)}</li>
                    <li class="list-group-item bg-transparent"><strong>Estado de Evaluación:</strong> <span class="badge bg-success">Aprobado</span></li>
                </ul>
                <div class="text-center mt-2">
                    <p class="small text-muted mb-1">Firma digital registrada:</p>
                    <img src="${datos.firmaBase64}" alt="Firma Registrada" class="border p-2 rounded bg-white" style="max-height: 100px;">
                </div>
            </div>
        `;
    };

    // Restaurar estado si existía una sesión previa
    const estadoActual = GestorProgreso.obtenerEstado();
    mostrarPaso(estadoActual.pasoActual || 1);

    // AGREGAR ESTA LÍNEA: Asegura que el loader se oculte al cargar
    Utilidades.toggleCargando(false);
};
});
