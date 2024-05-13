// public/app.js
let currentPage = 1;
const cardsPerPage = 5;
let allProducts = [];

function searchProducts() {
    const searchQuery = document.getElementById('searchQuery').value;
    fetch(`http://localhost:3000/search?query=${encodeURIComponent(searchQuery)}`)
        .then(response => response.json())
        .then(data => {
            allProducts = [].concat(...Object.values(data));  // Aplana los resultados
            allProducts.sort((a, b) => a.price - b.price);  // Ordena por precio
            showCards();
            setupPagination();
        })
        .catch(error => console.error('Error:', error));
}

function showCards() {
    const cardsContainer = document.getElementById('cards-container');
    cardsContainer.innerHTML = '';  // Limpiar tarjetas anteriores
    let start = (currentPage - 1) * cardsPerPage;
    let end = start + cardsPerPage;
    for (let i = start; i < end && i < allProducts.length; i++) {
        const product = allProducts[i];
        let card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
                    <div class="card-image">
                        <img src="${product.imageUrl}" alt="Imagen de ${product.title}">
                    </div>
                    <div class="card-info">
                        <h3>${product.title}</h3>
                        <p>$${product.price}</p>
                        <p>${product.storeName || 'Nombre de tienda no disponible'}</p>
                        <a href="${product.link}" target="_blank">Ver Producto</a>
                    </div>`;
        cardsContainer.appendChild(card);
    }
}

function setupPagination() {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';  // Limpiar paginación anterior
    const pageCount = Math.ceil(allProducts.length / cardsPerPage);
    for (let i = 1; i <= pageCount; i++) {
        let button = document.createElement('button');
        button.innerText = i;
        button.onclick = () => { currentPage = i; showCards(); };
        pagination.appendChild(button);
    }
}
