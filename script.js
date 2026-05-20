function openMenu() {
  document.querySelectorAll('#nav-menu, #nav-button, #arrow, #hero-content')
    .forEach(el => el.classList.toggle('active'));
}

function notification(text) {
  const message = document.getElementById('form-notification');
  message.textContent = text;
  message.style.display = 'block';
  setTimeout(() => message.style.display = 'none', 2000);
}

let typed = new Typed(".auto-input", {
  strings: ["Barbeiro Profissional"],
  typeSpeed: 100,
  backSpeed: 100,
  loop: true,
});

const API = "https://6a0799dcfa9b27c848fa2fb8.mockapi.io/agendamento/appointments";

async function getFullyBookedDates() {
  const response = await fetch(API);
  const appointments = await response.json();

  const allHours = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00"
  ];

  const groupedDates = {};

  appointments.forEach((appointment) => {
    if (!groupedDates[appointment.date]) {
      groupedDates[appointment.date] = [];
    }

    groupedDates[appointment.date].push(appointment.hour);
  });

  const disabledDates = [];

  for (const date in groupedDates) {
    const bookedHours = groupedDates[date];

    const allBooked = allHours.every((hour) =>
      bookedHours.includes(hour)
    );

    if (allBooked) {
      disabledDates.push(date);
    }
  }
  return disabledDates;
}

(async () => {
  const disabledDates = await getFullyBookedDates();

  flatpickr("#date", {
    locale: "pt",
    minDate: "today",
    dateFormat: "d/m/Y",
    disable: disabledDates
  });
})();

const dateInput = document.getElementById("date");
const hourSelect = document.getElementById("hour-select");

dateInput.addEventListener("change", async () => {
  hourSelect.disabled = false;

  const selectedDate = dateInput.value;
  const response = await fetch(API);
  const appointments = await response.json();
  const bookedHours =
    appointments
      .filter((appointment) => {
        return (
          appointment.date === selectedDate
        );
      })
      .map((appointment) => {
        return appointment.hour;
      });

  Array.from(hourSelect.options)
    .forEach((option) => {
      option.disabled = false;

      if (option.value !== "") {
        option.textContent = option.value;
      }
      if (
        bookedHours.includes(option.value)
      ) {
        option.disabled = true;
        option.textContent = `${option.value} (Indisponível)`;
      }
    });
});

document
  .getElementById("booking-form")
  .addEventListener(
    "submit",

  async function(event) {
    event.preventDefault();

    const name = document.getElementById("client-name").value;
    const service = Array.from(document.querySelectorAll('input[name="service"]:checked')).map(input => input.value);
    const hour = document.getElementById("hour-select").value;
    const date = document.getElementById("date").value;
    const phone = document.getElementById("client-phone").value;

    if (!name) {
      notification("Preencha seu nome.");
      return;
    }

    if (!phone) {
      notification("Preencha seu celular.");
      return;
    }

    if (!date) {
      notification("Selecione uma data.");
      return;
    }

    if (!hour) {
      notification("Selecione um horário.");
      return;
    }

    if (service.length === 0) {
      notification("Selecione pelo menos um serviço.");
      return;
    }

    try {
      await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          phone,
          service,
          date,
          hour
        })
      });
      notification("Agendamento enviado com sucesso!");
      this.reset();
      hourSelect.disabled = true;

      Array.from(hourSelect.options)
        .forEach((option) => {

          option.disabled = false;

          if (option.value !== "") {
            option.textContent = option.value;
          }
        });
    } catch(error) {
      console.error(error);
      notification(
        "Erro ao realizar agendamento."
      );
    }
  }
);