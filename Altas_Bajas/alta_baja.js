// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js"; // Importa Firestore

// Your web app's Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
    // Mostrar formulario de alta
    document.querySelector('.btn_alta').addEventListener('click', () => {
        document.querySelector(".form_alta").style.display = "flex";
        document.querySelector(".div_baja").style.display = "none";
    });

    // Mostrar formulario de baja
    document.querySelector('.btn_baja').addEventListener('click', () => {
        document.querySelector(".form_alta").style.display = "none";
        document.querySelector(".div_baja").style.display = "flex";
    });

    // Mostrar/ocultar el campo de contraseña y email según el rol seleccionado
    const rolSelect = document.querySelector('.input_rol');
    const passwordField = document.querySelector('.input_contraseña');
    const emailField = document.querySelector('.input_email');

    rolSelect.addEventListener('change', () => {
        if (rolSelect.value === 'admin') {
            passwordField.style.display = 'block';
            emailField.style.display = 'block'; 
            document.querySelector(".lb_contraseña").style.display = "block";
            document.querySelector(".lb_E-mail").style.display = "block";
        } else {
            passwordField.style.display = 'none';
            emailField.style.display = 'none';
            passwordField.value = '';
            emailField.value = '';
            document.querySelector(".lb_contraseña").style.display = "none";
            document.querySelector(".lb_E-mail").style.display = "none";
        }
    });

    // Agregar evento para el formulario de alta
    document.querySelector('.form_alta').addEventListener('submit', async (e) => {
        e.preventDefault();

        // Obtener los datos del formulario
        const noEmpleado = document.querySelector('.input_No_de_control').value;
        const rfc = document.querySelector('.input_RFC').value;
        const apellidos = document.querySelector('.input_apellidos').value;
        const nombres = document.querySelector('.input_nombres').value;
        const sueldo = parseFloat(document.querySelector('.input_sueldo').value);
        const rol = rolSelect.value;
        const contrasena = passwordField.value;
        const email = emailField.value;

        // Obtener la fecha actual
        const fechaActual = new Date().toLocaleDateString('es-ES');

        try {
            // Verificar si el número de empleado ya existe en la base de datos empleados y baja_empleados
            const docRefEmpleados = doc(db, "empleados", noEmpleado);
            const docSnapEmpleados = await getDoc(docRefEmpleados);

            const docRefBajaEmpleados = doc(db, "baja_empleados", noEmpleado);
            const docSnapBajaEmpleados = await getDoc(docRefBajaEmpleados);

            if (docSnapEmpleados.exists() || docSnapBajaEmpleados.exists()) {
                alert("El número de empleado ya existe en la base de datos. Verifica el número e intenta nuevamente.");
                return;
            }

            // Crear un documento con el número de empleado como ID en Firestore
            await setDoc(docRefEmpleados, {
                noEmpleado: noEmpleado,
                rfc: rfc,
                apellidos: apellidos,
                nombres: nombres,
                sueldo: sueldo,
                rol: rol,
                dia_de_ingreso: fechaActual,
                horas_trabajadas_semanal: 0,
                pago: 0,
                ...(rol === "admin" && { contrasena: contrasena }), 
                hora_de_entrada_lunes: null,
                hora_de_salida_lunes: null,
                hora_de_entrada_martes: null,
                hora_de_salida_martes: null,
                hora_de_entrada_miércoles: null,
                hora_de_salida_miércoles: null,
                hora_de_entrada_jueves: null,
                hora_de_salida_jueves: null,
                hora_de_entrada_viernes: null,
                hora_de_salida_viernes: null,
                hora_de_entrada_sábado: null,
                hora_de_salida_sábado: null,
                hora_de_entrada_domingo: null,
                hora_de_salida_domingo: null
            });

            // También agregar el documento en la colección baja_empleados
            const bajaEmpleadoData = {
                dia_de_ingreso: fechaActual,
                nombre: `${apellidos} ${nombres}`,
                rol: rol,
                ...(rol === "admin" && { email: email })
            };
            await setDoc(docRefBajaEmpleados, bajaEmpleadoData);

            // Si el rol es admin, agregar al documento de `Usuarios`
            if (rol === "admin") {
                const docRefUsuarios = doc(db, "Usuarios", email);
                await setDoc(docRefUsuarios, {
                    contraseña: contrasena
                });
            }

            alert("Empleado dado de alta exitosamente.");

            // Limpiar el formulario
            document.querySelector('.form_alta').reset();
            passwordField.style.display = 'none';
            emailField.style.display = 'none';
            document.querySelector(".lb_contraseña").style.display = "none";
            document.querySelector(".lb_E-mail").style.display = "none";
            document.querySelector(".form_alta").style.display = "none";

        } catch (error) {
            console.error("Error al agregar el empleado: ", error);
            alert("Hubo un error al dar de alta al empleado. Inténtalo nuevamente.");
        }
    });
});

// Buscar empleado para dar de baja
document.querySelector('.btn_buscar').addEventListener('click', async () => {
    const noEmpleado = document.querySelector('.no_baja_emplreado').value;

    if (noEmpleado) {
        try {
            const docRef = doc(db, "empleados", noEmpleado);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                document.querySelector('.lb_nombres').textContent = `Nombre: ${data.nombres}`;
                document.querySelector('.lb_Apellidos').textContent = `Apellidos: ${data.apellidos}`;
                document.querySelector('.lb_RFC').textContent = `RFC: ${data.rfc}`;
                document.querySelector('.btn_Confirmar_baja').style.display = 'block';
            } else {
                document.querySelector('.lb_nombres').textContent = 'Empleado no encontrado';
                document.querySelector('.lb_Apellidos').textContent = '';
                document.querySelector('.lb_RFC').textContent = '';
                document.querySelector('.btn_Confirmar_baja').style.display = 'none';
            }
        } catch (error) {
            console.error("Error al buscar el empleado: ", error);
            alert("Hubo un error al buscar el empleado. Inténtalo nuevamente.");
        }
    } else {
        alert("Por favor, ingresa el número de empleado.");
    }
});

// Confirmar la baja
document.querySelector('.btn_Confirmar_baja').addEventListener('click', async () => {
    const noEmpleado = document.querySelector('.no_baja_emplreado').value;
    const fechaBaja = new Date().toLocaleDateString('es-ES');

    if (noEmpleado) {
        try {
            const docRef = doc(db, "empleados", noEmpleado);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();

                // Calcular los días trabajados excluyendo fines de semana
                const diasTrabajados = calcularDiasTrabajados(data.dia_de_ingreso, fechaBaja);

                // Agregar los detalles en `baja_empleados`
                const docRefBaja = doc(db, "baja_empleados", noEmpleado);
                const bajaEmpleadoData = {
                    dia_de_ingreso: data.dia_de_ingreso,
                    dia_de_baja: fechaBaja,
                    dias_trabajados: diasTrabajados,
                    nombre: `${data.apellidos} ${data.nombres}`,
                    rol: data.rol
                };
                if (data.rol === "admin") {
                    const emailData = (await getDoc(docRefBaja)).data()?.email;
                    if (emailData) bajaEmpleadoData.email = emailData;
                }
                await setDoc(docRefBaja, bajaEmpleadoData, { merge: true });

                // Si es admin, eliminar de `Usuarios` usando el email de `baja_empleados`
                if (data.rol === "admin" && bajaEmpleadoData.email) {
                    const docRefUsuarios = doc(db, "Usuarios", bajaEmpleadoData.email);
                    await deleteDoc(docRefUsuarios);
                }

                // Eliminar el documento de `empleados`
                await deleteDoc(docRef);

                alert("Empleado dado de baja exitosamente.");
                document.querySelector('.no_baja_emplreado').value = '';
                document.querySelector('.lb_nombres').textContent = '';
                document.querySelector('.lb_Apellidos').textContent = '';
                document.querySelector('.lb_RFC').textContent = '';
                document.querySelector('.btn_Confirmar_baja').style.display = 'none';
            } else {
                alert("No se encontró el empleado. Inténtalo nuevamente.");
            }
        } catch (error) {
            console.error("Error al eliminar el empleado: ", error);
            alert("Hubo un error al dar de baja al empleado. Inténtalo nuevamente.");
        }
    }
});

// Función para calcular días trabajados excluyendo fines de semana
function calcularDiasTrabajados(fechaInicio, fechaBaja) {
    const fechaInicial = new Date(fechaInicio.split('/').reverse().join('-'));
    const fechaFinal = new Date(fechaBaja.split('/').reverse().join('-'));
    let diasTrabajados = 0;

    while (fechaInicial <= fechaFinal) {
        const diaSemana = fechaInicial.getDay();
        if (diaSemana !== 0 && diaSemana !== 6) { // Excluye fines de semana
            diasTrabajados++;
        }
        fechaInicial.setDate(fechaInicial.getDate() + 1);
    }

    return diasTrabajados;
}

document.addEventListener("DOMContentLoaded", () => {
    const employeeName = localStorage.getItem('employeeName');
    if (employeeName) {
        document.getElementById('employee-name').innerText = employeeName; // Muestra el nombre en el encabezado
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const regresarBtn = document.querySelector('.btn_regresar');
    if (regresarBtn) {
        regresarBtn.addEventListener('click', () => {
            const employeeName = document.getElementById('employee-name').innerText;
            localStorage.setItem('employeeName', employeeName);
            window.location.href = "/informacionEmpleados/infoEmpleado.html";
        });
    }
});
