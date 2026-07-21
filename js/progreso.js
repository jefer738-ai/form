/**
 * ============================================================================
 * MÓDULO DE GESTIÓN DE ESTADO Y PROGRESO
 * Plataforma Corporativa de Capacitación - Conecta Carga
 * ============================================================================
 */

const GestorProgreso = (() => {
    'use strict';

    const CLAVE_LOCALSTORAGE = 'conecta_carga_capacitacion_state';

    // Estado inicial por defecto
    const estadoInicial = {
        pasoActual: 1, // 1: Registro, 2: Lectura/Capacitación, 3: Evaluación, 4: Firma, 5: Completado
        datosUsuario: {
            nombre: '',
            correo: ''
        },
        tiempoLecturaSegundos: 0,
        lecturaCompletada: false,
        intentosEvaluacion: 0,
        erroresAcumulados: 0,
        evaluacionAprobada: false,
        comprensionAceptada: false,
        firmaBase64: null,
        fechaInicio: null,
        fechaFinalizacion: null
    };

    // Objeto reactivo en memoria
    let estado = { ...estadoInicial };
    let intervaloTemporizador = null;

    /**
     * Inicializa o recupera el estado desde LocalStorage.
     */
    const inicializar = () => {
        const guardado = localStorage.getItem(CLAVE_LOCALSTORAGE);
        if (guardado) {
            try {
                estado = { ...estadoInicial, ...JSON.parse(guardado) };
            } catch (e) {
                console.warn('Error al restaurar el estado previo, iniciando desde cero.', e);
                estado = { ...estadoInicial };
            }
        }
    };

    /**
     * Sincroniza el estado actual con LocalStorage.
     */
    const guardarEnStorage = () => {
        try {
            localStorage.setItem(CLAVE_LOCALSTORAGE, JSON.stringify(estado));
        } catch (e) {
            console.error('No se pudo guardar el progreso en el almacenamiento local:', e);
        }
    };

    /**
     * Registra los datos iniciales del usuario.
     * @param {string} nombre 
     * @param {string} correo 
     */
    const establecerUsuario = (nombre, correo) => {
        estado.datosUsuario.nombre = nombre.trim();
        estado.datosUsuario.correo = correo.trim().toLowerCase();
        if (!estado.fechaInicio) {
            estado.fechaInicio = new Date().toISOString();
        }
        guardarEnStorage();
    };

    /**
     * Inicia el temporizador de tiempo de lectura.
     */
    const iniciarTemporizadorLectura = () => {
        if (intervaloTemporizador) return; // Evitar múltiples intervalos
        
        intervaloTemporizador = setInterval(() => {
            estado.tiempoLecturaSegundos += 1;
            
            // Disparar un evento personalizado para actualizar el contador en la UI
            window.dispatchEvent(new CustomEvent('tiempoLecturaActualizado', {
                detail: { segundos: estado.tiempoLecturaSegundos }
            }));

            // Guardar en storage cada 10 segundos
            if (estado.tiempoLecturaSegundos % 10 === 0) {
                guardarEnStorage();
            }
        }, 1000);
    };

    /**
     * Detiene el temporizador de lectura.
     */
    const detenerTemporizadorLectura = () => {
        if (intervaloTemporizador) {
            clearInterval(intervaloTemporizador);
            intervaloTemporizador = null;
            guardarEnStorage();
        }
    };

    /**
     * Incrementa los intentos de la evaluación y acumula fallos si existen.
     * @param {boolean} fueAprobado 
     * @param {number} erroresEnIntento 
     */
    const registrarIntentoEvaluacion = (fueAprobado, erroresEnIntento = 0) => {
        estado.intentosEvaluacion += 1;
        estado.erroresAcumulados += erroresEnIntento;
        estado.evaluacionAprobada = fueAprobado;
        guardarEnStorage();
    };

    /**
     * Establece el estado de lectura completada.
     * @param {boolean} completado 
     */
    const setLecturaCompletada = (completado) => {
        estado.lecturaCompletada = completado;
        guardarEnStorage();
    };

    /**
     * Guarda la firma en formato Base64.
     * @param {string} base64 
     */
    const guardarFirma = (base64) => {
        estado.firmaBase64 = base64;
        estado.comprensionAceptada = true;
        estado.fechaFinalizacion = new Date().toISOString();
        guardarEnStorage();
    };

    /**
     * Cambia la pantalla/paso activo de la aplicación.
     * @param {number} nuevoPaso 
     */
    const cambiarPaso = (nuevoPaso) => {
        estado.pasoActual = nuevoPaso;
        guardarEnStorage();
        
        window.dispatchEvent(new CustomEvent('cambioDePaso', {
            detail: { paso: nuevoPaso }
        }));
    };

    /**
     * Obtiene una copia completa del estado actual.
     * @returns {Object}
     */
    const obtenerEstado = () => {
        return { ...estado };
    };

    /**
     * Reinicia por completo la sesión (limpia LocalStorage).
     */
    const reiniciarTodo = () => {
        detenerTemporizadorLectura();
        estado = { ...estadoInicial };
        localStorage.removeItem(CLAVE_LOCALSTORAGE);
    };

    // Auto-inicialización al cargar
    inicializar();

    // API Pública
    return {
        establecerUsuario,
        iniciarTemporizadorLectura,
        detenerTemporizadorLectura,
        registrarIntentoEvaluacion,
        setLecturaCompletada,
        guardarFirma,
        cambiarPaso,
        obtenerEstado,
        reiniciarTodo
    };
})();
