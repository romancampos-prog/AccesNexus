// Importar las librerías necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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

// Manejar el inicio de sesión
document.getElementById('FormularioInicio').addEventListener('submit', async (e) => {
    e.preventDefault(); // Evitar que se recargue la página

    // Obtener los datos del formulario
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // Obtener referencia al documento del usuario
        const userDoc = doc(db, "Usuarios", email); // Usar el email como ID del documento
        const docSnapshot = await getDoc(userDoc);

        if (docSnapshot.exists()) {
            const usuario = docSnapshot.data();
            // Verificar si la contraseña es correcta
            if (usuario.contraseña === password) {
                window.location.href = '/Home/home.html';
            } else {
                alert('Contraseña o Correo incorrectos');
            }
        } else {
            alert('El usuario no existe');
        }
    } catch (error) {
        console.error("Error al obtener el documento:", error);
        alert(`Error: ${error.message}`);
    }
});

