export const emailTemplate = (verificationLink: string) => `
  <!DOCTYPE html>
  <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <title>Verifica tu cuenta | Ayün Pet</title>
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
        <h2>¡Bienvenido a Ayün Pet! 🐾</h2>
        <p>Gracias por registrarte en nuestra plataforma. Antes de comenzar, necesitamos confirmar tu dirección de correo electrónico.</p>
        <p style="text-align:center; margin: 30px 0;">
          <a href="${verificationLink}" class="button">Verificar mi correo</a>
        </p>
        <p>Si no creaste una cuenta, puedes ignorar este mensaje.</p>
        <div class="footer">
          © ${new Date().getFullYear()} Ayün Pet — Todos los derechos reservados.
        </div>
      </div>
    </body>
  </html>
`;
