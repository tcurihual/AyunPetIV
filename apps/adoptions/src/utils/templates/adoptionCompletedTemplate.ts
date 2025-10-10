export const adoptionCompletedTemplate = (data: AdoptionCompletedData): string => {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>¡Adopción Completada Exitosamente! - AyünPet</title>
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
        .heart-icon {
            font-size: 48px;
            color: #F9C53D;
            margin-bottom: 10px;
        }
        h1 {
            color: #F9C53D;
            margin: 0;
            font-size: 28px;
        }
        .celebration {
            background: linear-gradient(135deg, #F9C53D, #FFD700);
            color: #11181C;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            margin: 20px 0;
            font-weight: bold;
        }
        .adoption-details {
            background: #FFF9E6;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #F9C53D;
        }
        .completion-badge {
            background: #E6FFE6;
            border: 2px solid #28a745;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
        }
        .badge-text {
            font-size: 18px;
            font-weight: bold;
            color: #155724;
        }
        .care-tips {
            background: #E6F3FF;
            border-left: 4px solid #0a7ea4;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .support-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .resources-list {
            background: #FFF9E6;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }
        .resources-list ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #687076;
            font-size: 14px;
        }
        .thank-you {
            background: #FFF9E6;
            border: 1px solid #F9C53D;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
        }
        .paw-prints {
            font-size: 24px;
            color: #F9C53D;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="heart-icon">❤️</div>
            <h1>¡Adopción Completada!</h1>
            <p>Una nueva familia ha nacido</p>
        </div>

        <div class="celebration">
            <h2>🎊 ¡FELICITACIONES! 🎊</h2>
            <p style="font-size: 18px; margin: 0;">¡${data.pet.name} ya forma parte oficialmente de tu familia!</p>
        </div>

        <p>Querido/a <strong>${data.adopter.name}</strong>,</p>
        
        <p>Es un honor confirmar que la adopción de <strong>${data.pet.name}</strong> se ha completado exitosamente. Desde hoy, oficialmente eres la familia de esta hermosa mascota que estaba esperando un hogar lleno de amor.</p>

        <div class="completion-badge">
            <div class="badge-text">✅ ADOPCIÓN CERTIFICADA</div>
            <p style="margin: 10px 0 0 0;"><small>Código de adopción: <strong>${data.adoptionCode}</strong></small></p>
        </div>

        <div class="adoption-details">
            <h3>📋 Detalles de la Adopción</h3>
            <ul>
                <li><strong>Mascota adoptada:</strong> ${data.pet.name}</li>
                <li><strong>Especie:</strong> ${data.pet.species}</li>
                <li><strong>Género:</strong> ${data.pet.gender}</li>
                ${data.pet.age ? `<li><strong>Edad:</strong> ${data.pet.age} años</li>` : ''}
                ${data.pet.size ? `<li><strong>Tamaño:</strong> ${data.pet.size}</li>` : ''}
                <li><strong>Fecha de adopción:</strong> ${data.adoptionDate}</li>
                <li><strong>Nuevo hogar:</strong> ${data.adopter.name}</li>
            </ul>
        </div>

        <div class="care-tips">
            <h3>🐾 Los Primeros Días en Casa</h3>
            <p>Los primeros días son cruciales para que ${data.pet.name} se adapte a su nuevo hogar:</p>
            <ul>
                <li><strong>Paciencia:</strong> Dale tiempo para explorar y acostumbrarse</li>
                <li><strong>Rutina:</strong> Establece horarios consistentes para comida y paseos</li>
                <li><strong>Espacio seguro:</strong> Crea un área donde se sienta protegido/a</li>
                <li><strong>Mucho amor:</strong> Demuéstrale que está en un hogar seguro</li>
            </ul>
        </div>

        ${data.support.resources.length > 0 ? `
        <div class="resources-list">
            <h3>📚 Recursos de Apoyo</h3>
            <p>Hemos preparado algunos recursos que te ayudarán en esta nueva etapa:</p>
            <ul>
                ${data.support.resources.map(resource => `<li>${resource}</li>`).join('')}
            </ul>
        </div>
        ` : ''}

        <div class="support-info">
            <h3>🆘 Soporte y Contacto</h3>
            <p>Recuerda que siempre estamos aquí para apoyarte:</p>
            <p><strong>Refugio:</strong> ${data.shelter.name}</p>
            <p>✉️ <strong>Email de soporte:</strong> ${data.shelter.email}</p>
            ${data.support.emergencyContact ? `<p>🚨 <strong>Contacto de emergencia:</strong> ${data.support.emergencyContact}</p>` : ''}
            
            <p><em>No dudes en contactarnos si tienes alguna pregunta o necesitas orientación. Estamos comprometidos con el bienestar de ${data.pet.name} y tu familia.</em></p>
        </div>

        <div class="thank-you">
            <h3>🙏 ¡GRACIAS POR ADOPTAR!</h3>
            <div class="paw-prints">🐾 🐾 🐾</div>
            <p>Al elegir adoptar, no solo le has dado una segunda oportunidad a ${data.pet.name}, sino que también has hecho espacio en nuestro refugio para ayudar a otra mascota que lo necesita.</p>
            <p><strong>Eres un héroe para ${data.pet.name} y para nosotros.</strong></p>
        </div>

        <p>Esperamos que ${data.pet.name} y tu familia disfruten de muchos años de felicidad, aventuras y amor incondicional juntos.</p>

        <div class="footer">
            <p>Con amor y gratitud infinita,<br>
            <strong>Todo el equipo de AyünPet 🐾</strong></p>
            <div class="paw-prints">🐾</div>
            <p><small>Este es un correo de confirmación automático. Para soporte, responde a ${data.shelter.email}</small></p>
        </div>
    </div>
</body>
</html>
  `.trim();
};

export const adoptionCompletedSubject = (petName: string, adopterName: string): string => {
  return `❤️ ¡Adopción completada! ${petName} ya tiene un hogar con ${adopterName}`;
};