import { db } from '../data/firebase.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Referencias a los elementos del DOM
const loanForm = document.getElementById('loan-form');
const cardsContainer = document.getElementById('cards-container');
const resultsSection = document.getElementById('results');
const detailsSection = document.getElementById('details-section');

// Función para clasificar el score y ajustar la tasa de interés
function ajustarTasaPorScore(tasaBase, score) {
    let tasaAjustada = tasaBase;

    if (score >= 720 && score <= 850) {
        tasaAjustada = tasaBase; // Excelente (no se ajusta)
    } else if (score >= 690 && score < 720) {
        tasaAjustada = tasaBase * 1.05; // Bueno (aumenta 5%)
    } else if (score >= 630 && score < 690) {
        tasaAjustada = tasaBase * 1.10; // Regular (aumenta 10%)
    } else if (score >= 300 && score < 630) {
        tasaAjustada = tasaBase * 1.15; // Malo (aumenta 15%)
    }

    return parseFloat(tasaAjustada.toFixed(2));  // Redondeamos la tasa ajustada a 2 decimales
}

// Función para calcular el pago mensual utilizando la fórmula de amortización
function calculateMonthlyPayment(monto, plazo, tasaInteres) {
    const interesMensual = tasaInteres / 100 / 12;  // Convertir la tasa de interés anual a mensual
    const pagoMensual = (monto * interesMensual) / (1 - Math.pow(1 + interesMensual, -plazo));
    return parseFloat(pagoMensual.toFixed(2));  // Redondear a 2 decimales
}

// Función para calcular el CAT
function calculateCAT(monto, plazo, pagos, comisionApertura) {
    const comision = (comisionApertura / 100) * monto; // Convertir la comisión de apertura a valor absoluto
    let sumaPagosValorPresente = 0;

    for (let j = 1; j <= plazo; j++) {
        sumaPagosValorPresente += pagos[j - 1] / Math.pow(1 + 0.01, j / 12);  // Ajustamos la tasa efectiva para el cálculo
    }

    const montoTotalAPagar = sumaPagosValorPresente + comision;  // Calcular el monto total a pagar
    const cat = Math.pow((montoTotalAPagar / monto), (12 / plazo)) - 1; // Calcular el CAT anualizado

    return parseFloat((cat * 100).toFixed(2));
}

// Declaración del array global para los bancos
let banks = [];

// Función para cargar los bancos y calcular el CAT y los pagos mensuales
async function loadBanksAndCalculate(amount, months) {
    try {
        const score = parseInt(document.getElementById('creditScore').value);  // Obtener el score del usuario
        const banksSnapshot = await getDocs(collection(db, 'bancos'));

        banks = []; // Limpiar el array antes de llenarlo de nuevo

        banksSnapshot.forEach(doc => {
            const bankData = doc.data();
            let tasaInteresBase = parseFloat(bankData.tasaInteres);
            const comisionApertura = parseFloat(bankData.comisionApertura);

            // Ajustar la tasa de interés en función del score del usuario
            const tasaInteresAjustada = ajustarTasaPorScore(tasaInteresBase, score);

            // Calcular el pago mensual con la tasa ajustada
            const monthlyPayment = calculateMonthlyPayment(amount, months, tasaInteresAjustada);
            const pagos = Array(months).fill(monthlyPayment);  // Crear el array de pagos iguales durante el plazo

            // Calcular el CAT
            const cat = calculateCAT(amount, months, pagos, comisionApertura);

            // Guardar la tasa ajustada dentro del objeto del banco
            banks.push({
                ...bankData,
                monthlyPayment,
                cat,  // Añadir el CAT calculado
                tasaInteresAjustada  // Añadir la tasa ajustada
            });
        });

        // Ordenar los bancos por CAT, de menor a mayor
        banks.sort((a, b) => parseFloat(a.cat) - parseFloat(b.cat));

        // Mostrar solo los primeros 6 bancos
        displayResults(banks.slice(0, 6));

    } catch (error) {
        console.error('Error al cargar los bancos:', error);
    }
}

// Función para mostrar los resultados en tarjetas
function displayResults(banks) {
    cardsContainer.innerHTML = '';  // Limpiar el contenedor de tarjetas

    banks.forEach((bank, index) => {
        const card = document.createElement('div');
        card.classList.add('col-md-4', 'position-relative');

        // Asegúrate de incluir el data-bank="${index}" para identificar el banco
        card.innerHTML = `
            <div class="card bank-card h-100">
                <div class="card-number">${index + 1}</div>
                <img src="${bank.imageUrl || 'https://via.placeholder.com/150'}" class="card-img-top" alt="${bank.name}">
                <div class="card-body bank-card-body">
                    <h5 class="bank-card-title">${bank.name}</h5>
                    <p class="bank-card-text">Comisión Apertura: <strong>${bank.comisionApertura}%</strong></p>
                    <p class="bank-card-text">Tasa de Interés (Ajustada): <strong>${bank.tasaInteresAjustada}%</strong></p>
                    <p class="bank-card-text">CAT: <strong>${bank.cat}%</strong></p>
                    <p class="monthly-payment">Pago Mensual: $${bank.monthlyPayment.toFixed(2)}</p>
                    <button class="btn btn-danger mt-3" data-bank="${index}">Más detalles</button>
                </div>
            </div>
        `;
        cardsContainer.appendChild(card);
    });

    // Mostrar la sección de resultados
    resultsSection.style.display = 'block';
}

// Función para calcular la tabla de amortización
function calcularAmortizacion(monto, plazo, tasaInteres) {
    const interesMensual = tasaInteres / 100 / 12;
    const pagoMensual = calculateMonthlyPayment(monto, plazo, tasaInteres);
    let saldo = monto;
    const amortizacion = [];

    const today = new Date();
    for (let i = 1; i <= plazo; i++) {
        const interes = saldo * interesMensual;
        const capital = pagoMensual - interes;
        saldo -= capital;

        // Calculate payment date
        let paymentDate = new Date(today);
        paymentDate.setMonth(today.getMonth() + i);  // Payments every month

        amortizacion.push({
            pago: i,
            montoPagar: pagoMensual.toFixed(2),
            saldo: saldo > 0 ? saldo.toFixed(2) : 0,
            fechaPago: paymentDate.toLocaleDateString(),  // Format the date
        });
    }

    return amortizacion;
}

// Validación de formulario usando Bootstrap
(function () {
    'use strict';
    loanForm.addEventListener('submit', function (event) {
        event.preventDefault();
        event.stopPropagation();

        if (loanForm.checkValidity()) {
            const amount = parseFloat(document.getElementById('amount').value);
            const months = parseInt(document.querySelector('input[name="months"]:checked').value);

            if (amount > 0 && months > 0) {
                loadBanksAndCalculate(amount, months);
            } else {
                alert('Por favor ingresa un monto y selecciona un plazo válido.');
            }
        }

        loanForm.classList.add('was-validated');
    }, false);
})();

// Definición de la función en tu archivo main.js
function updateScoreLabel(value) {
    document.getElementById('scoreLabel').textContent = value;
}
window.updateScoreLabel = updateScoreLabel;  // Hacer que la función esté disponible globalmente

// Capturar el clic en el botón "Más detalles"
document.addEventListener('click', function(event) {
    if (event.target && event.target.classList.contains('btn-danger')) {
        const bankIndex = event.target.getAttribute('data-bank');
        const bank = banks[bankIndex];

        // Ocultar la sección de tarjetas
        resultsSection.style.display = 'none';

        // Mostrar la sección de detalles
        detailsSection.style.display = 'block';

        // Calcular la amortización
        const amortizacion = calcularAmortizacion(10000, 12, bank.tasaInteresAjustada);

        // Inyectar la información del banco en la sección de detalles
        let amortizacionTable = `
            <table class="table table-bordered mt-4">
                <thead>
                    <tr>
                        <th>Pago</th>
                        <th>Monto a Pagar</th>
                        <th>Saldo Restante</th>
                        <th>Fecha de Pago</th>
                    </tr>
                </thead>
                <tbody>
        `;

        amortizacion.forEach(row => {
            amortizacionTable += `
                <tr>
                    <td>${row.pago}</td>
                    <td>${row.montoPagar}</td>
                    <td>${row.saldo}</td>
                    <td>${row.fechaPago}</td>
                </tr>
            `;
        });

        amortizacionTable += `
                </tbody>
            </table>
        `;

        detailsSection.innerHTML = `
        <button class="btn btn-link" id="back-button">Regresar</button>
        <h2>${bank.name}</h2>
        <p>Monto solicitado: $10,000</p>
        <p>Pago periódico: $${bank.monthlyPayment.toFixed(2)}</p>
        <p>Monto total a pagar: $${(bank.monthlyPayment * 12).toFixed(2)} MXN</p>
        <p>Tasa de interés anual: ${bank.tasaInteresAjustada}%</p>
        <p>CAT: ${bank.cat}%</p>
        ${amortizacionTable}
        <button id="download-pdf" class="btn btn-primary mt-3">Descargar PDF</button>
    `;

        // Añadir funcionalidad para regresar a los bancos recomendados
        document.getElementById('back-button').addEventListener('click', function() {
            resultsSection.style.display = 'block';
            detailsSection.style.display = 'none';
        });

        // Añadir funcionalidad para descargar el PDF
        document.getElementById('download-pdf').addEventListener('click', function() {
            const { jsPDF } = window.jspdf;  // Obtener jsPDF de la biblioteca
            const doc = new jsPDF();
            doc.setFontSize(12);

            // Agregar información básica
            doc.text(`Banco: ${bank.name}`, 10, 10);
            doc.text(`Monto solicitado: $10,000`, 10, 20);
            doc.text(`Pago periódico: $${bank.monthlyPayment.toFixed(2)}`, 10, 30);
            doc.text(`Monto total a pagar: $${(bank.monthlyPayment * 12).toFixed(2)} MXN`, 10, 40);
            doc.text(`Tasa de interés anual: ${bank.tasaInteresAjustada}%`, 10, 50);
            doc.text(`CAT: ${bank.cat}%`, 10, 60);

            // Agregar la tabla de amortización
            doc.autoTable({
                startY: 70,
                head: [['Pago', 'Monto a Pagar', 'Saldo Restante', 'Fecha de Pago']],
                body: amortizacion.map(row => [row.pago, `$${row.montoPagar}`, `$${row.saldo}`, row.fechaPago]),
                theme: 'grid',
                headStyles: { fillColor: [220, 220, 220] },
                margin: { top: 70 }
            });

            doc.save(`Amortizacion_${bank.name}.pdf`);  // Descargar el PDF
        });
    }
});