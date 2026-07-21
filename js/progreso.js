/**
 * ============================================================================
 * GESTOR DE PROGRESO Y TEMPORIZADORES
 * Plataforma Corporativa de Capacitación - Conecta Carga
 * ============================================================================
 */

const GestorProgreso = (function () {
    'use strict';

    // Estado interno del usuario
    let datosUsuario = { nombre: '', correo: '' };
    let tiempoLecturaSegundos = 0;
    let temporizadorLectura = null;
    let intentosEvaluacion = 1;
    let erroresAcumulados = 0;

    /**
     * Captura los elementos HTML con los IDs exactos del index.html
     */
    function obtenerBotonContinuar() {
        return document.getElementById('btn-lectura-continuar');
    }

    function obtenerElementoTiempo() {
        return document.getElementById('tiempo-restante');
    }

    return {
        /**
         * Registra los datos del empleado
         */
        establecerUsuario: function (nombre, correo) {
            datosUsuario = { nombre, correo };
        },

        /**
         * Inicia el temporizador de lectura para el bloque activo
         * @param {number} tiempoRequerido - Segundos requeridos (por defecto 10)
         */
        iniciarTemporizadorLectura: function (tiempoRequerido = 10) {
            this.detenerTemporizadorLectura();
            tiempoLecturaSegundos = 0;

            const btnContinuar = obtenerBotonContinuar();
            const elemTiempo = obtenerElementoTiempo();

            // Bloquear botón al iniciar
            if (btnContinuar) {
                btnContinuar.disabled = true;
                btnContinuar.classList.add('disabled');
                btnContinuar.textContent = `Continuar Lectura (${tiempoRequerido}s)`;
            }

            if (elemTiempo) {
                elemTiempo.textContent = `Tiempo mínimo: ${tiempoRequerido}s`;
            }

            temporizadorLectura = setInterval(() => {
                tiempoLecturaSegundos++;
                const segundosRestantes = tiempoRequerido - tiempoLecturaSegundos;
                const btn = obtenerBotonContinuar();
                const elem = obtenerElementoTiempo();

                if (segundosRestantes > 0) {
                    // Actualizar el estado visual segundo a segundo
                    if (btn) {
                        btn.disabled = true;
                        btn.classList.add('disabled');
                        btn.textContent = `Continuar Lectura (${segundosRestantes}s)`;
                    }
                    if (elem) {
                        elem.textContent = `Tiempo mínimo: ${segundosRestantes}s`;
                    }
                } else {
                    // Habilitar botón al finalizar el tiempo
                    if (btn) {
                        btn.disabled = false;
                        btn.classList.remove('disabled');
                        btn.textContent = 'Continuar Lectura';
                    }
                    if (elem) {
                        elem.textContent = '¡Lectura completada!';
                    }
                    this.detenerTemporizadorLectura();
                }
            }, 1000);
        },

        /**
         * Detiene el contador de tiempo
         */
        detenerTemporizadorLectura: function () {
            if (temporizadorLectura) {
                clearInterval(temporizadorLectura);
                temporizadorLectura = null;
            }
        },

        registrarIntento: function () {
            intentosEvaluacion++;
        },

        registrarError: function () {
            erroresAcumulados++;
        },

        obtenerEstado: function () {
            return {
                datosUsuario,
                tiempoLecturaSegundos,
                intentosEvaluacion,
                erroresAcumulados
            };
        },

        reiniciar: function () {
            this.detenerTemporizadorLectura();
            tiempoLecturaSegundos = 0;
            intentosEvaluacion = 1;
            erroresAcumulados = 0;
            datosUsuario = { nombre: '', correo: '' };
        }
    };
})();
