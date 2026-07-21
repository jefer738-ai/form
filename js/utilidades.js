/**
 * ============================================================================
 * MÓDULO DE UTILIDADES GENERALES
 * Plataforma Corporativa de Capacitación - Conecta Carga
 * ============================================================================
 */

const Utilidades = (() => {
    'use strict';

    /**
     * Valida si una cadena cumple con la estructura estándar de correo electrónico.
     * @param {string} email - Correo a validar.
     * @returns {boolean} True si es válido, False en caso contrario.
     */
    const validarCorreo = (email) => {
        if (!email || typeof email !== 'string') return false;
        const regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regexCorreo.test(email.trim());
    };

    /**
     * Obtiene la fecha actual formateada en español (DD/MM/AAAA).
     * @returns {string} Fecha formateada.
     */
    const obtenerFechaActual = () => {
        const ahora = new Date();
        const dia = String(ahora.getDate()).padStart(2, '0');
        const mes = String(ahora.getMonth() + 1).padStart(2, '0');
        const anio = ahora.getFullYear();
        return `${dia}/${mes}/${anio}`;
    };

    /**
     * Obtiene la hora actual formateada en formato 24 horas (HH:MM:SS).
     * @returns {string} Hora formateada.
     */
    const obtenerHoraActual = () => {
        const ahora = new Date();
        const horas = String(ahora.getHours()).padStart(2, '0');
        const minutos = String(ahora.getMinutes()).padStart(2, '0');
        const segundos = String(ahora.getSeconds()).padStart(2, '0');
        return `${horas}:${minutos}:${segundos}`;
    };

    /**
     * Detecta el navegador web que está utilizando el usuario a partir del UserAgent.
     * @returns {string} Nombre y versión aproximada del navegador.
     */
    const detectarNavegador = () => {
        const ua = navigator.userAgent;
        let navegador = "Navegador Desconocido";

        if (ua.includes("Firefox/") && !ua.includes("Seamonkey/")) {
            navegador = "Mozilla Firefox";
        } else if (ua.includes("Edg/")) {
            navegador = "Microsoft Edge";
        } else if (ua.includes("Chrome/") && !ua.includes("Chromium/")) {
            navegador = "Google Chrome";
        } else if (ua.includes("Safari/") && !ua.includes("Chrome/")) {
            navegador = "Apple Safari";
        } else if (ua.includes("OPR/") || ua.includes("Opera/")) {
            navegador = "Opera";
        }

        return navegador;
    };

    /**
     * Detecta el sistema operativo y la resolución de pantalla del dispositivo.
     * @returns {string} Cadena con Sistema Operativo y Resolución de Pantalla.
     */
    const detectarEntornoDispositivo = () => {
        const ua = navigator.userAgent;
        let so = "SO Desconocido";

        if (ua.includes("Win")) so = "Windows";
        else if (ua.includes("Mac")) so = "macOS";
        else if (ua.includes("Linux")) so = "Linux";
        else if (ua.includes("Android")) so = "Android";
        else if (ua.includes("iPhone") || ua.includes("iPad")) so = "iOS";

        const ancho = window.screen.width || window.innerWidth;
        const alto = window.screen.height || window.innerHeight;
        const resolucion = `${ancho}x${alto}`;

        return `${so} (${resolucion})`;
    };

    /**
     * Convierte un valor en segundos a un formato legible de minutos y segundos.
     * @param {number} segundosTotales - Segundos a convertir.
     * @returns {string} Texto formateado ej: "2m 15s".
     */
    const formatearTiempo = (segundosTotales) => {
        const seg = Math.max(0, parseInt(segundosTotales, 10) || 0);
        const minutos = Math.floor(seg / 60);
        const segundos = seg % 60;
        
        if (minutos === 0) {
            return `${segundos}s`;
        }
        return `${minutos}m ${segundos}s`;
    };

    /**
     * Muestra u oculta el overlay global de carga con un mensaje personalizado.
     * @param {boolean} mostrar - True para mostrar, False para ocultar.
     * @param {string} [mensaje="Procesando información..."] - Mensaje a desplegar.
     */
    const toggleCargando = (mostrar, mensaje = "Procesando información...") => {
        const overlay = document.getElementById('loader-overlay');
        const textoOverlay = document.getElementById('loader-message');

        if (!overlay) return;

        if (textoOverlay && mensaje) {
            textoOverlay.textContent = mensaje;
        }

        if (mostrar) {
            overlay.classList.remove('d-none');
        } else {
            overlay.classList.add('d-none');
        }
    };

    /**
     * Sanitiza texto para evitar inyecciones HTML simples en renderizados dinámicos.
     * @param {string} texto - Cadena a sanitizar.
     * @returns {string} Cadena sanitizada.
     */
    const sanitizarHTML = (texto) => {
        if (!texto) return '';
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    };

    // API Pública del Módulo
    return {
        validarCorreo,
        obtenerFechaActual,
        obtenerHoraActual,
        detectarNavegador,
        detectarEntornoDispositivo,
        formatearTiempo,
        toggleCargando,
        sanitizarHTML
    };
})();
