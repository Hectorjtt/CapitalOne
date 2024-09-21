// Función para generar el PDF de amortización
function generarPDF(bank, amortizacion) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text(`Banco: ${bank.name}`, 10, 10);
  doc.text(`Monto solicitado: $10,000`, 10, 20);
  doc.text(`Tasa de interés ajustada: ${bank.tasaInteresAjustada}%`, 10, 30);
  doc.text(`CAT: ${bank.cat}%`, 10, 40);
  doc.text(`Pago mensual: $${bank.monthlyPayment.toFixed(2)}`, 10, 50);

  // Agregar la tabla de amortización
  let startY = 60;
  doc.text('Tabla de Amortización', 10, startY);
  amortizacion.forEach((row, index) => {
      doc.text(
          `${index + 1}. Capital: $${row.capital} | Interés: $${row.interes} | Saldo: $${row.saldo}`, 
          10, 
          startY + (index + 1) * 10
      );
  });

  // Guardar el PDF
  doc.save(`${bank.name}_amortizacion.pdf`);
}

// Agregar el botón de descarga del PDF en la tabla de detalles
detailsSection.innerHTML += `
  <button class="btn btn-success mt-3" id="download-pdf">Descargar PDF</button>
`;

// Manejar el evento de clic para descargar el PDF
document.getElementById('download-pdf').addEventListener('click', function() {
  generarPDF(bank, amortizacion);
});
