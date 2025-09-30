const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

let currentDate = new Date();
let viewDate = new Date(); // Nueva variable para la fecha que estamos viendo
let selectedDay = null;
let userName = '';
let exerciseData = {};

function loadData() {
    const savedName = localStorage.getItem('exerciseUserName');
    const savedData = localStorage.getItem('exerciseData');

    if (savedName) {
        userName = savedName;
        document.getElementById('userName').value = userName;
        document.getElementById('userName').disabled = true;
        document.getElementById('userNameDisplay').textContent = `Usuario: ${userName}`;
        document.getElementById('currentUser').style.display = 'flex';
        document.getElementById('saveNameBtn').style.display = 'none';
    } else {
        document.getElementById('saveNameBtn').style.display = 'block';
    }

    if (savedData) {
        exerciseData = JSON.parse(savedData);
    }
}

function saveData() {
    localStorage.setItem('exerciseUserName', userName);
    localStorage.setItem('exerciseData', JSON.stringify(exerciseData));
}

document.getElementById('userName').addEventListener('input', function (e) {
    const saveBtn = document.getElementById('saveNameBtn');
    saveBtn.disabled = e.target.value.trim() === '';
});

document.getElementById('saveNameBtn').addEventListener('click', function () {
    const nameInput = document.getElementById('userName');
    const name = nameInput.value.trim();

    if (name) {
        userName = name;
        nameInput.disabled = true;
        document.getElementById('userNameDisplay').textContent = `Usuario: ${userName}`;
        document.getElementById('currentUser').style.display = 'flex';
        document.getElementById('saveNameBtn').style.display = 'none';
        saveData();
    }
});

document.getElementById('editNameBtn').addEventListener('click', function () {
    const nameInput = document.getElementById('userName');
    nameInput.disabled = false;
    nameInput.focus();
    document.getElementById('currentUser').style.display = 'none';
    document.getElementById('saveNameBtn').style.display = 'block';
});

function generateCalendar() {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    document.getElementById('monthDisplay').textContent = `${months[month]} ${year}`;

    // Actualizar botones de navegación
    const today = new Date();
    const nextMonth = new Date(year, month + 1, 1);
    const nextMonthBtn = document.getElementById('nextMonth');

    // Deshabilitar botón "siguiente" si el próximo mes es futuro
    if (nextMonth.getFullYear() > today.getFullYear() ||
        (nextMonth.getFullYear() === today.getFullYear() && nextMonth.getMonth() > today.getMonth())) {
        nextMonthBtn.disabled = true;
    } else {
        nextMonthBtn.disabled = false;
    }

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    today.setHours(0, 0, 0, 0);

    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';

    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day);
        const dateStr = `${year}-${month + 1}-${day}`;
        const dayName = days[date.getDay()];

        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';

        // Construir el HTML base
        let cardHTML = `
                    <div class="day-name">${dayName}</div>
                    <div class="day-number">${day}</div>
                `;

        // Si hay ejercicio registrado y tiene hora, mostrarla
        if (exerciseData[dateStr] && exerciseData[dateStr].completed && exerciseData[dateStr].time) {
            cardHTML += `<div class="day-time">⏰ ${exerciseData[dateStr].time}</div>`;
        }

        dayCard.innerHTML = cardHTML;

        // Verificar si estamos viendo un mes anterior al actual
        const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
        const isPastMonth = year < today.getFullYear() ||
            (year === today.getFullYear() && month < today.getMonth());

        // Si el día ya pasó y no se registró, marcarlo como perdido
        if (date < today && (!exerciseData[dateStr] || !exerciseData[dateStr].completed)) {
            dayCard.classList.add('missed', 'disabled');
            if (!exerciseData[dateStr]) {
                exerciseData[dateStr] = { completed: false };
                saveData();
            }
        } else if (exerciseData[dateStr] && exerciseData[dateStr].completed === true) {
            dayCard.classList.add('completed');
            if (date < today || isPastMonth) {
                dayCard.classList.add('disabled');
            }
        } else if (exerciseData[dateStr] && exerciseData[dateStr].completed === false) {
            dayCard.classList.add('missed');
            if (date < today || isPastMonth) {
                dayCard.classList.add('disabled');
            }
        } else if (date < today) {
            dayCard.classList.add('missed', 'disabled');
            exerciseData[dateStr] = { completed: false };
            saveData();
        }

        // Deshabilitar todos los días de meses pasados
        if (isPastMonth) {
            dayCard.classList.add('disabled');
        }

        dayCard.addEventListener('click', function () {
            if (!dayCard.classList.contains('disabled')) {
                selectedDay = dateStr;
                document.getElementById('modal').classList.add('active');
            }
        });

        calendar.appendChild(dayCard);
    }
}

document.getElementById('btnYes').addEventListener('click', function () {
    if (selectedDay) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        exerciseData[selectedDay] = {
            completed: true,
            time: timeString
        };
        saveData();
        generateCalendar();
        document.getElementById('modal').classList.remove('active');
    }
});

document.getElementById('btnNo').addEventListener('click', function () {
    if (selectedDay) {
        exerciseData[selectedDay] = {
            completed: false
        };
        saveData();
        generateCalendar();
        document.getElementById('modal').classList.remove('active');
    }
});

document.getElementById('btnCancel').addEventListener('click', function () {
    document.getElementById('modal').classList.remove('active');
});

// Cerrar modal al hacer clic fuera
document.getElementById('modal').addEventListener('click', function (e) {
    if (e.target === this) {
        this.classList.remove('active');
    }
});

// Verificar días perdidos cada día
function checkMissedDays() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    for (let day = 1; day < today.getDate(); day++) {
        const date = new Date(year, month, day);
        const dateStr = `${year}-${month + 1}-${day}`;

        if (date.getMonth() === month && !exerciseData[dateStr]) {
            exerciseData[dateStr] = { completed: false };
        }
    }
    saveData();
}

// Navegación de meses
document.getElementById('prevMonth').addEventListener('click', function () {
    viewDate.setMonth(viewDate.getMonth() - 1);
    generateCalendar();
});

document.getElementById('nextMonth').addEventListener('click', function () {
    viewDate.setMonth(viewDate.getMonth() + 1);
    generateCalendar();
});

document.getElementById('todayBtn').addEventListener('click', function () {
    viewDate = new Date();
    generateCalendar();
});

loadData();
checkMissedDays();
generateCalendar();

// Actualizar cada minuto para verificar si cambió el día
setInterval(function () {
    const newDate = new Date();
    if (newDate.getDate() !== currentDate.getDate() ||
        newDate.getMonth() !== currentDate.getMonth()) {
        currentDate = newDate;
        checkMissedDays();
        // Solo actualizar si estamos viendo el mes actual
        if (viewDate.getFullYear() === currentDate.getFullYear() &&
            viewDate.getMonth() === currentDate.getMonth()) {
            generateCalendar();
        }
    }
}, 60000);