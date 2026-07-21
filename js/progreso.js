/**
 * ============================================================================
 * GESTOR DE PROGRESO Y TEMPORIZADORES
 * Plataforma Corporativa de Capacitación - Conecta Carga
 * ============================================================================
 */

const GestorProgreso = (function () {
    'use strict';

    // Configuración general
    const TIEMPO_REQUERIDO_SEGUNDOS = 10; // Segundos mínimos de permanencia

    // Estado interno del usuario
    let datosUsuario = { nombre: '', correo: '' };
    let tiempoLecturaSegundos = 0;
    let temporizadorLectura = null;
    let intentosEvaluacion = 1;
    let erroresAcumulados = 0;

    /**
     * Busca el botón de continuar lectura probando los IDs más comunes
     */
    function obtenerBotonContinuar() {
        return document.getElementById('btn-continuar-lectura') || 
               document.getElementById('btn-siguiente-lectura') || 
               document.getElementById('btn-ir-examen');
    }

    return {
        /**
         * Registra los datos del empleado
         */
        establecerUsuario: function (nombre, correo) {
            datosUsuario = { nombre, correo };
        },

        /**
         * Inicia el temporizador de lectura y actualiza el estado del botón en tiempo real
         */
        iniciarTemporizadorLectura: function () {
            // Detener cualquier temporizador activo previo para evitar duplicados
            this.detenerTemporizadorLectura();

            const btnContinuar = obtenerBotonContinuar();

            // Deshabilitar botón inicialmente
            if (btnContinuar) {
                btnContinuar.disabled = true;
                btnContinuar.classList.add('disabled');
            }

            temporizadorLectura = setInterval(() => {
                tiempoLecturaSegundos++;

                const segundosRestantes = TIEMPO_REQUERIDO_SEGUNDOS - tiempoLecturaSegundos;
                const btn = obtenerBotonContinuar();

                if (btn) {
                    if (segundosRestantes > 0) {
                        // Feedback visual mientras cuenta
                        btn.textContent = `Continuar (${segundosRestantes}s)`;
                        btn.disabled = true;
                        btn.classList.add('disabled');
                    } else {
                        // Habilitar botón al cumplir el tiempo
                        btn.disabled = false;
                        btn.classList.remove('disabled');
                        btn.textContent = 'Continuar a la Evaluación';
                    }
                }
            }, 1000);
        },

        /**
         * Detiene el intervalo del reloj
         */
        detenerTemporizadorLectura: function () {
            if (temporizadorLectura) {
                clearInterval(temporizadorLectura);
                temporizadorLectura = null;
            }
        },

        /**
         * Incrementa e informa intentos en la evaluación
         */
        registrarIntento: function () {
            intentosEvaluacion++;
        },

        registrarError: function () {
            erroresAcumulados++;
        },

        /**
         * Retorna todo el estado acopiado
         */
        obtenerEstado: function () {
            return {
                datosUsuario,
                tiempoLecturaSegundos,
                intentosEvaluacion,
                erroresAcumulados
            };
        },

        /**
         * Reinicia el estado para una nueva capacitación
         */
        reiniciar: function () {
            this.detenerTemporizadorLectura();
            tiempoLecturaSegundos = 0;
            intentosEvaluacion = 1;
            erroresAcumulados = 0;
            datosUsuario = { nombre: '', correo: '' };
        }
    };
})();
