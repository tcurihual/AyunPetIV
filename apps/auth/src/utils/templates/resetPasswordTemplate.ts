export const resetPasswordTemplate = (resetLink: string) => `
  <!DOCTYPE html>
  <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <title>Restablecer contraseña | Ayün Pet</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f8f9fa;
          color: #333;
          padding: 20px;
        }
        .container {
          background: #fff;
          border-radius: 10px;
          padding: 30px;
          max-width: 500px;
          margin: 0 auto;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .logo {
          text-align: center;
          margin-bottom: 20px;
        }
        .button {
          display: inline-block;
          padding: 12px 25px;
          background-color: #f5b000;
          color: #000;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
        }
        .footer {
          font-size: 0.85em;
          color: #666;
          margin-top: 25px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <img src="https://ayunpet.s3.amazonaws.com/logo.png" alt="Ayün Pet Logo" width="80" />
        </div>
        <h2>¿Olvidaste tu contraseña?</h2>
        <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente botón para crear una nueva:</p>
        <p style="text-align:center; margin: 30px 0;">
          <a href="${resetLink}" class="button">Restablecer contraseña</a>
        </p>
        <p>Si no realizaste esta solicitud, puedes ignorar este correo.</p>
        <div class="footer">
          © ${new Date().getFullYear()} Ayün Pet — Todos los derechos reservados.
        </div>
      </div>
    </body>
  </html>
`
