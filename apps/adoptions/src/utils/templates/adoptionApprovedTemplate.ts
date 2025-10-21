export interface AdoptionApprovedData {
  adopter: {
    name: string
  }
  pet: {
    name: string
    species?: string | null
    gender?: string | null
    age?: string | null
    size?: string | null
    sterilized?: string | null
  }
  adoptionCode: string
  shelter: {
    name: string
    email: string
    address?: string | null
  }
  codeExpiresAt?: string | null
}

export const adoptionApprovedTemplate = (data: AdoptionApprovedData): string => {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>¡Solicitud de Adopción Aprobada! - AyünPet</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #11181C;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #F9C53D;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .success-icon {
            font-size: 48px;
            color: #F9C53D;
            margin-bottom: 10px;
        }
        h1 {
            color: #F9C53D;
            margin: 0;
            font-size: 28px;
        }
        .pet-info {
            background: #FFF9E6;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #F9C53D;
        }
        .adoption-code {
            background: #FFF9E6;
            border: 2px solid #F9C53D;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
        }
        .code {
            font-family: 'Courier New', monospace;
            font-size: 24px;
            font-weight: bold;
            color: #D4A017;
            letter-spacing: 2px;
        }
        .warning {
            background: #FFE6E6;
            border-left: 4px solid #dc3545;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .meeting-reminder {
            background: #E6F3FF;
            border-left: 4px solid #0a7ea4;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .shelter-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #687076;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            background: #F9C53D;
            color: #11181C;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 10px 0;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="success-icon">🎉</div>
            <h1>¡Felicitaciones!</h1>
            <p>Tu solicitud de adopción ha sido aprobada</p>
        </div>

        <p>Estimado/a <strong>${data.adopter.name}</strong>,</p>
        
        <p>Nos complace informarte que tu solicitud para adoptar a <strong>${data.pet.name}</strong> ha sido <strong>aprobada</strong>. ¡Estamos muy emocionados de que ${data.pet.name} pronto tenga un nuevo hogar lleno de amor!</p>

        <div class="pet-info">
            <h3>📋 Información de tu futura mascota:</h3>
            <ul>
                <li><strong>Nombre:</strong> ${data.pet.name}</li>
                ${data.pet.species ? `<li><strong>Especie:</strong> ${data.pet.species}</li>` : ''}
                ${data.pet.gender ? `<li><strong>Género:</strong> ${data.pet.gender}</li>` : ''}
                ${data.pet.age ? `<li><strong>Edad:</strong> ${data.pet.age}</li>` : ''}
                ${data.pet.size ? `<li><strong>Tamaño:</strong> ${data.pet.size}</li>` : ''}
                ${data.pet.sterilized ? `<li><strong>Esterilización:</strong> ${data.pet.sterilized}</li>` : ''}
            </ul>
        </div>

        <div class="adoption-code">
            <h3>🔐 Código de Adopción</h3>
            <p>Este es tu código único de adopción:</p>
            <div class="code">${data.adoptionCode}</div>
            ${
                data.codeExpiresAt
                    ? `<p><small>Este código vence el <strong>${data.codeExpiresAt}</strong>. Recuerda utilizarlo antes de esa fecha.</small></p>`
                    : ""
            }
            <p><small>Guarda este código de forma segura. Lo necesitarás para completar el proceso de adopción.</small></p>
        </div>

        <div class="warning">
            <h3>⚠️ IMPORTANTE - Confidencialidad</h3>
            <p><strong>NO COMPARTAS este código con nadie más.</strong> Este código es personal e intransferible. Solo úsalo cuando te encuentres con el refugio para completar la adopción.</p>
        </div>

        <div class="meeting-reminder">
            <h3>📅 Recordatorio de Encuentro Presencial</h3>
            <p><strong>Próximo paso importante:</strong> Deberás coordinar un encuentro presencial con el refugio para:</p>
            <ul>
                <li>Conocer personalmente a ${data.pet.name}</li>
                <li>Completar la documentación final</li>
                <li>Recibir instrucciones de cuidado</li>
                <li>Finalizar el proceso de adopción</li>
            </ul>
            <p><strong>Recuerda:</strong> Lleva contigo una identificación válida y el código de adopción.</p>
        </div>

        <div class="shelter-info">
            <h3>🏠 Información del Refugio</h3>
            <p><strong>${data.shelter.name}</strong></p>
            ${data.shelter.address ? `<p>📍 <strong>Dirección:</strong> ${data.shelter.address}</p>` : ''}
            <p>✉️ <strong>Email:</strong> ${data.shelter.email}</p>
            <p><em>Por favor, contacta al refugio para coordinar tu visita.</em></p>
        </div>

        <p>Estamos seguros de que ${data.pet.name} será muy feliz en su nuevo hogar. ¡Gracias por darle una segunda oportunidad a una mascota que lo necesita!</p>

        <div class="footer">
            <p>Con cariño,<br>
            <strong>El equipo de AyünPet 🐾</strong></p>
            <p><small>Este es un correo automático, por favor no respondas a esta dirección.</small></p>
        </div>
    </div>
</body>
</html>
  `.trim();
};

export const adoptionApprovedSubject = (petName: string): string => {
  return `🎉 ¡Solicitud aprobada! ${petName} te está esperando`;
};
