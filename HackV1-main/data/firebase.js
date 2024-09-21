// Importa las funciones que necesitas de los SDKs de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFirestore, doc, setDoc, addDoc, collection, serverTimestamp, getDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBo1RiHkjIVlokhG8pzepH40Tq-pTHfFz8",
  authDomain: "capitalonehack-f959f.firebaseapp.com",
  projectId: "capitalonehack-f959f",
  storageBucket: "capitalonehack-f959f.appspot.com",
  messagingSenderId: "980554915714",
  appId: "1:980554915714:web:fb30349db6a69957d9f99b"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Exportar las funciones necesarias
export { db, app, auth };

// Registro de usuario con email y password
export const registerWithEmail = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
};

// Inicio de sesión de usuario con email y password
export const signInWithEmail = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
};

// Guardar información de registro del usuario en Firestore
export const saveUserSignUp = async (uid, name, email) => {
    try {
        await setDoc(doc(db, "users", uid), {
            name: name,
            email: email,
            createdAt: serverTimestamp()
        });
        console.log("User information saved in Firestore");
    } catch (error) {
        console.error("Error saving user data:", error);
    }
};

// Guardar información de sesión del usuario en Firestore
export const saveUserSession = async (uid) => {
    try {
        const sessionRef = await addDoc(collection(db, "userSessions"), {
            userId: uid,
            timestamp: serverTimestamp()
        });
        console.log("User session saved in Firestore", sessionRef.id);
    } catch (error) {
        console.error("Error saving session data:", error);
    }
};

// Obtener datos de usuario registrado desde Firestore
export const getUserSignUp = async (uid) => {
    try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
            console.log("User data:", userDoc.data());
            return userDoc.data();
        } else {
            console.log("No such user!");
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
};

// Obtener sesiones de usuario desde Firestore
export const getUserSessions = async () => {
    try {
        const sessionsSnapshot = await getDocs(collection(db, "userSessions"));
        const sessionsList = sessionsSnapshot.docs.map(doc => doc.data());
        console.log("User sessions:", sessionsList);
        return sessionsList;
    } catch (error) {
        console.error("Error fetching sessions:", error);
    }
};
