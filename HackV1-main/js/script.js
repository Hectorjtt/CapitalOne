import { db, collection, addDoc, serverTimestamp } from "./firebase-config.js"; // Asegúrate de que la ruta del archivo sea correcta

document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal");
    const addTechBtn = document.getElementById("add-tech-btn");
    const closeModal = document.getElementById("close-modal");
    const techForm = document.getElementById("tech-form");
    const techniciansTable = document.getElementById("technicians-table");
    let editingIndex = null;

    // Muestra el modal para añadir/editar banco
    addTechBtn.addEventListener("click", () => {
        document.getElementById("modal-title").innerText = "Añadir Banco";
        modal.style.display = "block";
        techForm.reset();
        editingIndex = null;
    });

    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // Añade o edita un banco
    techForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const name = document.getElementById("name").value;
        const comisionApertura = document.getElementById("phone").value;
        const tasaInteres = document.getElementById("phone2").value;
        const cat = document.getElementById("zone").value;

        if (editingIndex === null) {
            // Añadir nuevo banco a la base de datos de Firebase
            try {
                await addDoc(collection(db, "Bancos"), {
                    name,
                    comisionApertura,
                    tasaInteres,
                    cat,
                    createdAt: serverTimestamp() // Guarda la fecha y hora actuales
                });

                // Actualizar la tabla en la interfaz de usuario
                const newRow = techniciansTable.insertRow();
                newRow.insertCell(0).innerText = techniciansTable.rows.length;
                newRow.insertCell(1).innerText = name;
                newRow.insertCell(2).innerText = comisionApertura;
                newRow.insertCell(3).innerText = tasaInteres || "undefined";
                newRow.insertCell(4).innerText = cat;
                const actionsCell = newRow.insertCell(5);
                actionsCell.innerHTML = '<span class="edit">✏️</span> <span class="delete">🗑️</span>';
                actionsCell.querySelector(".edit").addEventListener("click", () => editTech(newRow));
                actionsCell.querySelector(".delete").addEventListener("click", () => deleteTech(newRow));
            } catch (error) {
                console.error("Error al añadir el banco: ", error);
            }
        } else {
            // Editar banco existente (puedes agregar lógica aquí si necesitas actualizar Firebase)
            techniciansTable.rows[editingIndex].cells[1].innerText = name;
            techniciansTable.rows[editingIndex].cells[2].innerText = comisionApertura;
            techniciansTable.rows[editingIndex].cells[3].innerText = tasaInteres || "undefined";
            techniciansTable.rows[editingIndex].cells[4].innerText = cat;
        }

        modal.style.display = "none";
    });

    // Función para editar banco
    function editTech(row) {
        document.getElementById("modal-title").innerText = "Editar Banco";
        modal.style.display = "block";
        editingIndex = row.rowIndex - 1;
        document.getElementById("name").value = row.cells[1].innerText;
        document.getElementById("phone").value = row.cells[2].innerText;
        document.getElementById("phone2").value = row.cells[3].innerText;
        document.getElementById("zone").value = row.cells[4].innerText;
    }

    // Función para eliminar banco
    function deleteTech(row) {
        techniciansTable.deleteRow(row.rowIndex - 1);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Resto del código existente...

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

    // Resto del código existente...
});