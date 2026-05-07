// cart.js

// Funciones principales para interactuar con LocalStorage
function getCart() {
    const cart = localStorage.getItem('heso_cart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('heso_cart', JSON.stringify(cart));
}

// Función para actualizar el contador del carrito en el navbar
function updateCartBadge() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');

    if (cartCountElement) {
        cartCountElement.innerHTML = `Carrito (${totalItems})`;
    }
}

// Función para añadir un producto al carrito
function addToCart(product) {
    const cart = getCart();
    const existingProductIndex = cart.findIndex(item => item.id === product.id);

    if (existingProductIndex >= 0) {
        cart[existingProductIndex].quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart(cart);
    updateCartBadge();
}

// Función para eliminar un producto del carrito
function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    renderCart(); // Actualizar la vista si estamos en la página del carrito
    updateCartBadge();
}

// Función para actualizar la cantidad de un producto
function updateQuantity(productId, change) {
    const cart = getCart();
    const productIndex = cart.findIndex(item => item.id === productId);

    if (productIndex >= 0) {
        cart[productIndex].quantity += change;

        // Si la cantidad llega a 0 o menos, eliminar el producto
        if (cart[productIndex].quantity <= 0) {
            removeFromCart(productId);
            return; // removeFromCart ya guarda y renderiza
        }
    }

    saveCart(cart);
    renderCart();
    updateCartBadge();
}

// Función para formatear moneda
function formatCurrency(amount) {
    return '$' + amount.toLocaleString('es-AR');
}

// Función para renderizar los productos en la página del carrito
function renderCart() {
    const cartContainer = document.getElementById('cart-container');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTotal = document.getElementById('cart-total');

    // Si no estamos en la página del carrito, no hacemos nada
    if (!cartContainer) return;

    const cart = getCart();
    cartContainer.innerHTML = '';

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="text-center mt-4">Tu carrito está vacío.</p>';
        if (cartSubtotal) cartSubtotal.innerText = '$0';
        if (cartTotal) cartTotal.innerText = '$0';
        return;
    }

    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const cartItemHTML = `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.title}" class="cart-item-img">
                <div class="cart-item-details">
                    <h3 class="cart-item-title">${item.title}</h3>
                    <p class="cart-item-price">${formatCurrency(item.price)}</p>

                    <div class="cart-item-actions">
                        <div class="quantity-control">
                            <button class="qty-btn minus" data-id="${item.id}">-</button>
                            <input type="number" value="${item.quantity}" class="qty-input" readonly>
                            <button class="qty-btn plus" data-id="${item.id}">+</button>
                        </div>
                        <button class="remove-btn" data-id="${item.id}">ELIMINAR</button>
                    </div>
                </div>
            </div>
        `;

        cartContainer.insertAdjacentHTML('beforeend', cartItemHTML);
    });

    if (cartSubtotal) cartSubtotal.innerText = formatCurrency(subtotal);
    if (cartTotal) cartTotal.innerText = formatCurrency(subtotal); // Por ahora el total es igual al subtotal (sin envío)
}

// Event Listeners (cuando el DOM esté cargado)
document.addEventListener('DOMContentLoaded', () => {
    // 1. Actualizar el contador global
    updateCartBadge();

    // 2. Renderizar carrito si estamos en la página del carrito
    renderCart();

    // 3. Capturar clics en los botones
    document.addEventListener('click', (e) => {
        // Añadir al carrito sin redirigir
        if (e.target.classList.contains('add-to-cart-btn')) {
            e.preventDefault();
            const btn = e.target;
            const product = {
                id: btn.getAttribute('data-id'),
                title: btn.getAttribute('data-title'),
                price: parseFloat(btn.getAttribute('data-price')),
                image: btn.getAttribute('data-image')
            };
            addToCart(product);
            alert(`Se agregó "${product.title}" al carrito.`);
        }

        // Comprar ahora (añadir al carrito y redirigir)
        if (e.target.classList.contains('buy-now-btn')) {
            // No usamos e.preventDefault() para dejar que el enlace funcione
            const btn = e.target;
            const product = {
                id: btn.getAttribute('data-id'),
                title: btn.getAttribute('data-title'),
                price: parseFloat(btn.getAttribute('data-price')),
                image: btn.getAttribute('data-image')
            };
            addToCart(product);
        }

        // Botones de + y - en el carrito
        if (e.target.classList.contains('qty-btn')) {
            const id = e.target.getAttribute('data-id');
            const isPlus = e.target.classList.contains('plus');
            updateQuantity(id, isPlus ? 1 : -1);
        }

        // Botón de eliminar en el carrito
        if (e.target.classList.contains('remove-btn')) {
            const id = e.target.getAttribute('data-id');
            removeFromCart(id);
        }
    });
});
