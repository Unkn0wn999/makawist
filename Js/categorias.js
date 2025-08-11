document.addEventListener('DOMContentLoaded', () => {
    cargarCategoriasHome();
});

async function cargarCategoriasHome() {
    try {
        const res = await fetch('/api/categorias');
        const categorias = await res.json();

        const seccion = document.querySelector('.categorias');

        const grid = document.createElement('div');
        grid.className = 'categoria-grid';

        categorias.forEach(cat => {
            const card = document.createElement('div');
            card.className = 'categoria';

            // Generar nombre de imagen a partir del nombre de la categoría
            const nombreImagen = cat.nombre
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "") // quitar tildes
                .replace(/\s+/g, '-') + '.jpg'; // reemplazar espacios por guiones

            const img = document.createElement('img');
            img.src = `Imagenes/${nombreImagen}`;
            img.alt = cat.nombre;

            const titulo = document.createElement('h3');
            titulo.textContent = cat.nombre;

            // Redirige al hacer clic
            card.addEventListener('click', () => {
                window.location.href = `productos.html?categoria=${cat.idCategoria}`;
            });

            card.appendChild(img);
            card.appendChild(titulo);
            grid.appendChild(card);
        });

        // Insertar antes del botón "Explorar"
        const btnExplorar = seccion.querySelector('.btn-explorar');
        seccion.insertBefore(grid, btnExplorar);

    } catch (error) {
        console.error('❌ Error al cargar categorías en inicio:', error);
    }
}
