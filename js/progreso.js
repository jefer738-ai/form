/**
 * ============================================================================
 * GESTOR DE PROGRESO (Versión Simplificada MVP - Sin Temporizadores)
 * Plataforma Corporativa de Capacitación - Conecta Carga
 * ============================================================================
 */

const GestorProgreso = (function () {
    'use strict';

    let datosUsuario = { nombre: '', correo: '' };
    let intentosEvaluacion = 1;
    let erroresAcumulados = 0;

    return {
        establecerUsuario: function (nombre, correo) {
            datosUsuario = { nombre, correo };
        },

        // Habilita el botón inmediatamente sin esperar nada
        iniciarTemporizadorLectura: function () {
            const btnContinuar = document.getElementById('btn-lectura-continuar');
            if (btnContinuar) {
                btnContinuar.disabled = false;
                btnContinuar.classList.remove('disabled');
                btnContinuar.textContent = 'Continuar Lectura';
            }
        },

        detenerTemporizadorLectura: function () {
            // Vacío para mantener compatibilidad con main.js
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
                tiempoLecturaSegundos: 0,
                intentosEvaluacion,
                erroresAcumulados
            };
        },

        reiniciar: function () {
            intentosEvaluacion = 1;
            erroresAcumulados = 0;
            datosUsuario = { nombre: '', correo: '' };
        }
    };
})();
