import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";


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

document.addEventListener("DOMContentLoaded", async () => {
    const employeeName = localStorage.getItem('employeeName');
    if (employeeName) {
        document.getElementById('employee-name').innerText = employeeName; // Mostrar el nombre en el encabezado
        localStorage.removeItem('employeeName'); // Eliminar el valor después de usarlo
    }

    await infoEmpleados(); // Llama a la función para cargar los datos en la tabla
    document.querySelector('.generarNomina').addEventListener('click', generarNomina);

});

// Función para obtener la información de los empleados y mostrarla en la tabla
async function infoEmpleados() {
    try {
        // Referencia a la colección "empleados" en Firestore
        const empleadosSnapshot = await getDocs(collection(db, "empleados"));
        
        // Selecciona el cuerpo de la tabla en el DOM
        const tableBody = document.getElementById('empleados-tbody');

        // Itera sobre cada documento en la colección y añade una fila en la tabla
        empleadosSnapshot.forEach(docSnap => {
            const empleado = docSnap.data();
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${docSnap.id}</td>  <!-- Aquí usas el ID del documento como No. de Control -->
                <td>${empleado.nombres}</td>
                <td>${empleado.apellidos}</td>
                <td>${empleado.horas_trabajadas_semanal}</td>
                <td>${empleado.pago}</td>
            `;
        });
        
    } catch (error) {
        console.error('Error al obtener los datos de empleados:', error);
    }
}


// Función para generar nómina de un empleado específico
async function generarNomina() {
    // Obtener número de control 
    const noControl = document.querySelector('.numeroControl').value;
    console.log('Número de control ingresado:', noControl);

    if (!noControl) {
        alert('Por favor, ingrese un número de control válido');
        console.log('No se ingresó un número de control válido.');
        return;
    }

    try {
        console.log('Iniciando la referencia al documento de Firebase...');
        // Consulta directa a Firebase usando el número de control
        const empleadoDoc = doc(db, "empleados", noControl);
        const docSnapshot = await getDoc(empleadoDoc);

        if (docSnapshot.exists()) {
            const empleado = docSnapshot.data();
            console.log('Datos del empleado obtenidos:', empleado);

            // Generar el PDF con los datos del empleado
            console.log('Llamando a la función para generar el PDF...');
            generarPDFNomina(empleado);
            console.log('PDF generado con éxito.');
        } else {
            alert('Empleado no encontrado');
            console.log('Empleado no encontrado para el número de control:', noControl);
        }
    } catch (error) {
        console.error('Error al generar la nómina:', error);
        alert('Hubo un error al generar la nómina. Inténtelo de nuevo.');
    }
}





// Función para convertir números a letras
function convertirNumeroALetras(numero) {
    const unidades = ['Cero', 'Uno', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve'];
    const decenas = ['Diez', 'Veinte', 'Treinta', 'Cuarenta', 'Cincuenta', 'Sesenta', 'Setenta', 'Ochenta', 'Noventa'];
    const centenas = ['Cien', 'Doscientos', 'Trescientos', 'Cuatrocientos', 'Quinientos', 'Seiscientos', 'Setecientos', 'Ochocientos', 'Novecientos'];
    
    // Redondear a dos decimales para asegurar exactitud en los centavos
    numero = parseFloat(numero.toFixed(2));
    console.log(`Número redondeado: ${numero}`);
    
    const entero = Math.floor(numero); // Parte entera
    const decimal = Math.round((numero - entero) * 100); // Parte decimal (centavos)

    console.log(`Parte entera: ${entero}`);
    console.log(`Parte decimal (centavos): ${decimal}`);

    let resultado = '';

    // Convertir la parte entera
    if (entero < 10) {
        resultado = unidades[entero];
        console.log(`Número en unidades: ${resultado}`);
    } else if (entero < 100) {
        resultado = decenas[Math.floor(entero / 10) - 1] + (entero % 10 !== 0 ? ` y ${unidades[entero % 10]}` : '');
        console.log(`Número en decenas: ${resultado}`);
    } else if (entero === 100) {
        resultado = 'Cien';
        console.log(`Número es exactamente cien: ${resultado}`);
    } else if (entero < 1000) {
        resultado = centenas[Math.floor(entero / 100) - 1] + (entero % 100 !== 0 ? ` ${convertirNumeroALetras(entero % 100)}` : '');
        console.log(`Número en centenas: ${resultado}`);
    } else {
        resultado = `${entero} pesos`;
        console.log(`Número mayor o igual a mil: ${resultado}`);
    }

    // Agregar la parte decimal (centavos) solo si es mayor que 0
    if (decimal > 0) {
        const decimalTexto = decimal < 10 ? unidades[decimal] : convertirNumeroALetras(decimal);
        resultado += ` con ${decimalTexto} centavos`;
        console.log(`Parte decimal en texto: ${decimalTexto}`);
    }

    console.log(`Resultado final: ${resultado}`);
    return resultado;
}







function generarPDFNomina(empleado) {
    console.log('Iniciando la generación del PDF para el empleado:', empleado.No_de_control);

    // Crear una instancia de jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    console.log('Instancia de jsPDF creada.');

    // Color de contorno de la tabla (azul #4da6ff)
    doc.setDrawColor(77, 166, 255); // Usa el valor RGB de #4da6ff

    // Encabezado de la empresa con logo al lado de "ACCESNEXUS"
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('ACCESNEXUS', 20, 20);

    // Ruta o Base64 del logo
    const logoURL = '/imgs/resursos/logoAcces.png'; // Cambia esta ruta a la correcta de tu logo

    // Agregar el logo al lado del texto de ACCESNEXUS
    const logoX = 65; // Posición X del logo
    const logoY = 12; // Posición Y del logo
    const logoWidth = 10; // Ancho del logo
    const logoHeight = 10; // Altura del logo
    doc.addImage(logoURL, 'PNG', logoX, logoY, logoWidth, logoHeight);

    // Separar cada elemento en su propio recuadro
    const startX = 20;
    let startY = 30;
    const rowHeight = 10;
    const cellWidth = 170;

    // 1. RFC en su propio recuadro
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.rect(startX, startY, cellWidth, rowHeight);
    doc.text('RFC: ACCN123456789', startX + 5, startY + 7);
    
    // 2. Dirección en su propio recuadro (debajo de RFC)
    startY += rowHeight;
    doc.rect(startX, startY, cellWidth, rowHeight);
    doc.text('Dirección: Calle Ficticia 123, Ciudad, Estado, CP 00000', startX + 5, startY + 7);
    
    // 3. Fecha en su propio recuadro (a la derecha de dirección)
    const fechaX = startX + cellWidth - 50;
    const today = new Date();
    const fecha = today.toLocaleDateString('es-ES');
    doc.rect(fechaX, startY - rowHeight, 50, rowHeight);
    doc.text('Fecha', fechaX + 5, startY - rowHeight + 5);
    doc.text(fecha, fechaX + 5, startY - rowHeight + 13);

    // Título centrado: "Recibo de Nómina"
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Recibo de Nómina', 105, startY + 15, null, null, 'center');

    // Crear la tabla con detalles del empleado
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    const cellPadding = 5;
    startY += rowHeight + 10;

    // 1. Primera fila: Nombre y RFC del empleado
    doc.rect(startX, startY, 85, rowHeight); // Celda de Nombre
    doc.text(`${empleado.nombres} ${empleado.apellidos}`, startX + cellPadding, startY + rowHeight - 3);
    doc.rect(startX + 85, startY, 85, rowHeight); // Celda de RFC
    doc.text(`RFC: ${empleado.RFC}`, startX + 85 + cellPadding, startY + rowHeight - 3);

    // 2. Segunda fila: Referencia única
    startY += rowHeight;
    const referenciaUnica = `${today.getDate()}${today.getMonth() + 1}${today.getFullYear()}${empleado.No_de_control}`;
    doc.rect(startX, startY, 170, rowHeight);
    doc.text(`Referencia única: ${referenciaUnica}`, startX + cellPadding, startY + rowHeight - 3);

    // 3. Tercera fila: Pago por hora y horas trabajadas (con 4 decimales)
    startY += rowHeight;
    const pagoPorHora = empleado.sueldo.toFixed(4);
    const horasTrabajadas = empleado.horas_trabajadas_semanal.toFixed(4);
    doc.rect(startX, startY, 85, rowHeight); // Celda de Pago por hora
    doc.text(`Pago por hora: $${pagoPorHora}`, startX + cellPadding, startY + rowHeight - 3);
    doc.rect(startX + 85, startY, 85, rowHeight); // Celda de Horas trabajadas
    doc.text(`Horas trabajadas: ${horasTrabajadas} horas`, startX + 85 + cellPadding, startY + rowHeight - 3);

    // 4. Cuarta fila: Sueldo total (con 4 decimales)
    startY += rowHeight;
    const pagoTotal = empleado.pago.toFixed(4);
    doc.rect(startX, startY, 170, rowHeight);
    doc.text(`Sueldo total: $${pagoTotal}`, startX + cellPadding, startY + rowHeight - 3);

    // 5. Quinta fila: Cantidad en letras
    startY += rowHeight;
    const cantidadEnLetras = convertirNumeroALetras(Math.floor(empleado.pago));
    doc.rect(startX, startY, 170, rowHeight);
    doc.text(`*** ${cantidadEnLetras} ***`, startX + cellPadding, startY + rowHeight - 3);

    // Leyenda de recepción
    startY += rowHeight + 10;
    doc.text('He recibido de ACCESNEXUS la cantidad antes mencionada.', startX, startY);

    // Cadena Original del complemento del certificado digital del SAT
    startY += rowHeight + 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Cadena Original del complemento del certificado digital del SAT', startX, startY);

    // Generar código aleatorio de 50 caracteres para emular el certificado digital
    const cadenaSAT = Array.from({length: 50}, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
    startY += 7;
    doc.setFont('helvetica', 'normal');
    doc.text(cadenaSAT, startX, startY);

    // Sello Digital del Emisor
    startY += rowHeight;
    doc.setFont('helvetica', 'bold');
    doc.text('Sello Digital del Emisor:', startX, startY);

    // Generar código aleatorio de 50 caracteres para emular el sello digital
    const selloDigital = Array.from({length: 50}, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
    startY += 7;
    doc.setFont('helvetica', 'normal');
    doc.text(selloDigital, startX, startY);

    // Generar código QR con la referencia única
    const qrCanvas = document.createElement("canvas");
    const qr = new QRious({
        element: qrCanvas,
        value: referenciaUnica,
        size: 100,
    });

    // Convertir el QR a imagen y agregarlo al PDF
    const qrDataURL = qrCanvas.toDataURL("image/png");
    doc.addImage(qrDataURL, "PNG", startX, startY + 5, 50, 50);

    // Agregar un recuadro para la firma del empleado al lado del QR
    doc.rect(startX + 60, startY + 5, 60, 50); // Recuadro para firma
    doc.text('Firma del Empleado', startX + 65, startY + 10);
    doc.line(startX + 65, startY + 40, startX + 115, startY + 40); // Línea para la firma

    // Guardar el PDF con el nombre del empleado
    const pdfFileName = `nomina_${empleado.No_de_control}.pdf`;
    doc.save(pdfFileName);
    console.log(`PDF guardado como: ${pdfFileName}`);
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector('.btn_regresar').addEventListener('click', () => {
        window.location.href = "/Home/home.html"; // Asegúrate de que la ruta sea correcta según tu estructura de carpetas
    });
});

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector('.btn_estadisticas').addEventListener('click', () => {
        const employeeName = document.getElementById('employee-name').innerText;
        localStorage.setItem('employeeName', employeeName); // Guardar el nombre del empleado en localStorage
        window.location.href = "/Estadisticas/estadisticas.html"; // Asegúrate de que la ruta sea correcta según tu estructura de carpetas
    });
});


document.addEventListener("DOMContentLoaded", () => {
    document.querySelector('.btn_altas_bajas').addEventListener('click', () => {
        const employeeName = document.getElementById('employee-name').innerText;
        localStorage.setItem('employeeName', employeeName); // Guardar el nombre del empleado en localStorage
        window.location.href = "/Altas_Bajas/altas_bajas.html"; // Asegúrate de que la ruta sea correcta según tu estructura de carpetas
    });
});


document.addEventListener("DOMContentLoaded", () => {
    document.querySelector('.btn_antiguedad').addEventListener('click', () => {
        const employeeName = document.getElementById('employee-name').innerText;
        localStorage.setItem('employeeName', employeeName); // Guardar el nombre del empleado en localStorage
        window.location.href = "/Antiguedad/antiguedad.html"; // Asegúrate de que la ruta sea correcta según tu estructura de carpetas
    });
});