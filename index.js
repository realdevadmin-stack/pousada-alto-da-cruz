const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// Configuração do transportador de e-mail (Exemplo com Gmail)
// DICA: Use "Senhas de App" do Google para maior segurança
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "pousadaaltocruz@gmail.com",
    pass: "SUA_SENHA_DE_APP_AQUI", 
  },
});

exports.notificarNovaReserva = onDocumentCreated("reservations/{reservationId}", async (event) => {
  const snap = event.data;
  if (!snap) return;
  const reservation = snap.data();

  const mailOptions = {
    from: '"Sistema Pousada" <pousadaaltocruz@gmail.com>',
    to: "pousadaaltocruz@gmail.com",
    subject: `🔔 Nova Reserva: ${reservation.guestName}`,
    html: `
      <h2>Nova solicitação de reserva pelo site</h2>
      <p><strong>Hóspede:</strong> ${reservation.guestName}</p>
      <p><strong>WhatsApp:</strong> ${reservation.phone}</p>
      <p><strong>Acomodação:</strong> ${reservation.roomType}</p>
      <p><strong>Check-in:</strong> ${reservation.checkIn}</p>
      <p><strong>Check-out:</strong> ${reservation.checkOut}</p>
      <p><strong>Observações:</strong> ${reservation.notes || "Nenhuma"}</p>
      <br>
      <p><a href="https://pousadaaltodacruz.online/admin.html">Acesse o Painel Administrativo</a></p>
    `,
  };

  return transporter.sendMail(mailOptions);
});