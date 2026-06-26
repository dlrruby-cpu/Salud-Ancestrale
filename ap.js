// Actualización automática de fecha en el footer
document.addEventListener("DOMContentLoaded", function() {
    const footerText = document.querySelector('.footer');
    const fecha = new Date();
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const fechaActual = `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
    
    // Esto reemplaza el año 2026 por la fecha actual dinámica
    footerText.innerHTML = footerText.innerHTML.replace('2026', fechaActual);
});
