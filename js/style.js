function showMore(event) {
    event.preventDefault();
    const productPage = document.getElementById('produk-page');
    const boxes = productPage.querySelectorAll('.cream_box');
    boxes.forEach((box, i) => {
        if (i >= 6) box.classList.add('visible');
    });
    event.target.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    // Cek apakah ini halaman icecream.html
    if (window.location.pathname.includes('icecream.html')) {
        const boxes = document.querySelectorAll('.cream_box');
        boxes.forEach((box, i) => {
            if (i < 6) {
                box.classList.add('visible');
            }
        });
    } else {
        // Di halaman lain (misalnya home), tampilkan semua produk
        const boxes = document.querySelectorAll('.cream_box');
        boxes.forEach(box => box.classList.add('visible'));
    }
});