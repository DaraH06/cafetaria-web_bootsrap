// File: js/cart.js (Versi Final dengan Perbaikan Duplikasi Listener & Robustness)

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. INISIALISASI & SETUP AWAL ---
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    const cartIcon = document.getElementById('cart-icon');
    let cartBadge; // Deklarasikan di sini

    if (cartIcon) { // Hanya jalankan jika ikon keranjang ada
        cartBadge = document.createElement('span');
        cartBadge.className = 'cart-badge';
        // Pastikan parentElement ada sebelum mengatur style
        if (cartIcon.parentElement) {
            cartIcon.parentElement.style.position = 'relative';
            cartIcon.parentElement.appendChild(cartBadge);
        }
    }


    // --- 2. FUNGSI-FUNGSI UTAMA KERANJANG ---
    const saveCart = () => {
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
    };
    const parsePrice = (priceString) => {
        return parseInt(priceString.replace(/k/i, '000').replace(/[^0-9]/g, ''));
    };
    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    };
    const addToCart = (product) => {
        const existingProductIndex = cart.findIndex(item => item.id === product.id);
        if (existingProductIndex > -1) {
            cart[existingProductIndex].quantity += 1;
        } else {
            cart.push(product);
        }
        saveCart();
        updateCartUI();
        showNotification(`${product.name} berhasil ditambahkan!`);
    };
    const updateQuantity = (productId, newQuantity) => {
        const productIndex = cart.findIndex(item => item.id === productId);
        if (productIndex > -1) {
            if (newQuantity > 0) {
                cart[productIndex].quantity = newQuantity;
            } else {
                cart.splice(productIndex, 1);
            }
            saveCart();
            updateCartUI();
            renderCartPopup();
        }
    };


    // --- 3. FUNGSI-FUNGSI UNTUK MEMPERBARUI TAMPILAN (UI) ---
    const showNotification = (message) => {
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) { // Cek jika masih ada
                    document.body.removeChild(notification);
                }
            }, 500);
        }, 3000);
    };

    const updateCartUI = () => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartBadge) { // Hanya update jika cartBadge ada
            if (totalItems > 0) {
                cartBadge.textContent = totalItems;
                cartBadge.style.display = 'flex';
            } else {
                cartBadge.style.display = 'none';
            }
        }
    };

    // =====================================================================
    // === FUNGSI renderCartPopup() YANG SUDAH DIPERBAIKI ===
    // =====================================================================
    const renderCartPopup = () => {
        let popup = document.querySelector('.cart-popup-container');
        if (!popup) {
            // Buat elemen pop-up jika belum ada
            popup = document.createElement('div');
            popup.className = 'cart-popup-container';
            document.body.appendChild(popup);
            
            // Event listener hanya ditambahkan saat kontainer pop-up pertama kali dibuat
            addPopupEventListeners(popup); 
        }

        // Setelah itu, baru update innerHTML popup berdasarkan isi keranjang
        if (cart.length === 0) {
            popup.innerHTML = `
                <div class="cart-popup">
                    <div class="cart-popup-header"><h2>Keranjang Belanja</h2><button class="close-popup-btn">&times;</button></div>
                    <p class="cart-empty-message">Keranjang belanja Anda masih kosong.</p>
                    <div class="cart-popup-footer"><button class="back-btn">Kembali Berbelanja</button></div>
                </div>
            `;
        } else {
            const cartItemsHTML = cart.map(item => `
                <div class="cart-popup-item" data-id="${item.id}">
                    <img src="${item.image}" alt="${item.name || 'Produk'}">
                    <div class="item-details"><p class="item-name">${item.name}</p><p class="item-price">${formatRupiah(item.price)}</p></div>
                    <div class="item-quantity"><button class="quantity-btn decrease-btn">-</button><span>${item.quantity}</span><button class="quantity-btn increase-btn">+</button></div>
                    <p class="item-total">${formatRupiah(item.price * item.quantity)}</p>
                </div>
            `).join('');
            const grandTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
            popup.innerHTML = `
                <div class="cart-popup">
                    <div class="cart-popup-header"><h2>Keranjang Belanja</h2><button class="close-popup-btn">&times;</button></div>
                    <div class="cart-popup-body">${cartItemsHTML}</div>
                    <div class="cart-popup-summary"><strong>Total Pembelian:</strong><strong>${formatRupiah(grandTotal)}</strong></div>
                    <div class="cart-popup-footer">
                        <button class="back-btn">Kembali</button>
                        <button class="checkout-btn">Lakukan Pembelian</button>
                    </div>
                </div>
            `;
        }
    };
    // =====================================================================


    const hideCartPopup = () => {
        const popup = document.querySelector('.cart-popup-container');
        if (popup) popup.classList.remove('show');
    };

    const showSuccessPopup = () => {
        const successPopup = document.createElement('div');
        successPopup.className = 'success-popup-container';
        successPopup.innerHTML = `
            <div class="success-popup">
                <div class="success-icon">✔</div>
                <h2>Pembelian Berhasil!</h2>
                <p>Terima kasih telah berbelanja 😊😊</p>
                <button class="success-close-btn">OK</button>
            </div>
        `;
        document.body.appendChild(successPopup);
        successPopup.querySelector('.success-close-btn').addEventListener('click', () => {
            if (document.body.contains(successPopup)) { // Cek jika masih ada
                 document.body.removeChild(successPopup);
            }
        });
    };

    // --- 4. EVENT LISTENERS ---
    const productSection = document.querySelector('.cream_section');
    if (productSection) {
        productSection.addEventListener('click', (e) => {
            const addToCartBtn = e.target.closest('.cart_bt a');
            if (addToCartBtn) {
                e.preventDefault();
                const creamBox = addToCartBtn.closest('.cream_box');
                const name = creamBox.querySelector('.strawberry_text').textContent;
                const priceString = creamBox.querySelector('.price_text').textContent;
                const imageElement = creamBox.querySelector('.cream_img img');
                const image = imageElement ? imageElement.src : 'images/default-product.png'; // Fallback image
                const product = {
                    id: name.replace(/\s+/g, '-').toLowerCase(),
                    name,
                    price: parsePrice(priceString),
                    image,
                    quantity: 1
                };
                addToCart(product);
            }
        });
    }

    if (cartIcon) { // Hanya tambahkan listener jika ikon keranjang ada
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            renderCartPopup();
            const popup = document.querySelector('.cart-popup-container');
            if (popup) { // Selalu baik untuk mengecek sebelum memanipulasi
                 popup.classList.add('show');
            }
        });
    }

    const addPopupEventListeners = (popup) => {
        popup.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('close-popup-btn') || target.classList.contains('back-btn')) {
                hideCartPopup();
            }
            if (target.classList.contains('checkout-btn')) {
                if (cart.length === 0) return alert('Keranjang Anda kosong!');
                hideCartPopup();
                showSuccessPopup();
                cart = [];
                saveCart();
                updateCartUI();
            }
            if (target.classList.contains('increase-btn')) {
                const itemElement = target.closest('.cart-popup-item');
                if (!itemElement) return; // Tambahan pengecekan
                const productId = itemElement.dataset.id;
                const product = cart.find(p => p.id === productId);
                if (product) updateQuantity(productId, product.quantity + 1);
            }
            if (target.classList.contains('decrease-btn')) {
                const itemElement = target.closest('.cart-popup-item');
                if (!itemElement) return; // Tambahan pengecekan
                const productId = itemElement.dataset.id;
                const product = cart.find(p => p.id === productId);
                if (product) updateQuantity(productId, product.quantity - 1);
            }
        });
    };

    // --- 5. STYLE CSS DINAMIS ---
    const style = document.createElement('style');
    style.textContent = `
        .cart-badge { position: absolute; top: -5px; right: -10px; background-color: red; color: white; border-radius: 50%; width: 20px; height: 20px; font-size: 12px; font-weight: bold; display: flex; align-items: center; justify-content: center; border: 2px solid white; display: none; }
        .cart-notification { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background-color: #28a745; color: white; padding: 15px 30px; border-radius: 5px; font-size: 16px; z-index: 10000; opacity: 0; transition: opacity 0.3s ease, bottom 0.3s ease; }
        .cart-notification.show { opacity: 1; bottom: 40px; }
        .cart-popup-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.6); z-index: 9999; display: flex; align-items: center; justify-content: center; opacity: 0; visibility: hidden; transition: opacity 0.3s ease, visibility 0.3s ease; }
        .cart-popup-container.show { opacity: 1; visibility: visible; }
        .cart-popup { background-color: white; width: 90%; max-width: 700px; max-height: 85vh; border-radius: 8px; display: flex; flex-direction: column; overflow: hidden; }
        .cart-popup-header { padding: 15px 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
        .cart-popup-header h2 { margin: 0; font-size: 24px; }
        .close-popup-btn { background: none; border: none; font-size: 30px; cursor: pointer; line-height: 1; }
        .cart-popup-body { padding: 10px 20px; overflow-y: auto; flex-grow: 1; }
        .cart-empty-message { padding: 40px 20px; text-align: center; font-size: 18px; color: #666; }
        .cart-popup-item { display: flex; align-items: center; padding: 15px 0; border-bottom: 1px solid #f0f0f0; }
        .cart-popup-item img { width: 60px; height: 60px; object-fit: cover; border-radius: 5px; margin-right: 15px; }
        .cart-popup-item .item-details { flex-grow: 1; }
        .item-details p { margin: 0; }
        .item-name { font-weight: bold; }
        .item-price { color: #888; font-size: 14px; }
        .item-quantity { display: flex; align-items: center; margin: 0 20px; }
        .item-quantity span { padding: 0 15px; font-size: 16px; }
        .quantity-btn { width: 28px; height: 28px; border: 1px solid #ccc; background-color: #f9f9f9; cursor: pointer; font-weight: bold; border-radius: 50%; }
        .item-total { font-weight: bold; width: 120px; text-align: right; }
        .cart-popup-summary { padding: 15px 20px; border-top: 1px solid #eee; display: flex; justify-content: space-between; font-size: 18px; }
        .cart-popup-footer { padding: 15px 20px; background-color: #f7f7f7; display: flex; justify-content: space-between; align-items: center; }
        .cart-popup-footer button { padding: 12px 25px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
        .back-btn { background-color: #6c757d; color: white; }
        .checkout-btn { background-color: rgb(246, 122, 161); color: white; }
        .success-popup-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.6); z-index: 10001; display: flex; align-items: center; justify-content: center; }
        .success-popup { background-color: white; padding: 40px; border-radius: 10px; text-align: center; width: 90%; max-width: 400px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); transform: scale(0.9); animation: popup-scale-in 0.3s ease-out forwards; }
        .success-icon { width: 80px; height: 80px; margin: 0 auto 20px; background-color: #28a745; color: white; font-size: 50px; line-height: 80px; border-radius: 50%; }
        .success-popup h2 { margin: 0 0 10px 0; color: #333; }
        .success-popup p { margin: 0 0 30px 0; color: #666; }
        .success-close-btn { background-color: #007bff; color: white; border: none; padding: 12px 50px; border-radius: 5px; cursor: pointer; font-size: 16px; transition: background-color 0.2s; }
        .success-close-btn:hover { background-color: #0056b3; }
        @keyframes popup-scale-in { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @media (max-width: 576px) {
            .cart-popup { width: 95%; max-height: 85vh; display: flex; flex-direction: column; }
            .cart-popup-body { flex-grow: 1; overflow-y: auto; padding: 10px; }
            .cart-popup-item { display: grid; grid-template-columns: 75px 1fr; grid-template-rows: auto auto; grid-template-areas: "image details" "quantity total"; align-items: center; row-gap: 10px; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
            .cart-popup-item img, .cart-popup-item .item-details, .cart-popup-item .item-quantity, .cart-popup-item .item-total { margin: 0; width: auto; }
            .cart-popup-item img { grid-area: image; width: 60px; height: 60px; }
            .cart-popup-item .item-details { grid-area: details; padding-left: 10px; }
            .cart-popup-item .item-quantity { grid-area: quantity; justify-self: center; }
            .cart-popup-item .item-total { grid-area: total; justify-self: end; text-align: right; font-size: 16px; }
            .cart-popup-footer { flex-direction: column; align-items: center; gap: 10px; padding-top: 15px; padding-bottom: 15px; }
            .cart-popup-footer button { width: 90%; max-width: 320px; }
            .cart-popup-footer .checkout-btn { order: 1; }
            .cart-popup-footer .back-btn { order: 2; }
        }
    `;
    document.head.appendChild(style);

    // --- 6. JALANKAN FUNGSI AWAL ---
    updateCartUI(); // Panggil saat halaman pertama kali dimuat untuk mengupdate badge
});