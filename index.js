require("dotenv").config();

const express = require("express");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PORT = process.env.PORT || 8080;

const SYSTEM_PROMPT = `
Eres Adri, asistente de Glow Beauty Academy.

Tu trabajo es responder por WhatsApp las dudas de personas interesadas en Glow Nails — Programa de Uñas desde Cero.

PERSONALIDAD Y TONO:
- Habla de forma amable, cercana, respetuosa y humana.
- Nunca suenes robótica.
- Responde de manera breve, clara y útil.
- Utiliza máximo uno o dos párrafos cortos.
- Utiliza emojis de forma moderada y natural para que los mensajes se vean agradables en WhatsApp.
- Utiliza *negritas de WhatsApp* para destacar información importante como el nombre del programa, precio, modalidad, beneficios y métodos de pago.
- Organiza visualmente la información cuando ayude a que el mensaje sea más fácil de leer.
- No presiones a la persona para comprar.
- No hagas preguntas abiertas innecesarias.
- Varía ligeramente la redacción sin alterar el significado de la información oficial.

REGLAS IMPORTANTES:
- Nunca inventes información.
- Utiliza exclusivamente la información oficial incluida en esta base de conocimiento.
- No agregues productos, precios, beneficios, garantías, condiciones, promociones o métodos de pago que no estén indicados aquí.
- No contradigas los precios, condiciones, entregas o características oficiales.
- No asegures algo que no aparezca en esta información.
- Si una persona pregunta algo para lo que no existe información suficiente, responde de manera natural que necesitas confirmar ese dato con el equipo.
- No presentes el Certificado de Participación como una certificación oficial.
- No prometas ingresos ni resultados económicos garantizados.
- No afirmes que existe un examen o evaluación, porque Glow Nails no incluye examen.
- No inventes fechas ni horarios de inicio.
- No menciones paquetes, promociones o precios distintos al precio oficial de Glow Nails indicado en esta base de conocimiento.
- No menciones información interna del negocio, automatizaciones, ManyChat, n8n, Supabase, Railway, GitHub ni procesos técnicos.

INFORMACIÓN OFICIAL DEL NEGOCIO:

NEGOCIO:
Glow Beauty Academy.

PRODUCTO:
Glow Nails — Programa de Uñas desde Cero.

TIPO DE PRODUCTO:
Formación 100% digital y online, principalmente dirigida a personas que desean aprender uñas desde cero.

PRECIO:
El precio promocional de Glow Nails es de $99 MXN.

MÉTODOS DE PAGO:
- Transferencia bancaria.
- Depósito en efectivo en OXXO.

CLASES:
Glow Nails incluye 50 clases pregrabadas paso a paso.
Las clases son 100% online.
No son presenciales.
No existe una fecha fija de inicio.
Una vez confirmado el pago, la persona recibe sus accesos y puede comenzar de inmediato.
Puede estudiar cuando quiera, a su propio ritmo, y volver a consultar las clases cuando lo necesite.

CONTENIDO PRINCIPAL:
Las clases incluyen diferentes técnicas y contenidos de uñas, entre ellos preparación de las uñas, esmaltado semipermanente, capping, acrílico, moldes esculturales, tips, encapsulados, Baby Boomer, Ombré o Baby Color, Acrygel, Polygel, gel, Dual System, nivelación, uso de torno, Soft Gel, manicura rusa o combinada, retirado, higiene, desinfección y diferentes técnicas y diseños de Nail Art.

RECURSOS Y BONOS INCLUIDOS:
- Más de 200 diseños y ejercicios de práctica Glow Nails.
- Biblioteca Complementaria de Manicure.
- Curso de Pedicure de regalo.
- Ruta de Aprendizaje.
- Certificado de Participación Glow Nails.
- Acceso digital de por vida.

PRÁCTICA:
Glow Nails está enfocado en aprender y practicar.
Los materiales y ejercicios permiten practicar y desarrollar las habilidades paso a paso.
No incluye examen.

EXPERIENCIA:
Glow Nails está pensado principalmente para personas que desean aprender desde cero.
No es necesario tener experiencia previa para comenzar.

CERTIFICADO:
Glow Nails incluye un Certificado de Participación.
Nunca debes presentarlo como una certificación oficial.

ENTREGA Y ACCESO:
La entrega es 100% digital.
Una vez confirmado el pago, la persona recibe por WhatsApp los accesos a sus clases y materiales.
Puede comenzar de inmediato y estudiar en línea a su propio ritmo.
Las clases son pregrabadas.

OBJETIVO DE LA CONVERSACIÓN:
Tu prioridad es resolver correctamente la duda de la persona.

Cuando después de resolver la duda resulte apropiado avanzar al siguiente paso, NO preguntes si la persona quiere conocer los métodos de pago.

Debes presentar directamente las dos opciones disponibles y preguntarle cuál prefiere.

El cierre correcto debe seguir esta lógica:

💖 *Los métodos de pago disponibles son:*
🏦 *Transferencia bancaria*
🏪 *Depósito en OXXO*

¿Cuál de las dos opciones prefieres? 😊

Puedes variar ligeramente la redacción, pero SIEMPRE debes:
1. Informar directamente que existen las opciones de Transferencia bancaria y depósito en OXXO.
2. Preguntar cuál de las dos opciones prefiere.
3. Nunca preguntar "¿Quieres que te comparta los métodos de pago?", "¿Quieres conocer las formas de pago?" ni expresiones similares.

El cierre debe sentirse como una continuación natural de la conversación y nunca como presión de venta.

Si necesitas confirmar un dato con el equipo porque no aparece en esta base de conocimiento, NO agregues un cierre de pago. Primero indica que ese dato necesita ser confirmado.

Utiliza únicamente esta base de conocimiento para responder.
`;

function normalizarTexto(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function elegirAleatoria(opciones) {
  return opciones[Math.floor(Math.random() * opciones.length)];
}

function limpiarRespuesta(texto) {
  return String(texto || "")
    .trim()
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n");
}

function cierreComercial() {
  const cierres = [
    `💖 *Los métodos de pago disponibles son:*\n🏦 *Transferencia bancaria*\n🏪 *Depósito en OXXO*\n\n¿Cuál de las dos opciones prefieres? 😊`,

    `✨ Para comenzar puedes elegir entre:\n🏦 *Transferencia bancaria*\n🏪 *Depósito en OXXO*\n\n¿Cuál opción prefieres? 💖`,

    `💕 Puedes realizar tu pago mediante:\n🏦 *Transferencia bancaria*\n🏪 *Depósito en OXXO*\n\n¿Cuál de las dos opciones prefieres? 😊`,
  ];

  return elegirAleatoria(cierres);
}

function debeAgregarCierre(textoNormalizado) {
  const palabrasComerciales = [
    "precio",
    "inicio",
    "cuantas",
    "presencial",
    "recibo",
    "certificado",
    "examen",
    "experiencia",
    "incluye",
    "pagar",
    "costo",
    "cuesta",
    "comprar",
    "pago",
    "transferencia",
    "oxxo",
    "curso",
    "clases",
    "acceso",
  ];

  return palabrasComerciales.some((palabra) =>
    textoNormalizado.includes(palabra)
  );
}

function agregarCierre(texto, textoNormalizado) {
  const limpio = limpiarRespuesta(texto);

  if (!limpio) {
    return cierreComercial();
  }

  if (!debeAgregarCierre(textoNormalizado)) {
    return limpio;
  }

  return `${limpio}\n\n${cierreComercial()}`;
}

function respuestaDirecta(textoNormalizado) {

  // 1. PRECIO
  if (textoNormalizado.includes("precio")) {
    const respuestas = [
      `💅✨ El precio promocional de *Glow Nails — Programa de Uñas desde Cero* es de solo *$99 MXN*. 💖`,

      `💖 Actualmente puedes acceder a *Glow Nails — Programa de Uñas desde Cero* por un precio promocional de *$99 MXN*. 💅✨`,

      `✨ *Glow Nails — Programa de Uñas desde Cero* está disponible por solo *$99 MXN*. 💅💕`,
    ];

    return {
      intencion: "precio",
      respuesta: agregarCierre(
        elegirAleatoria(respuestas),
        textoNormalizado
      ),
    };
  }

  // 2. FECHA DE INICIO
  if (textoNormalizado.includes("inicio")) {
    const respuestas = [
      `💅✨ *Glow Nails no tiene una fecha fija de inicio*, porque las clases son *100% online y pregrabadas*.\n\nApenas confirmemos tu pago, te enviaremos tus accesos para que puedas comenzar y estudiar *cuando tú quieras y a tu propio ritmo*. 💖`,

      `✨ No tienes que esperar una fecha para comenzar. *Glow Nails es 100% online y las clases son pregrabadas.* 💅\n\nUna vez confirmado tu pago, recibirás tus accesos y podrás comenzar de inmediato, avanzando *a tu propio ritmo*. 💕`,

      `💖 Puedes comenzar *Glow Nails* en cuanto recibas tus accesos. Las clases son *100% online y pregrabadas*, por lo que no existe una fecha fija de inicio ni tienes que conectarte en un horario determinado. 💅✨\n\nPodrás estudiar cuando quieras y avanzar a tu propio ritmo.`,
    ];

    return {
      intencion: "inicio_clases",
      respuesta: agregarCierre(
        elegirAleatoria(respuestas),
        textoNormalizado
      ),
    };
  }

  // 3. CANTIDAD DE CLASES
  if (textoNormalizado.includes("cuantas")) {
    const respuestas = [
      `💅✨ *Glow Nails incluye 50 clases pregrabadas paso a paso* que puedes estudiar a tu propio ritmo.\n\nAdemás, recibes tus *materiales de práctica, bonos y recursos complementarios* para seguir aprendiendo y practicando. 💖`,

      `✨ El programa principal *Glow Nails cuenta con 50 clases pregrabadas*. 💅\n\nTambién tendrás acceso a tus *materiales de práctica y recursos complementarios* incluidos en tu formación. 💕`,

      `💖 Tendrás acceso a *50 clases pregrabadas de Glow Nails*, además de todos tus *materiales de práctica y recursos complementarios*. 💅✨`,
    ];

    return {
      intencion: "cantidad_clases",
      respuesta: agregarCierre(
        elegirAleatoria(respuestas),
        textoNormalizado
      ),
    };
  }

  // 4. PRESENCIAL / ONLINE
  if (textoNormalizado.includes("presencial")) {
    const respuestas = [
      `💅✨ *Glow Nails no es presencial.* La formación es *100% online* y todas las clases son pregrabadas.\n\nAsí puedes estudiar desde donde estés, cuando quieras y *a tu propio ritmo*. 💖`,

      `💖 Las clases son *100% online y pregrabadas*, por lo que no necesitas asistir presencialmente ni conectarte en un horario específico. 💅✨`,

      `✨ *Glow Nails se realiza completamente en línea.* Las clases son pregrabadas y puedes avanzar a tu propio ritmo desde donde te encuentres. 💕`,
    ];

    return {
      intencion: "modalidad_clases",
      respuesta: agregarCierre(
        elegirAleatoria(respuestas),
        textoNormalizado
      ),
    };
  }

  // 5. ENTREGA / ACCESO
  if (textoNormalizado.includes("recibo")) {
    const respuestas = [
      `💖 La entrega de *Glow Nails es 100% digital*. 📲✨\n\nUna vez confirmado tu pago, recibirás por WhatsApp *tus accesos a las clases y a todos tus materiales* para que puedas comenzar. 💅`,

      `✨ Una vez confirmado tu pago, recibirás directamente por WhatsApp *los accesos a tus clases y materiales*. 📲💅\n\nTodo es *100% digital* y podrás estudiar a tu propio ritmo. 💖`,

      `💅💕 Tu acceso se entrega de forma *100% digital*. Después de confirmar tu pago recibirás por WhatsApp tus accesos a *Glow Nails y todos los materiales incluidos*. ✨`,
    ];

    return {
      intencion: "entrega_acceso",
      respuesta: agregarCierre(
        elegirAleatoria(respuestas),
        textoNormalizado
      ),
    };
  }

  // 6. CERTIFICADO
  if (textoNormalizado.includes("certificado")) {
    const respuestas = [
      `📜✨ Sí, *Glow Nails incluye tu Certificado de Participación* una vez que completes tu formación. 💅💖`,

      `💖 ¡Sí! Dentro de *Glow Nails* está incluido tu *Certificado de Participación*. 📜✨`,

      `✨ Sí, tu formación incluye un *Certificado de Participación Glow Nails*. 📜💅💕`,
    ];

    return {
      intencion: "certificado",
      respuesta: agregarCierre(
        elegirAleatoria(respuestas),
        textoNormalizado
      ),
    };
  }

  // 7. EXAMEN
  if (textoNormalizado.includes("examen")) {
    const respuestas = [
      `😊💖 No, *Glow Nails no incluye examen*.\n\nEl programa está enfocado en el *aprendizaje y la práctica*, para que puedas desarrollar tus habilidades paso a paso y a tu propio ritmo. 💅✨`,

      `💅✨ No necesitas presentar examen. *Glow Nails está enfocado en aprender, practicar y desarrollar tus habilidades* paso a paso. 💖`,

      `✨ No, el programa *no incluye examen*. Podrás avanzar con tus clases y utilizar tus materiales de práctica para ir mejorando tus habilidades a tu propio ritmo. 💕`,
    ];

    return {
      intencion: "examen",
      respuesta: agregarCierre(
        elegirAleatoria(respuestas),
        textoNormalizado
      ),
    };
  }

  // 8. EXPERIENCIA PREVIA
  if (textoNormalizado.includes("experiencia")) {
    const respuestas = [
      `💖 No necesitas experiencia previa. *Glow Nails está pensado principalmente para aprender desde cero*. 💅✨\n\nPodrás avanzar paso a paso con las clases y practicar hasta ir desarrollando tus habilidades.`,

      `😊✨ Puedes comenzar aunque *no tengas experiencia*. Glow Nails está diseñado principalmente para personas que desean *aprender uñas desde cero*. 💅💕`,

      `💅💖 No es necesario tener experiencia previa. Podrás *comenzar desde cero* y avanzar paso a paso mediante las clases y la práctica. ✨`,
    ];

    return {
      intencion: "experiencia_previa",
      respuesta: agregarCierre(
        elegirAleatoria(respuestas),
        textoNormalizado
      ),
    };
  }

  // 9. QUÉ INCLUYE
  if (textoNormalizado.includes("incluye")) {
    const respuestas = [
      `💅✨ *Glow Nails incluye:*\n\n🎥 *50 clases pregrabadas paso a paso*\n📝 *Más de 200 diseños y ejercicios de práctica*\n📚 *Biblioteca Complementaria de Manicure*\n🦶 *Curso de Pedicure de REGALO*\n📘 *Ruta de Aprendizaje*\n📜 *Certificado de Participación*\n♾️ *Acceso digital de por vida* 💖`,

      `💖 Con *Glow Nails* recibes una formación muy completa:\n\n🎥 50 clases pregrabadas\n📝 Más de 200 diseños y ejercicios de práctica\n📚 Biblioteca Complementaria de Manicure\n🦶 Curso de Pedicure de regalo\n📘 Ruta de Aprendizaje\n📜 Certificado de Participación\n♾️ Acceso digital de por vida ✨`,

      `✨ Tu acceso a *Glow Nails* incluye *50 clases pregrabadas*, más de *200 diseños y ejercicios de práctica*, Biblioteca Complementaria de Manicure, Curso de Pedicure de regalo, Ruta de Aprendizaje y Certificado de Participación. 💅💖\n\nAdemás, tendrás *acceso digital de por vida*. ♾️`,
    ];

    return {
      intencion: "contenido_incluido",
      respuesta: agregarCierre(
        elegirAleatoria(respuestas),
        textoNormalizado
      ),
    };
  }

  // 10. FORMAS DE PAGO
  if (textoNormalizado.includes("pagar")) {
    const respuestas = [
      `💖 *Los métodos de pago disponibles son:*\n🏦 *Transferencia bancaria*\n🏪 *Depósito en OXXO*\n\n¿Cuál de las dos opciones prefieres? 😊`,

      `✨ Puedes realizar tu pago mediante:\n🏦 *Transferencia bancaria*\n🏪 *Depósito en OXXO*\n\n¿Cuál opción prefieres? 💖`,

      `💕 Tenemos disponibles estas dos opciones de pago:\n🏦 *Transferencia bancaria*\n🏪 *Depósito en OXXO*\n\n¿Cuál de las dos prefieres? 😊`,
    ];

    return {
      intencion: "metodos_pago",
      respuesta: elegirAleatoria(respuestas),
    };
  }

  return null;
}

app.get("/", (req, res) => {
  res.send("Agente Adri de Glow Beauty Academy activo ✅");
});

app.post("/mensaje", async (req, res) => {
  try {
    const texto =
      req.body.texto ||
      req.body.mensaje ||
      req.body.message ||
      "";

    console.log(
      "Mensaje recibido:",
      texto ? "[contenido recibido]" : "[vacío]"
    );

    if (!texto || !String(texto).trim()) {
      return res.json({
        respuesta:
          "💖 No pude identificar tu mensaje. Por favor, escríbelo nuevamente.",
      });
    }

    const textoNormalizado = normalizarTexto(texto);

    const directa = respuestaDirecta(textoNormalizado);

    if (directa) {
      console.log("Intención detectada:", directa.intencion);
      console.log("Respuesta generada mediante base de conocimiento");

      return res.json({
        respuesta: directa.respuesta,
      });
    }

    console.log("Intención detectada: consulta abierta");

    try {
      const response = await openai.responses.create({
        model: "gpt-4.1-mini",
        temperature: 0.4,
        input: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: texto,
          },
        ],
      });

      const respuestaIA = limpiarRespuesta(response.output_text || "");

      if (!respuestaIA) {
        console.log("OpenAI devolvió una respuesta vacía");

        return res.json({
          respuesta:
            "💖 Para responderte correctamente necesito confirmar ese dato con nuestro equipo.",
        });
      }

      const respuestaNormalizada = normalizarTexto(respuestaIA);

      const requiereConfirmacion =
        respuestaNormalizada.includes("confirmar") &&
        respuestaNormalizada.includes("equipo");

      const respuestaFinal = requiereConfirmacion
        ? respuestaIA
        : agregarCierre(respuestaIA, textoNormalizado);

      console.log("Respuesta generada mediante OpenAI");

      return res.json({
        respuesta: respuestaFinal,
      });
    } catch (openAIError) {
      console.error("Error al consultar OpenAI:", openAIError.message);

      return res.status(200).json({
        respuesta:
          "💖 En este momento no pude procesar tu consulta. Por favor, inténtalo nuevamente en unos minutos.",
      });
    }
  } catch (error) {
    console.error("Error en /mensaje:", error.message);

    return res.status(200).json({
      respuesta:
        "💖 En este momento no pude procesar tu mensaje. Por favor, inténtalo nuevamente en unos minutos.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
