const nodemailer = require("nodemailer");
const path = require("path");

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false,
  auth: {
    user: "janie68@ethereal.email",
    pass: "5SpmYsbTZNcYz9CYfY",
  },
});

exports.sendEmail = (req, res) => {
  try {
    const { nombre, apellido, email, telefono } = req.body;

    if (!nombre || !apellido || !email || !telefono) {
      return res.status(402).json("Faltan datos del usuario:", req.body);
    }

    console.log("Datos de email recibidos:", req.body);

    const htmlTemplate1 = `
        <!DOCTYPE html>
        <html>
        <head>
        <style>
            .container {
            width: 80%;
            margin: auto;
            padding: 20px;
            border: 1px solid #ddd;
            font-family: Arial, sans-serif;
            }
            .header {
            text-align: center;
            margin-bottom: 20px;
            }
            .content {
            padding: 10px;
            background-color: #f9f9f9;
            border-radius: 5px;
            }
            .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #666;
            }
        </style>
        </head>
        <body>
        <div class="container">
            <div class="header">
            <img src="cid:logotienda" alt="Distrolac Logo" style="max-width: 150px;">
            <h2>¡Gracias por tu interés!</h2>
            </div>
            <div class="content">
            <p>Hola ${nombre},</p>
            <p>Nos complace mucho que hayas mostrado interés en unirte a nuestro equipo en Distrolac.</p>
            <p>En Distrolac, valoramos a las personas apasionadas y dedicadas que comparten nuestra visión de ofrecer la mejor calidad en nuestros productos. Creemos que tu experiencia y habilidades pueden ser una gran aportación para nuestra misión y estamos muy emocionados de considerar tu inclusión en nuestro equipo.</p>
            <p>Queremos informarte que hemos recibido tu solicitud y nuestro equipo de recursos humanos la está revisando cuidadosamente. Nuestro objetivo es ponernos en contacto contigo lo más pronto posible para discutir cómo puedes ser parte de nuestro equipo y contribuir a nuestras metas comunes.</p>
            <p>Te agradecemos nuevamente por tu interés y paciencia durante este proceso. Si tienes alguna pregunta o necesitas más información, no dudes en contactarnos.</p>
            </div>
            <div class="footer">
            <p>Distrolac - Todos los derechos reservados.</p>
            </div>
        </div>
        </body>
        </html>
    `;

    const mailOptions = {
      from: '"Janie Herzog" <janie68@ethereal.email>',
      to: email,
      subject: "Bienvenido a Distrolac",
      html: htmlTemplate1, // HTML body
      attachments: [
        {
          filename: "logotienda.png",
          path: path.join(__dirname, "../../public/logotienda.png"), // Ruta absoluta a la imagen
          cid: "logotienda",
        },
      ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      console.log("Email enviado correctamente:", info);
      return res.status(200).json("Email enviado correctamente", info);
    });

    // SEGUNDO EMAIL PARA DISTROLAC
    const htmlTemplate2 = `
            <!DOCTYPE html>
        <html>
        <head>
        <style>
            .container {
            width: 80%;
            margin: auto;
            padding: 20px;
            border: 1px solid #ddd;
            font-family: Arial, sans-serif;
            }
            .header {
            text-align: center;
            margin-bottom: 20px;
            }
            .content {
            padding: 10px;
            background-color: #f9f9f9;
            border-radius: 5px;
            }
            .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #666;
            }
        </style>
        </head>
        <body>
        <div class="container">
            <div class="header">
            <img src="cid:logotienda" alt="Distrolac Logo" style="max-width: 150px;">
            <h2>Nueva Solicitud de Unión</h2>
            </div>
            <div class="content">
            <p>Nueva solicitud de un candidato interesado en unirse a nuestro equipo.</p>
            <p><strong>Detalles del Solicitante:</strong></p>
            <ul>
                <li><strong>Nombre:</strong> ${nombre}</li>
                <li><strong>Apellido:</strong> ${apellido}</li>
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Teléfono:</strong> ${telefono}</li>
            </ul>
            <p>Gracias por su dedicación y esfuerzo continuo para hacer de Distrolac un lugar excelente para trabajar.</p>
            </div>
            <div class="footer">
            <p>Distrolac - Todos los derechos reservados.</p>
            </div>
        </div>
        </body>
        </html>`
    ;

    const mailOptions2 = {
      from: '"Janie Herzog" <janie68@ethereal.email>',
      to: email,
      subject: "Solicitud de unión",
      html: htmlTemplate2, // HTML body
      attachments: [
        {
          filename: "logotienda.png",
          path: path.join(__dirname, "../../public/logotienda.png"), // Ruta absoluta a la imagen
          cid: "logotienda",
        },
      ],
    };

    transporter.sendMail(mailOptions2, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      console.log("Email enviado correctamente:", info);
      return res.status(200).json("Email enviado correctamente", info);
    });
  } catch (error) {
    console.log("Error al enviar el email", error);
    res.status(500).json("Error al enviar el email", error);
  }
};
