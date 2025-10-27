import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('button.valid').addEventListener('click', validarEmpleado);
    document.querySelector('.confirmPassword').addEventListener('click', confirmarContrasenaAdmin);

    document.querySelector('.infoEmp').style.display = 'none';
    document.querySelector('.reiniciar').style.display = 'none';

    document.querySelectorAll('.accion').forEach(button => {
        button.addEventListener('click', () => {
            actualizarDiaYHora(button.getAttribute('data-action'));
        });
    });
    document.querySelector('.btn_registrar').addEventListener('click', registrarAccion);
    document.querySelectorAll('.accion').forEach(button => button.disabled = true);
    
    document.querySelector('.reiniciar').addEventListener('click', async () => {
        await generarReporteEmpleados();
        await reiniciarSemana();
    });
});

// Función para validar empleado
async function validarEmpleado() {
    const numeroEmpleado = document.querySelector('.noControl').value;
    if (!numeroEmpleado) {
        alert('Por favor ingrese su número de empleado');
        return;
    }

    try {
        const empleadoDoc = doc(db, "empleados", numeroEmpleado);
        const docSnapshot = await getDoc(empleadoDoc);

        if (docSnapshot.exists()) {
            const empleado = docSnapshot.data();
            document.getElementById('employee-name').innerText = `${empleado.rol}: ${empleado.nombres} ${empleado.apellidos}`;
            
            document.querySelector('.Resultado').style.display = "block";
            document.querySelector('.Resultado').innerText = `Empleado: ${empleado.nombres} ${empleado.apellidos}`;
            document.querySelector('.Resultado1').style.display = 'block';
            document.querySelector('.Resultado1').innerText = `Empleado: ${empleado.nombres} ${empleado.apellidos}`;
            document.querySelector('.img_usuario').style.display = "block";
            
            document.querySelector('.rol').style.display = 'block';
            document.querySelector('.rol').innerText = `Rol: ${empleado.rol}`;
            document.querySelector('.rol1').style.display = 'block';
            document.querySelector('.rol1').innerText = `Rol: ${empleado.rol}`;
            document.querySelector('.rol_img').style.display = "block";

            document.querySelectorAll('.accion').forEach(button => button.disabled = false);

            if (empleado.rol === 'admin') {
                document.querySelector('.passwordInput').style.display = 'block';
                document.querySelector('.txt_password').style.display = 'block';
                document.querySelector('.confirmPassword').style.display = 'block';
                document.querySelector('.infoEmp').style.display = 'none';
                document.querySelector('.reiniciar').style.display = 'none';
            } else {
                document.querySelector('.passwordInput').style.display = 'none';
                document.querySelector('.txt_password').style.display = 'none';
                document.querySelector('.confirmPassword').style.display = 'none';
                document.querySelector('.infoEmp').style.display = 'none';
                document.querySelector('.reiniciar').style.display = 'none';
            }
        } else {
            alert('Empleado no encontrado');
            limpiarCampos();
        }
    } catch (error) {
        console.error("Error al validar empleado:", error);
        alert("Error al validar empleado");
        limpiarCampos();
    }
}

// Función para confirmar contraseña de administrador
async function confirmarContrasenaAdmin() {
    const numeroEmpleado = document.querySelector('.noControl').value;
    const passwordIngresada = document.querySelector('.passwordInput').value;

    try {
        const empleadoDoc = doc(db, "empleados", numeroEmpleado);
        const docSnapshot = await getDoc(empleadoDoc);

        if (docSnapshot.exists()) {
            const empleado = docSnapshot.data();
            if (empleado.rol === 'admin' && empleado.contrasena === passwordIngresada) {
                alert("Contraseña confirmada. Acceso concedido a opciones de administrador.");
                document.querySelector('.infoEmp').style.display = 'block';
                document.querySelector('.reiniciar').style.display = 'block';
            } else {
                alert("Contraseña incorrecta. Por favor intente nuevamente.");
            }
        }
    } catch (error) {
        console.error("Error al confirmar contraseña del administrador:", error);
        alert("Error al confirmar contraseña del administrador");
    }
}

// Función para actualizar el día y la hora
function actualizarDiaYHora(accion) {
    const now = new Date();
    const diaActual = now.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const horaActual = now.toLocaleTimeString('es-ES');
    document.querySelector('.dia_Y_hora1').style.display = 'block';
    document.querySelector('.dia_Y_hora1').innerText = `${accion} registrada el ${diaActual} a las ${horaActual}`;
    document.querySelector('.reloj_img').style.display = "block";
}

// Función para registrar la entrada o salida
async function registrarAccion() {
    const numeroEmpleado = document.querySelector('.noControl').value;
    const accion = document.querySelector('.dia_Y_hora1')?.innerText.split(' ')[0] || '';

    if (!numeroEmpleado || !accion) {
        alert('Por favor complete todos los campos antes de registrar.');
        return;
    }

    const now = new Date();
    const diaSemana = now.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
    const horaActual = now.toLocaleTimeString('es-ES');

    try {
        const horaKey = accion.toLowerCase() === 'entrada' ? `hora_de_entrada_${diaSemana}` : `hora_de_salida_${diaSemana}`;
        await updateDoc(doc(db, "empleados", numeroEmpleado), { [horaKey]: horaActual });
        
        alert(`Hora de ${accion.toLowerCase()} registrada correctamente.`);
        if (accion.toLowerCase() === 'salida') await calcularHorasTrabajadas(numeroEmpleado);

        limpiarCampos();
        document.querySelectorAll('.accion').forEach(button => button.disabled = true);
    } catch (error) {
        console.error("Error al registrar la acción:", error);
        alert("Error al registrar la acción");
    }
}

// Función para generar el archivo de texto con los datos de empleados
async function generarReporteEmpleados() {
    try {
        const empleadosSnapshot = await getDocs(collection(db, "empleados"));
        
        let contenidoReporte = "";
        contenidoReporte += `${"No. de Empleado".padEnd(17)} | ${"Apellido y Nombre".padEnd(40)} | ${"Sueldo".padEnd(12)} | ${"Horas Trabajadas".padEnd(20)} | ${"Pago de la Semana".padEnd(18)}\n`;
        contenidoReporte += `${"-".repeat(110)}\n`;

        empleadosSnapshot.forEach((docEmpleado) => {
            const empleado = docEmpleado.data();
            const noEmpleado = empleado.No_de_control.toString().padEnd(17);
            const nombreCompleto = `${empleado.apellidos} ${empleado.nombres}`.padEnd(40);
            const sueldo = empleado.sueldo.toString().padEnd(12);
            const horasTrabajadas = empleado.horas_trabajadas_semanal.toString().padEnd(20);
            const pago = empleado.pago.toString().padEnd(18);

            const lineaEmpleado = `${noEmpleado} | ${nombreCompleto} | ${sueldo} | ${horasTrabajadas} | ${pago}\n`;
            contenidoReporte += lineaEmpleado;
        });

        const fechaActual = new Date().toLocaleDateString('es-ES').replace(/\//g, "-");
        const nombreArchivo = `reporte de la semana (${fechaActual}).txt`;

        const blob = new Blob([contenidoReporte], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log("Reporte generado y descargado exitosamente.");
    } catch (error) {
        console.error("Error al generar el reporte de empleados:", error);
        alert("Error al generar el reporte de empleados.");
    }
}

// Función para calcular horas trabajadas y pagar en función del intervalo de 8:00 a.m. a 8:00 p.m.
async function calcularHorasTrabajadas(numeroEmpleado) {
    try {
        const empleadoDoc = await getDoc(doc(db, "empleados", numeroEmpleado));
        if (!empleadoDoc.exists()) return;

        const empleado = empleadoDoc.data();
        let totalHoras = 0;
        const dias = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];
        
        dias.forEach(dia => {
            const horaEntrada = normalizarHora(empleado[`hora_de_entrada_${dia}`]);
            const horaSalida = normalizarHora(empleado[`hora_de_salida_${dia}`]);

            const horasTrabajadas = calcularHoras(horaEntrada, horaSalida);

            totalHoras += horasTrabajadas;
        });

        // Redondear a 2 decimales
        totalHoras = parseFloat(totalHoras.toFixed(2));

        await updateDoc(doc(db, "empleados", numeroEmpleado), { horas_trabajadas_semanal: totalHoras });
        await calcularSueldo(numeroEmpleado);
    } catch (error) {
        console.error("Error al calcular horas trabajadas:", error);
    }
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

// Función para calcular la diferencia en horas, usando la lógica del segundo código
function calcularHoras(horaEntrada, horaSalida) {
    if (!horaEntrada || !horaSalida) {
        console.log("Horas de entrada o salida son inválidas:", { horaEntrada, horaSalida });
        return 0; // Retorna 0 si alguna de las horas no está definida
    }

    const entrada = new Date(`1970-01-01T${horaEntrada}`);
    const salida = new Date(`1970-01-01T${horaSalida}`);
    
    // Si la salida es antes de la entrada, asume que la salida es el día siguiente
    if (salida < entrada) {
        salida.setDate(salida.getDate() + 1);
    }

    // Calcula la diferencia en horas
    const horasTrabajadas = (salida - entrada) / (1000 * 60 * 60);
    return horasTrabajadas;
}


// Función para calcular sueldo basado en horas trabajadas
async function calcularSueldo(numeroEmpleado) {
    try {
        const empleadoDoc = await getDoc(doc(db, "empleados", numeroEmpleado));
        if (!empleadoDoc.exists()) return;

        const empleado = empleadoDoc.data();
        const { sueldo = 0, horas_trabajadas_semanal = 0 } = empleado;

        const sueldoTotal = sueldo * horas_trabajadas_semanal;
        await updateDoc(doc(db, "empleados", numeroEmpleado), { pago: sueldoTotal });
    } catch (error) {
        console.error("Error al calcular el sueldo:", error);
    }
}

// Función para reiniciar semana
async function reiniciarSemana() {
    try {
        const empleadosSnapshot = await getDocs(collection(db, "empleados"));
        empleadosSnapshot.forEach(async (docEmpleado) => {
            const empleadoRef = doc(db, "empleados", docEmpleado.id);
            const resetData = {
                horas_trabajadas_semanal: 0,
                pago: 0
            };
            const dias = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];
            dias.forEach(dia => {
                resetData[`hora_de_entrada_${dia}`] = null;
                resetData[`hora_de_salida_${dia}`] = null;
            });
            await updateDoc(empleadoRef, resetData);
        });
        alert("Semana reiniciada correctamente para todos los empleados.");
    } catch (error) {
        console.error("Error al reiniciar la semana:", error);
        alert("Error al reiniciar la semana. Por favor, intente nuevamente.");
    }
}

// Función para limpiar campos después de registrar
function limpiarCampos() {
    document.getElementById('employee-name').innerText = "";
    document.querySelector('.noControl').value = '';
    document.querySelector('.Resultado').style.display = 'none';
    document.querySelector('.Resultado').innerHTML = '';
    document.querySelector('.Resultado1').style.display = 'none';
    document.querySelector('.Resultado1').innerHTML = '';
    document.querySelector('.rol').style.display = 'none';
    document.querySelector('.rol').innerHTML = '';
    document.querySelector('.rol1').style.display = 'none';
    document.querySelector('.rol1').innerHTML = '';
    document.querySelector('.txt_password').style.display = 'none';
    const passwordAdmin = document.querySelector('.passwordInput');
    passwordAdmin.value = '';
    passwordAdmin.style.display = 'none';
    document.querySelector('.confirmPassword').style.display = 'none';
    document.querySelector('.infoEmp').style.display = 'none';
    document.querySelector('.reiniciar').style.display = 'none';
    document.querySelector('.dia_Y_hora1').style.display = 'none';
    document.querySelector('.dia_Y_hora1').innerHTML = '';
    document.querySelector('.reloj_img').style.display = "none";
    document.querySelector('.img_usuario').style.display = "none";
    document.querySelector('.rol_img').style.display = "none";
    document.querySelectorAll('.accion').forEach(button => button.disabled = true);
}


document.querySelector('.infoEmp').addEventListener('click', () => {
    const employeeName = document.getElementById('employee-name').innerText;
    localStorage.setItem('employeeName', employeeName); // Guardar el nombre del empleado en localStorage
    window.location.href = "/informacionEmpleados/infoEmpleado.html"; // Redirigir a infoEmpleado.html
});
