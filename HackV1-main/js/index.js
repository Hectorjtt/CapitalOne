// Importar Firebase y Firestore
import { registerWithEmail, signInWithEmail, app } from '../data/firebase.js';
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Inicializar Firestore
const db = getFirestore(app);
const auth = getAuth(app);

// Función para guardar información de registro en Firestore
async function saveUserSignUp(userId, name, email) {
    try {
        await setDoc(doc(db, "users", userId), {
            name: name,
            email: email
        });
        console.log('User additional information saved to Firestore');
    } catch (error) {
        console.error('Error saving user data:', error);
    }
}

// Función para guardar sesión de usuario
async function saveUserSession(userId) {
    try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
            console.log('Session for user:', userDoc.data());
        } else {
            console.log('No user session found!');
        }
    } catch (error) {
        console.error('Error saving user session:', error);
    }
}

// Toggle entre formularios de login y registro
const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});

document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('registerForm');
    const signinForm = document.getElementById('loginForm');

    const signupMessage = document.getElementById('signupMessage');
    const signinMessage = document.getElementById('signinMessage');

    if (signinForm) {
        signinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                const userCredential = await signInWithEmail(email, password);
                console.log('User Logged In Correctly', userCredential.user);

                await saveUserSession(userCredential.user.uid);
                signinMessage.textContent = 'Inicio de sesión exitoso';
                signinMessage.classList.add('success');
                signinMessage.style.display = 'block';

                setTimeout(() => {
                    window.location.href = 'admin.html';  // Página a la que rediriges tras iniciar sesión
                }, 2000);

            } catch (error) {
                console.error('Error during login:', error);
                signinMessage.textContent = 'Inicio de sesión fallido';
                signinMessage.classList.add('error');
                signinMessage.style.display = 'block';
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;

            try {
                const userCredential = await registerWithEmail(email, password);
                console.log('User registered with email and password', userCredential.user);
                
                await saveUserSignUp(userCredential.user.uid, name, email);

                signupMessage.textContent = 'Creación de cuenta exitosa';
                signupMessage.classList.add('success');
                signupMessage.style.display = 'block';

                setTimeout(() => {
                    window.location.href = 'dashboard.html';  // Redirigir a la página de intereses tras registrarse
                }, 2000);

            } catch (error) {
                console.error('Error during signup:', error);
                signupMessage.textContent = 'Registro fallido';
                signupMessage.classList.add('error');
                signupMessage.style.display = 'block';
            }
        });
    }

    // Manejar la visibilidad de la contraseña en el registro
    const toggleRegisterPassword = document.getElementById('toggleRegisterPassword');
    const registerPassword = document.getElementById('registerPassword');

    toggleRegisterPassword.addEventListener('click', () => {
        const type = registerPassword.getAttribute('type') === 'password' ? 'text' : 'password';
        registerPassword.setAttribute('type', type);
        toggleRegisterPassword.classList.toggle('fa-eye-slash'); // Cambia el ícono al hacer clic
    });

    // Manejar la visibilidad de la contraseña en el inicio de sesión
    const toggleLoginPassword = document.getElementById('toggleLoginPassword');
    const loginPassword = document.getElementById('loginPassword');

    toggleLoginPassword.addEventListener('click', () => {
        const type = loginPassword.getAttribute('type') === 'password' ? 'text' : 'password';
        loginPassword.setAttribute('type', type);
        toggleLoginPassword.classList.toggle('fa-eye-slash'); // Cambia el ícono al hacer clic
    });
});