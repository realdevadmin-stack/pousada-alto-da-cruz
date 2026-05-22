import { enviarReserva } from './firebase.js';

const bookingForm = document.getElementById('bookingForm');
const whatsappBtn = document.getElementById('whatsappBtn');
const formMessage = document.getElementById('formMessage');
const toastEl = document.getElementById('toast');

function showToast(message, type = 'success') {
  toastEl.textContent = message;
  toastEl.className = `toast ${type}`;
  toastEl.classList.remove('hidden');
  setTimeout(() => toastEl.classList.add('hidden'), 4000);
}

function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '');
}

function validateBookingForm(data) {
  const { nome, telefone, cpf, checkin, checkout, hospedes, quarto } = data;

  if (!nome || !telefone || !checkin || !checkout || !hospedes || !quarto) {
    return { valid: false, message: 'Por favor, preencha todos os campos obrigatórios.' };
  }

  const phoneDigits = normalizePhone(telefone);
  if (phoneDigits.length < 10 || phoneDigits.length > 11) {
    return { valid: false, message: 'Por favor, informe um WhatsApp válido com DDD.' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateIn = new Date(`${checkin}T00:00:00`);
  const dateOut = new Date(`${checkout}T00:00:00`);

  if (dateIn < today) {
    return { valid: false, message: 'A data de entrada não pode ser anterior a hoje.' };
  }

  if (dateOut <= dateIn) {
    return { valid: false, message: 'A data de saída precisa ser posterior à entrada.' };
  }

  if (cpf && normalizePhone(cpf).length !== 11) {
    return { valid: false, message: 'O CPF informado é inválido.' };
  }

  return { valid: true };
}

// Efeito de Confete Simples
function launchConfetti() {
  const colors = ['#ff7b00', '#20ba56', '#003b95', '#ffcc00', '#f4f8fd'];
  for (let i = 0; i < 80; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    
    const isLeft = i % 2 === 0;
    confetti.style.bottom = '-10px';
    
    // Define o ponto de origem (esquerda ou direita)
    if (isLeft) {
      confetti.style.left = '-10px';
      confetti.style.setProperty('--tx', (Math.random() * 80 + 20) + 'vw');
    } else {
      confetti.style.right = '-10px';
      confetti.style.setProperty('--tx', -(Math.random() * 80 + 20) + 'vw');
    }

    // Define a trajetória (para cima e rotação)
    confetti.style.setProperty('--ty', -(Math.random() * 80 + 40) + 'vh');
    confetti.style.setProperty('--tr', (Math.random() * 720) + 'deg');

    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.width = Math.random() * 8 + 6 + 'px';
    confetti.style.height = confetti.style.width;
    confetti.style.animation = `confetti-shoot ${Math.random() * 2 + 1.5}s ease-out forwards`;

    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 4000);
  }
}
// Gerar link do WhatsApp baseado nos dados atuais do formulário
function getWhatsAppLink() {
  const nome = document.getElementById('nome').value.trim();
  const checkin = document.getElementById('checkin').value;
  const checkout = document.getElementById('checkout').value;
  const quarto = document.getElementById('quarto').value;
  
  if (nome && checkin && checkout && quarto) {
    const message = `Olá! Meu nome é ${nome}. Gostaria de confirmar minha reserva enviada pelo site para o ${quarto} de ${checkin} até ${checkout}.`;
    return `https://wa.me/5571985610497?text=${encodeURIComponent(message)}`;
  }
  return 'https://wa.me/5571985610497';
}

function showSuccessExperience() {
  const modal = document.getElementById('successModal');
  const modalWaBtn = document.getElementById('modalWhatsappBtn');
  
  modalWaBtn.href = getWhatsAppLink();
  modal.classList.remove('hidden');
  launchConfetti();

  // Tocar som de sucesso suave
  const successSound = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');
  successSound.volume = 0.5; // Volume em 50% para ser suave
  successSound.play().catch(err => console.log("Áudio bloqueado pelo navegador até interação do usuário:", err));

  // Fechar modal
  const closeBtn = document.getElementById('closeModalBtn');
  const closeHandler = () => modal.classList.add('hidden');
  closeBtn.onclick = closeHandler;
  // Fechar ao clicar fora do conteúdo
  modal.onclick = (e) => { if(e.target === modal) closeHandler(); };
}

bookingForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const telefone = document.getElementById('telefone').value.trim();
  const cpf = document.getElementById('cpf').value.trim();
  const checkin = document.getElementById('checkin').value;
  const checkout = document.getElementById('checkout').value;
  const hospedes = document.getElementById('hospedes').value;
  const quarto = document.getElementById('quarto').value;
  const observacoes = document.getElementById('observacoes').value.trim();
  const submitBtn = document.getElementById('submitBtn');

  formMessage.textContent = '';
  formMessage.className = 'form-message';

  const validation = validateBookingForm({ nome, telefone, cpf, checkin, checkout, hospedes, quarto });

  if (!validation.valid) {
    formMessage.textContent = validation.message;
    formMessage.classList.add('error');
    showToast(validation.message, 'error');
    return;
  }

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando reserva...';

    const people = parseInt(hospedes, 10);

    const reservationId = await enviarReserva({
      guestName: nome,
      phone: telefone,
      cpf: cpf || '',
      checkIn: checkin,
      checkOut: checkout,
      people: people,
      roomType: quarto,
      notes: observacoes,
    });

    showSuccessExperience();
    bookingForm.reset();

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar Reserva';
      formMessage.textContent = '';
      formMessage.className = 'form-message';
    }, 3000);
  } catch (error) {
    console.error('Erro ao enviar reserva:', error);
    formMessage.textContent = 'Ops! Ocorreu um erro ao processar sua reserva. Por favor, tente novamente ou nos chame no WhatsApp.';
    formMessage.classList.add('error');
    showToast('Erro ao enviar reserva.', 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Enviar Reserva';
  }
});

whatsappBtn.addEventListener('click', function () {
  const nome = document.getElementById('nome').value.trim();
  const telefone = normalizePhone(document.getElementById('telefone').value);
  const checkin = document.getElementById('checkin').value;
  const checkout = document.getElementById('checkout').value;
  const quarto = document.getElementById('quarto').value;
  const valor = 'R$ 0,00';

  if (nome && telefone && checkin && checkout && quarto) {
    const message = `Olá ${nome}! Gostaria de reservar o ${quarto} de ${checkin} até ${checkout}. Valor estimado: ${valor}.`;
    this.href = `https://wa.me/55${telefone}?text=${encodeURIComponent(message)}`;
  } else {
    this.href = 'https://wa.me/5571985610497';
    showToast('Complete os dados para enviar mensagem automática.', 'error');
  }
});

// Animação de Fade-in ao rolar a página
function initScrollReveal() {
  const observerOptions = {
    threshold: 0.1 // Ativa quando 10% do elemento estiver visível
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target); // Para de observar após animar uma vez
      }
    });
  }, observerOptions);

  // Seleciona as seções e também os cards de quartos e destaques individualmente
  document.querySelectorAll('.section, .booking-card, .hero-inner, .rooms article, .features article').forEach((el, index) => {
    // Define a direção com base no índice: pares vêm da esquerda, ímpares da direita
    const directionClass = index % 2 === 0 ? 'reveal-left' : 'reveal-right';
    el.classList.add(directionClass);

    // Se o elemento for um card de quarto ou destaque, aplica um delay baseado no índice
    const container = el.closest('.rooms') || el.closest('.features');
    if (el.tagName.toLowerCase() === 'article' && container) {
      const cards = Array.from(container.querySelectorAll('article'));
      const index = cards.indexOf(el);
      // Multiplica o índice por 0.15s para criar o efeito de escada
      el.style.transitionDelay = `${index * 0.15}s`;
    }

    observer.observe(el);
  });
}

// Destacar seção atual no menu ao rolar a página
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.topbar nav a[href^="#"]');

  const observerOptions = {
    // Ajusta a margem para detectar a seção quando ela estiver no topo/meio da tela
    rootMargin: '-150px 0px -70% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));
}

// Lógica de abrir/fechar menu mobile
function initMobileMenu() {
  const topbar = document.querySelector('.topbar');
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.querySelectorAll('.topbar nav a');

  if (!menuToggle) return;

  menuToggle.addEventListener('click', () => {
    topbar.classList.toggle('menu-open');
  });

  // Fecha o menu automaticamente ao clicar em qualquer link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      topbar.classList.remove('menu-open');
    });
  });
}

initScrollReveal();
initScrollSpy();
initMobileMenu();
