/**
 * ============================================================================
 * BANCO DE PREGUNTAS Y EVALUACIÓN
 * Plataforma Corporativa de Capacitación - Conecta Carga
 * ============================================================================
 */

const BancoPreguntas = (() => {
    'use strict';

    /**
     * Lista de preguntas con sus respectivas opciones y respuestas correctas.
     */
    const preguntas = [
        {
            id: 1,
            pregunta: "¿Cuál es el tiempo máximo de conducción continua permitido antes de realizar una pausa activa obligatoria?",
            opciones: [
                "2 horas continuas",
                "4 horas continuas",
                "6 horas continuas",
                "8 horas continuas"
            ],
            correcta: 1, // Índice de '4 horas continuas'
            explicacion: "Por normativa de seguridad vial en Conecta Carga, se exige una pausa de al menos 25 minutos por cada 4 horas de conducción."
        },
        {
            id: 2,
            pregunta: "En caso de detectar una anomalía mecánica leve durante el viaje, ¿cuál es el protocolo correcto a seguir?",
            opciones: [
                "Continuar la marcha hasta el destino final si el vehículo sigue andando",
                "Estacionar en un lugar seguro, señalizar y reportar de inmediato a la Central de Operaciones",
                "Intentar reparar el vehículo personalmente sin avisar a soporte",
                "Pedir ayuda a cualquier vehículo particular que pase por la vía"
            ],
            correcta: 1,
            explicacion: "La seguridad es la prioridad. Se debe asegurar la zona con conos/triángulos y notificar a la Central de Operaciones."
        },
        {
            id: 3,
            pregunta: "¿Qué documento es INDISPENSABLE para la entrega válida de mercancía al cliente final?",
            opciones: [
                "La fotocopia de la cédula del conductor",
                "El tiquete de combustible del viaje",
                "El manifiesto de carga firmado y sellado (o firma digital de recibido)",
                "La tarjeta de propiedad del camión"
            ],
            correcta: 2,
            explicacion: "El manifiesto o guía de transporte legalmente firmado valida la entrega conforme de los bienes."
        },
        {
            id: 4,
            pregunta: "¿Cuál es la distancia mínima de seguridad que debe mantenerse con el vehículo delantero en carretera seca?",
            opciones: [
                "10 metros",
                "20 metros",
                "50 metros (o regla de los 3 segundos)",
                "100 metros obligatorios siempre"
            ],
            correcta: 2,
            explicacion: "Mantener 50 metros o aplicar la regla de los 3 segundos permite reaccionar a tiempo ante frenadas de emergencia."
        },
        {
            id: 5,
            pregunta: "¿Qué acción está estrictamente PROHIBIDA durante el cargue y descargue de mercancía pesada?",
            opciones: [
                "Usar calzado de seguridad con puntera",
                "Permanecer dentro de la zona de maniobra de la montacargas",
                "Inspeccionar el estado del trincado de la carga",
                "Verificar los precintos de seguridad del contenedor"
            ],
            correcta: 1,
            explicacion: "Está totalmente prohibido que el personal a pie permanezca en el radio de giro u operación de la maquinaria de carga."
        }
    ];

    /**
     * Retorna una copia profunda del banco de preguntas.
     * @returns {Array<Object>}
     */
    const obtenerPreguntas = () => {
        return JSON.parse(JSON.stringify(preguntas));
    };

    /**
     * Retorna la cantidad total de preguntas.
     * @returns {number}
     */
    const obtenerTotalPreguntas = () => {
        return preguntas.length;
    };

    /**
     * Valida un conjunto de respuestas enviadas por el usuario.
     * @param {Object} respuestasUsuario - Objeto con par {preguntaId: opcionSeleccionadaIndex}
     * @returns {Object} Resultado con puntaje, aciertos, errores y detalle.
     */
    const evaluarRespuestas = (respuestasUsuario) => {
        let aciertos = 0;
        let errores = 0;
        const detalle = [];

        preguntas.forEach((p) => {
            const respuestaSeleccionada = respuestasUsuario[p.id];
            const esCorrecta = respuestaSeleccionada === p.correcta;

            if (esCorrecta) {
                aciertos++;
            } else {
                errores++;
            }

            detalle.push({
                preguntaId: p.id,
                preguntaTexto: p.pregunta,
                correcta: esCorrecta,
                opcionSeleccionada: respuestaSeleccionada,
                opcionCorrecta: p.correcta,
                explicacion: p.explicacion
            });
        });

        const porcentaje = Math.round((aciertos / preguntas.length) * 100);
        const aprobado = porcentaje >= 80; // Requiere mínimo 80% para aprobar (4/5)

        return {
            totalPreguntas: preguntas.length,
            aciertos,
            errores,
            porcentaje,
            aprobado,
            detalle
        };
    };

    // API Pública
    return {
        obtenerPreguntas,
        obtenerTotalPreguntas,
        evaluarRespuestas
    };
})();
