/**
 * ============================================================================
 * MÓDULO DE FIRMA DIGITAL (CANVAS HTML5)
 * Plataforma Corporativa de Capacitación - Conecta Carga
 * ============================================================================
 */

const FirmaDigital = (() => {
    'use strict';

    let canvas = null;
    let ctx = null;
    let dibujando = false;
    let tieneTrazo = false;

    /**
     * Inicializa el lienzo de firma y sus escuchadores de eventos.
     * @param {string} canvasId - ID del elemento canvas en el DOM.
     */
    const inicializar = (canvasId) => {
        canvas = document.getElementById(canvasId);
        if (!canvas) return;

        ctx = canvas.getContext('2d');
        
        // Ajustar resolución interna del canvas al tamaño visual
        redimensionarCanvas();
        window.addEventListener('resize', redimensionarCanvas);

        // Configuración del trazo
        ctx.strokeStyle = '#0d6efd'; // Color de firma azul corporativo
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Eventos de Ratón (Escritorio)
        canvas.addEventListener('mousedown', empezarDibujo);
        canvas.addEventListener('mousemove', dibujar);
        canvas.addEventListener('mouseup', terminarDibujo);
        canvas.addEventListener('mouseleave', terminarDibujo);

        // Eventos Táctiles (Móviles / Tablets)
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
        }, { passive: false });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
        }, { passive: false });

        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            canvas.dispatchEvent(mouseEvent);
        }, { passive: false });
    };

    /**
     * Ajusta las dimensiones internas del canvas para mantener proporción visual clara.
     */
    const redimensionarCanvas = () => {
        if (!canvas || !ctx) return;

        // Guardar contenido previo antes de redimensionar si es necesario
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(canvas, 0, 0);

        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width || 500;
        canvas.height = rect.height || 200;

        // Reaplicar estilos de trazo tras redimensionar
        ctx.strokeStyle = '#0d6efd';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (tieneTrazo) {
            ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
        }
    };

    /**
     * Obtiene las coordenadas relativas del evento respecto al canvas.
     */
    const obtenerPosicion = (e) => {
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const empezarDibujo = (e) => {
        dibujando = true;
        const pos = obtenerPosicion(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
    };

    const dibujar = (e) => {
        if (!dibujando) return;
        const pos = obtenerPosicion(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        tieneTrazo = true;
    };

    const terminarDibujo = () => {
        if (dibujando) {
            ctx.closePath();
            dibujando = false;
        }
    };

    /**
     * Borra el contenido completo del lienzo y reinicia el estado.
     */
    const limpiar = () => {
        if (!canvas || !ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        tieneTrazo = false;
    };

    /**
     * Evalúa si el usuario ha realizado al menos un trazo válido.
     * @returns {boolean}
     */
    const esValida = () => {
        return tieneTrazo;
    };

    /**
     * Exporta el contenido del canvas a formato Base64 PNG.
     * @returns {string|null} Cadena Base64 o null si está vacío.
     */
    const obtenerBase64 = () => {
        if (!tieneTrazo || !canvas) return null;
        return canvas.toDataURL('image/png');
    };

    // API Pública
    return {
        inicializar,
        limpiar,
        esValida,
        obtenerBase64
    };
})();
