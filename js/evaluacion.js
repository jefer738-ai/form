/**
 * ============================================================================
 * MÓDULO DE INTERFAZ DE EVALUACIÓN
 * Plataforma Corporativa de Capacitación - Conecta Carga
 * ============================================================================
 */

const EvaluacionUI = (() => {
    'use strict';

    // Estado local de respuestas seleccionadas { preguntaId: indiceOpcion }
    let respuestasSeleccionadas = {};

    /**
     * Carga y renderiza dinámicamente las preguntas en el contenedor DOM.
     */
    const renderizarPreguntas = () => {
        const contenedor = document.getElementById('contenedor-preguntas');
        if (!contenedor) return;

        const preguntas = BancoPreguntas.obtenerPreguntas();
        respuestasSeleccionadas = {}; // Limpiar respuestas previas

        let html = '';

        preguntas.forEach((p, idx) => {
            html += `
                <div class="card-pregunta mb-4 p-4 border rounded shadow-sm bg-white" data-pregunta-id="${p.id}">
                    <h5 class="fw-bold text-dark mb-3">
                        <span class="badge bg-primary me-2">${idx + 1}</span> ${Utilidades.sanitizarHTML(p.pregunta)}
                    </h5>
                    <div class="opciones-container d-flex flex-column gap-2">
            `;

            p.opciones.forEach((opcion, opcIdx) => {
                html += `
                    <label class="opcion-item p-3 border rounded cursor-pointer transition-all d-flex align-items-center">
                        <input type="radio" 
                               name="pregunta_${p.id}" 
                               value="${opcIdx}" 
                               class="form-check-input me-3"
                               onchange="EvaluacionUI.registrarRespuesta(${p.id}, ${opcIdx})">
                        <span>${Utilidades.sanitizarHTML(opcion)}</span>
                    </label>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        });

        contenedor.innerHTML = html;
        actualizarEstadoBotonEnviar();
    };

    /**
     * Registra la selección del usuario para una pregunta específica.
     * @param {number} preguntaId 
     * @param {number} opcionIdx 
     */
    const registrarRespuesta = (preguntaId, opcionIdx) => {
        respuestasSeleccionadas[preguntaId] = parseInt(opcionIdx, 10);
        actualizarEstadoBotonEnviar();
    };

    /**
     * Evalúa si todas las preguntas han sido respondidas para activar el botón de envío.
     */
    const actualizarEstadoBotonEnviar = () => {
        const btnEnviar = document.getElementById('btn-enviar-evaluacion');
        if (!btnEnviar) return;

        const totalPreguntas = BancoPreguntas.obtenerTotalPreguntas();
        const respuestasCompletadas = Object.keys(respuestasSeleccionadas).length;

        btnEnviar.disabled = respuestasCompletadas < totalPreguntas;
    };

    /**
     * Procesa la evaluación final, comunica el resultado al gestor de progreso y renderiza la retroalimentación.
     */
    const procesarEvaluacion = () => {
        const resultado = BancoPreguntas.evaluarRespuestas(respuestasSeleccionadas);
        
        // Registrar en el estado global
        GestorProgreso.registrarIntentoEvaluacion(resultado.aprobado, resultado.errores);

        const contenedorResultado = document.getElementById('resultado-evaluacion');
        if (!contenedorResultado) return;

        contenedorResultado.classList.remove('d-none', 'alert-success', 'alert-danger');

        if (resultado.aprobado) {
            contenedorResultado.classList.add('alert', 'alert-success');
            contenedorResultado.innerHTML = `
                <div class="d-flex align-items-center">
                    <i class="bi bi-check-circle-fill fs-2 me-3 text-success"></i>
                    <div>
                        <h4 class="alert-heading fw-bold mb-1">¡Evaluación Aprobada!</h4>
                        <p class="mb-0">Obtuviste <strong>${resultado.aciertos} de ${resultado.totalPreguntas}</strong> aciertos (${resultado.porcentaje}%). Puedes proceder a la firma de conformidad.</p>
                    </div>
                </div>
            `;

            // Habilitar botón para ir a la pantalla de Firma
            const btnSiguiente = document.getElementById('btn-ir-firma');
            if (btnSiguiente) btnSiguiente.classList.remove('d-none');

            // Deshabilitar edición de respuestas
            bloquearFormulario();

        } else {
            contenedorResultado.classList.add('alert', 'alert-danger');
            contenedorResultado.innerHTML = `
                <div class="d-flex align-items-center mb-2">
                    <i class="bi bi-x-circle-fill fs-2 me-3 text-danger"></i>
                    <div>
                        <h4 class="alert-heading fw-bold mb-1">Puntaje Insuficiente</h4>
                        <p class="mb-0">Obtuviste <strong>${resultado.aciertos} de ${resultado.totalPreguntas}</strong> aciertos (${resultado.porcentaje}%). Se requiere mínimo un 80% para aprobar.</p>
                    </div>
                </div>
                <hr>
                <p class="small mb-0">Por favor, repasa el material de capacitación y vuelve a intentarlo.</p>
            `;

            const btnReintentar = document.getElementById('btn-reintentar-evaluacion');
            if (btnReintentar) btnReintentar.classList.remove('d-none');
        }

        contenedorResultado.scrollIntoView({ behavior: 'smooth' });
    };

    /**
     * Inhabilita las opciones de respuesta tras aprobar.
     */
    const bloquearFormulario = () => {
        const inputs = document.querySelectorAll('#contenedor-preguntas input[type="radio"]');
        inputs.forEach(input => input.disabled = true);
        
        const btnEnviar = document.getElementById('btn-enviar-evaluacion');
        if (btnEnviar) btnEnviar.classList.add('d-none');
    };

    /**
     * Reinicia la evaluación para permitir un nuevo intento.
     */
    const reiniciarEvaluacion = () => {
        respuestasSeleccionadas = {};
        
        const contenedorResultado = document.getElementById('resultado-evaluacion');
        if (contenedorResultado) contenedorResultado.classList.add('d-none');

        const btnReintentar = document.getElementById('btn-reintentar-evaluacion');
        if (btnReintentar) btnReintentar.classList.add('d-none');

        const btnEnviar = document.getElementById('btn-enviar-evaluacion');
        if (btnEnviar) {
            btnEnviar.classList.remove('d-none');
            btnEnviar.disabled = true;
        }

        renderizarPreguntas();
    };

    // API Pública
    return {
        renderizarPreguntas,
        registrarRespuesta,
        procesarEvaluacion,
        reiniciarEvaluacion
    };
})();
