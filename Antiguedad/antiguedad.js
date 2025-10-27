import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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

document.addEventListener("DOMContentLoaded", () => {
    const employeeName = localStorage.getItem('employeeName');
    if (employeeName) {
        document.getElementById('employee-name').innerText = employeeName; // Muestra el nombre en el encabezado
    }
});

document.addEventListener("DOMContentLoaded", () => {
    // Evento de búsqueda de empleado
    document.querySelector('.btn_buscar_E').addEventListener('click', buscarEmpleado);
});

async function buscarEmpleado() {
    const numeroControl = document.querySelector('.numeroControl').value;

    if (!numeroControl) {
        alert("Por favor, ingrese el número de control del empleado.");
        return;
    }

    try {
        const docRef = doc(db, "baja_empleados", numeroControl); // Obtenemos los datos de baja_empleados
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();

            // Verificar si el campo dia_de_baja está presente
            if (data.dia_de_baja) {
                const fechaIngreso = data.dia_de_ingreso;
                const fechaBaja = data.dia_de_baja;
                const diasTrabajados = data.dias_trabajados;

                // Mostrar los datos obtenidos
                document.querySelector('.nombre-texto').innerHTML = `<strong>Nombre:</strong> ${data.nombre}`;
                document.querySelector('.inicio-texto').innerHTML = `<strong>Fecha de Inicio:</strong> ${fechaIngreso}`;
                document.querySelector('.actual-texto').innerHTML = `<strong>Fecha de Baja:</strong> ${fechaBaja}`;
                document.querySelector('.dtrabajados-texto').innerHTML = `<strong>Días Trabajados:</strong> ${diasTrabajados}`;

                // Mostrar contenedor de información y los íconos
                document.querySelector('.encontrado').style.display = 'flex';
                document.querySelector('.noEncontrado').style.display = 'none';
                document.querySelectorAll('.icono').forEach(icon => icon.style.display = 'inline'); // Mostrar íconos
            } else {
                // Si no se encuentra dia_de_baja, mostrar mensaje de no encontrado
                document.querySelector('.lb_noEncontrado').textContent = 'Empleado no Encontrado';
                document.querySelector('.encontrado').style.display = 'none';
                document.querySelector('.noEncontrado').style.display = 'flex';
            }
        } else {
            // Empleado no encontrado
            document.querySelector('.lb_noEncontrado').textContent = 'Empleado no Encontrado';
            document.querySelector('.encontrado').style.display = 'none';
            document.querySelector('.noEncontrado').style.display = 'flex'; 
        }

    } catch (error) {
        console.error("Error al buscar el empleado:", error);
        alert("Hubo un error al buscar el empleado. Inténtalo nuevamente.");
    }
}

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
