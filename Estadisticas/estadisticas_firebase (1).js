import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDrlBELANze_if8CPDjuWp457x4bxq-bPE",
    authDomain: "edwinweb-fc5f9.firebaseapp.com",
    databaseURL: "https://edwinweb-fc5f9-default-rtdb.firebaseio.com",
    projectId: "edwinweb-fc5f9",
    storageBucket: "edwinweb-fc5f9.firebasestorage.app",
    messagingSenderId: "883470440517",
    appId: "1:883470440517:web:3e8727ef2997f72631eb2c",
    measurementId: "G-RBJXLTML0C"
  };

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Función para obtener datos de Firebase y preparar el gráfico
async function fetchEmployeeData() {
    const empleadosSnapshot = await getDocs(collection(db, "empleados"));
    const labels = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const datasets = [];
    const maxHorasPorDia = 12; // Máximo de horas que puede trabajar un empleado por día

    empleadosSnapshot.forEach(docSnap => {
        const empleado = docSnap.data();
        
        // Calcula las horas trabajadas por día usando las horas de entrada y salida
        const horasTrabajadas = [
            calcularHoras(empleado.hora_de_entrada_lunes, empleado.hora_de_salida_lunes),
            calcularHoras(empleado.hora_de_entrada_martes, empleado.hora_de_salida_martes),
            calcularHoras(empleado.hora_de_entrada_miércoles, empleado.hora_de_salida_miércoles),
            calcularHoras(empleado.hora_de_entrada_jueves, empleado.hora_de_salida_jueves),
            calcularHoras(empleado.hora_de_entrada_viernes, empleado.hora_de_salida_viernes),
            calcularHoras(empleado.hora_de_entrada_sábado, empleado.hora_de_salida_sábado),
            calcularHoras(empleado.hora_de_entrada_domingo, empleado.hora_de_salida_domingo)
        ];

        // Crear el dataset para el empleado
        const employeeDataset = {
            label: `${empleado.nombres} ${empleado.apellidos}`,
            data: horasTrabajadas,
            borderColor: getRandomColor(),
            backgroundColor: getRandomColor(),
            fill: false,
            pointRadius: 5,
            pointHoverRadius: 8,
        };
        datasets.push(employeeDataset);
    });

    // Agregar una línea de referencia para el total de horas trabajadas por día (máximo por día)
    const maxHoursDataset = {
        label: 'Máximo de Horas Diarias',
        data: Array(7).fill(maxHorasPorDia), // Array con el mismo valor para cada día
        borderColor: 'red',
        borderDash: [5, 5], // Línea discontinua para diferenciar
        fill: false,
        pointRadius: 8,
    };
    datasets.push(maxHoursDataset);

    renderChart(labels, datasets);
}

// Función para normalizar el formato de la hora a HH:MM:SS
function normalizarHora(hora) {
    if (!hora) return null;
    const partes = hora.split(":");
    const horas = partes[0].padStart(2, '0'); // Asegurarse de que siempre tenga 2 dígitos
    const minutos = partes[1] || "00";
    const segundos = partes[2] || "00";
    return `${horas}:${minutos}:${segundos}`;
}

// Función para calcular las horas trabajadas entre entrada y salida
function calcularHoras(horaEntrada, horaSalida) {
    if (!horaEntrada || !horaSalida) {
        console.log("Horas de entrada o salida son inválidas:", { horaEntrada, horaSalida });
        return 0; // Retorna 0 si alguna de las horas no está definida
    }

    // Normalizar formato de hora a HH:MM:SS
    const horaEntradaNormalizada = normalizarHora(horaEntrada);
    const horaSalidaNormalizada = normalizarHora(horaSalida);

    const entrada = new Date(`1970-01-01T${horaEntradaNormalizada}`);
    const salida = new Date(`1970-01-01T${horaSalidaNormalizada}`);
    console.log(`Fecha de entrada procesada: ${entrada}, Fecha de salida procesada: ${salida}`);
    
    // Si la salida es antes de la entrada, asume que la salida es el día siguiente
    if (salida < entrada) {
        salida.setDate(salida.getDate() + 1);
        console.log(`Ajuste de salida para día siguiente: ${salida}`);
    }

    // Calcula la diferencia en horas
    const horasTrabajadas = (salida - entrada) / (1000 * 60 * 60);
    console.log(`Diferencia en horas trabajadas: ${horasTrabajadas}`);
    return horasTrabajadas;
}

// Función para renderizar el gráfico
function renderChart(labels, datasets) {
    const ctx = document.getElementById('workHoursChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 24,
                    ticks: {
                        stepSize: 4,
                        callback: function(value) {
                            return `${value} hrs`;
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            const employee = tooltipItem.dataset.label;
                            const hours = tooltipItem.parsed.y;
                            return `${employee}: ${hours} horas`;
                        }
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false, // Evitar ajuste de aspecto automático
        }
    });
}

// Función para generar colores aleatorios para cada línea
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Llama a la función para obtener datos y mostrar el gráfico
fetchEmployeeData();

// Mostrar el nombre del empleado en el encabezado de estadistica.html
document.addEventListener("DOMContentLoaded", () => {
    const employeeName = localStorage.getItem('employeeName');
    if (employeeName) {
        document.getElementById('employee-name').innerText = employeeName; // Muestra el nombre en el encabezado
    }
});

// Event listener para el botón de "Regresar"
document.addEventListener("DOMContentLoaded", () => {
    // Agrega un event listener al botón de regresar
    const regresarBtn = document.querySelector('.btn_regresar');
    if (regresarBtn) {
        regresarBtn.addEventListener('click', () => {
            // Guarda el nombre del empleado en localStorage para mantenerlo al regresar
            const employeeName = document.getElementById('employee-name').innerText;
            localStorage.setItem('employeeName', employeeName);
            // Redirige a home.html (ajusta la ruta según sea necesario)
            window.location.href = "/informacionEmpleados/infoEmpleado.html";
        });
    }
});



