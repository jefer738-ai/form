/**
 * ============================================================================
 * MÓDULO DE INTEGRACIÓN CON GOOGLE SHEETS (API REST SERVERLESS)
 * Plataforma Corporativa de Capacitación - Conecta Carga
 * ============================================================================
 * 
 * CÓDIGO PARA EL GOOGLE APPS SCRIPT (Code.gs en la consola de Google):
 * ----------------------------------------------------------------------------
 * function doPost(e) {
 *   try {
 *     var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Registros");
 *     var data = JSON.parse(e.postData.contents);
 *     
 *     if (data.action === "verificar") {
 *       var dataRange = sheet.getDataRange().getValues();
 *       var emailBuscado = String(data.correo).toLowerCase().trim();
 *       for (var i = 1; i < dataRange.length; i++) {
 *         if (String(dataRange[i][4]).toLowerCase().trim() === emailBuscado) {
 *           return ContentService.createTextOutput(JSON.stringify({
 *             status: "DUPLICADO",
 *             fecha: dataRange[i][1]
 *           })).setMimeType(ContentService.MimeType.JSON);
 *         }
 *       }
 *       return ContentService.createTextOutput(JSON.stringify({ status: "OK" }))
 *         .setMimeType(ContentService.MimeType.JSON);
 *     }
 *     
 *     if (data.action === "registrar") {
 *       var idUnico = "REG-" + new Date().getTime();
 *       sheet.appendRow([
 *         idUnico,
 *         data.fecha,
 *         data.hora,
 *         data.nombre,
 *         data.correo,
 *         data.tiempoLectura,
 *         data.intentos,
 *         data.errores,
 *         data.checkLectura ? "SI" : "NO",
 *         data.checkComprension ? "SI" : "NO",
 *         data.firmaBase64,
 *         data.navegador,
 *         data.entorno
 *       ]);
 *       return ContentService.createTextOutput(JSON.stringify({ status: "EXITO" }))
 *         .setMimeType(ContentService.MimeType.JSON);
 *     }
 *   } catch (error) {
 *     return ContentService.createTextOutput(JSON.stringify({ status: "ERROR", message: error.toString() }))
 *       .setMimeType(ContentService.MimeType.JSON);
 *   }
 * }
 * ----------------------------------------------------------------------------
 */

const SheetsAPI = (() => {
    'use strict';

    // Constantes de configuración de la API
    const CONFIG_SHEETS = {
        // URL de la Aplicación Web de Google Apps Script publicada
        SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbyOYplzv7m1iVg_kRobOXyF6JJgokksPwjt5lrW74HaBJ38BdTg98VPe7SsuzCh5PtL/exec'
    };

    /**
     * Consulta a Google Sheets si el correo del empleado ya completó la capacitación previamente.
     * @param {string} correo - Correo corporativo del empleado.
     * @returns {Promise<{duplicado: boolean, fecha?: string, error?: boolean, mensaje?: string}>}
     */
    const verificarCorreoDuplicado = async (correo) => {
        // Si no se ha configurado la URL real, permite la simulación de desarrollo de forma segura
        if (CONFIG_SHEETS.SCRIPT_URL.includes('https://script.google.com/macros/s/AKfycbyOYplzv7m1iVg_kRobOXyF6JJgokksPwjt5lrW74HaBJ38BdTg98VPe7SsuzCh5PtL/exec')) {
            console.warn('Google Sheets API: URL de script por defecto detectada. Modo demostración activo.');
            return { duplicado: false };
        }

        try {
            const payload = {
                action: 'verificar',
                correo: correo.trim().toLowerCase()
            };

            const respuesta = await fetch(CONFIG_SHEETS.SCRIPT_URL, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8'
                },
                body: JSON.stringify(payload)
            });

            if (!respuesta.ok) {
                throw new Error(`Error en el servidor de Sheets: ${respuesta.status}`);
            }

            const resultado = await respuesta.json();

            if (resultado.status === 'DUPLICADO') {
                return {
                    duplicado: true,
                    fecha: resultado.fecha || 'previa'
                };
            }

            return { duplicado: false };

        } catch (error) {
            console.error('Error al verificar duplicado en Google Sheets:', error);
            // Retorna un objeto controlado para no bloquear al usuario si falla la conexión temporalmente
            return {
                duplicado: false,
                error: true,
                mensaje: 'No se pudo verificar el historial previo. Se continuará con el registro.'
            };
        }
    };

    /**
     * Envía todos los datos recolectados de la capacitación para guardarlos en Google Sheets.
     * @param {Object} datosCapacitacion - Objeto completo con la información del colaborador y la sesión.
     * @returns {Promise<{exito: boolean, mensaje?: string}>}
     */
    const registrarCapacitacion = async (datosCapacitacion) => {
        // Validación preliminar de datos requeridos
        if (!datosCapacitacion || !datosCapacitacion.correo || !datosCapacitacion.firmaBase64) {
            return { exito: false, mensaje: 'Datos incompletos para registrar en la base de datos.' };
        }

        // Si la URL no está configurada, simula éxito
        if (CONFIG_SHEETS.SCRIPT_URL.includes('https://script.google.com/macros/s/AKfycbyOYplzv7m1iVg_kRobOXyF6JJgokksPwjt5lrW74HaBJ38BdTg98VPe7SsuzCh5PtL/exec')) {
            console.warn('Google Sheets API: Guardado simulado (URL de producción no configurada aún).');
            return new Promise((resolve) => {
                setTimeout(() => resolve({ exito: true }), 1500);
            });
        }

        try {
            const payload = {
                action: 'registrar',
                nombre: datosCapacitacion.nombre,
                correo: datosCapacitacion.correo,
                fecha: datosCapacitacion.fecha || Utilidades.obtenerFechaActual(),
                hora: datosCapacitacion.hora || Utilidades.obtenerHoraActual(),
                tiempoLectura: datosCapacitacion.tiempoLectura || 0,
                intentos: datosCapacitacion.intentos || 1,
                errores: datosCapacitacion.errores || 0,
                checkLectura: datosCapacitacion.checkLectura || false,
                checkComprension: datosCapacitacion.checkComprension || false,
                firmaBase64: datosCapacitacion.firmaBase64,
                navegador: Utilidades.detectarNavegador(),
                entorno: Utilidades.detectarEntornoDispositivo()
            };

            const respuesta = await fetch(CONFIG_SHEETS.SCRIPT_URL, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8'
                },
                body: JSON.stringify(payload)
            });

            if (!respuesta.ok) {
                throw new Error(`Error HTTP en el servidor: ${respuesta.status}`);
            }

            const resultado = await respuesta.json();

            if (resultado.status === 'EXITO') {
                return { exito: true };
            } else {
                throw new Error(resultado.message || 'Respuesta no exitosa del backend.');
            }

        } catch (error) {
            console.error('Error al registrar la capacitación en Google Sheets:', error);
            return {
                exito: false,
                mensaje: 'Error de conexión con la base de datos. Por favor, reintenta guardar.'
            };
        }
    };

    // API Pública del Módulo
    return {
        CONFIG_SHEETS,
        verificarCorreoDuplicado,
        registrarCapacitacion
    };
})();
