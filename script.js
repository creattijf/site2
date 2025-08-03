document.addEventListener('DOMContentLoaded', () => {

    const IS_ON_RENDER = window.location.hostname.includes('onrender.com');
    // ВАЖНО: ЗАМЕНИТЕ 'your-backend-name' НА РЕАЛЬНОЕ ИМЯ ВАШЕГО БЭКЕНД СЕРВИСА НА RENDER
    const API_BASE_URL = IS_ON_RENDER 
        ? 'https://koreanasiashop-backend.onrender.com' 
        : 'http://127.0.0.1:8000';

    let allProducts = [];
    let favorites = JSON.parse(localStorage.getItem('koreanShopFavorites')) || [];
    let currentProductImages = [];
    let currentImageIndex = 0;
    let touchStartX = 0;

    const preloader = document.querySelector('.preloader');
    const heroTitle = document.querySelector('.hero__title');
    const heroBg = document.querySelector('.hero__gradient-bg');
    const productGrid = document.querySelector('.product-grid');
    const filtersContainer = document.querySelector('.catalog__filters');
    const favoritesCounter = document.getElementById('favorites-counter');
    const favoritesBtn = document.getElementById('favorites-btn');
    const favoritesModal = document.getElementById('favoritesModal');
    const favoritesGrid = document.getElementById('favorites-grid');
    const favoritesEmptyMsg = document.getElementById('favorites-empty-msg');
    const productModal = document.getElementById('productModal');
    const modalNavPrev = productModal.querySelector('.modal-nav--prev');
    const modalNavNext = productModal.querySelector('.modal-nav--next');
    const modalImage = document.getElementById('modalImg');

    function initAnimations() {
        gsap.registerPlugin(ScrollTrigger);
        gsap.to('.hero__title .line-mask span', { y: 0, duration: 1, stagger: 0.2, ease: 'power3.out', delay: 0.2 });
        gsap.to('.hero__subtitle .line-mask span', { y: 0, duration: 1, ease: 'power3.out', delay: 0.6 });
        gsap.to('.hero__btn', { opacity: 1, duration: 1, ease: 'power3.out', delay: 1 });
        const storyItems = gsap.utils.toArray(".story-item");
        storyItems.forEach(item => {
            const image = item.querySelector('.story-image-container img');
            const headlineSpans = item.querySelectorAll('h3 .line-mask span');
            const paragraph = item.querySelector('p');
            const tl = gsap.timeline({ scrollTrigger: { trigger: item, start: "top 85%", toggleActions: "play none none none" } });
            tl.to(item, { opacity: 1, duration: 0.1 });
            if (image) tl.to(image, { scale: 1, duration: 1.6, ease: 'power3.out' }, 0);
            if (headlineSpans.length > 0) tl.to(headlineSpans, { y: 0, duration: 1.2, stagger: 0.1, ease: 'power3.out' }, 0.2);
            if (paragraph) tl.from(paragraph, { y: 20, opacity: 0, duration: 1, ease: 'power3.out' }, 0.6);
        });
    }
    
    async function initApp() {
        try {
            const [productsResponse, categoriesResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/api/products/`),
                fetch(`${API_BASE_URL}/api/categories/`)
            ]);
            if (!productsResponse.ok || !categoriesResponse.ok) throw new Error('Network response was not ok');
            allProducts = await productsResponse.json();
            const categories = await categoriesResponse.json();
            displayCategoryFilters(categories);
            displayProducts(allProducts);
            fillLookbooks(allProducts);
            updateFavoritesCounter();
        } catch (error) {
            console.error("Could not fetch data:", error);
            if(productGrid) productGrid.innerHTML = `<p style="text-align:center; color: red; width: 100%;">Не удалось загрузить данные. Убедитесь, что бэкенд-сервер запущен и доступен по адресу: ${API_BASE_URL}</p>`;
        }
    }

    function displayCategoryFilters(categories) {
        if (!filtersContainer) return;
        filtersContainer.innerHTML = '<button class="filter-btn active" data-filter="all">Все</button>';
        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'filter-btn';
            button.dataset.filter = category.slug;
            button.textContent = category.name;
            filtersContainer.appendChild(button);
        });
        addFilterButtonListeners();
    }
    
    function displayProducts(productsToDisplay) { if (!productGrid) return; productGrid.innerHTML = ''; if (productsToDisplay.length === 0) { productGrid.innerHTML = '<p style="text-align:center; width:100%;">Товары в этой категории скоро появятся.</p>'; return; } productsToDisplay.forEach(product => { const isFavorite = favorites.includes(product.id); const mainImage = product.images[0] || 'https://via.placeholder.com/400x350.png?text=No+Image'; const altImage = product.images.length > 1 ? product.images[1] : mainImage; productGrid.innerHTML += `<div class="product-card" data-category="${product.category}"><div class="product-card__image-wrapper" data-id="${product.id}"><img class="product-card__image--main" src="${mainImage}" alt="${product.name}"><img class="product-card__image--alt" src="${altImage}" alt="${product.name}"></div><div class="favorite-icon ${isFavorite ? 'active' : ''}" data-id="${product.id}"><i class="fa-solid fa-heart"></i></div><div class="card-info"><h3>${product.name}</h3><p class="price">${parseFloat(product.price).toLocaleString('ru-RU')} ₽</p><button class="btn-details" data-id="${product.id}">Подробнее</button></div></div>`; }); addAllEventListeners(); }
    
    function fillLookbooks(products) {
        const lookbookContainers = document.querySelectorAll('.look-products');
        const lookbookMapping = { '1': [2, 3], '2': [5, 6] };
        lookbookContainers.forEach(container => {
            const lookId = container.dataset.lookId;
            const productIds = lookbookMapping[lookId];
            if (productIds) {
                container.innerHTML = '';
                productIds.forEach(id => {
                    const product = products.find(p => p.id === id);
                    if (product && product.images.length > 0) {
                        const mainImage = product.images[0];
                        container.innerHTML += `<div class="look-product-card" data-id="${product.id}"><img src="${mainImage}" alt="${product.name}"><span>${product.name}</span></div>`;
                    }
                });
            }
        });
        addLookbookCardListeners();
    }

    function addFilterButtonListeners() { const filterButtons = document.querySelectorAll('.filter-btn'); filterButtons.forEach(button => { button.addEventListener('click', () => { filterButtons.forEach(btn => btn.classList.remove('active')); button.classList.add('active'); const filter = button.dataset.filter; const filteredProducts = (filter === 'all') ? allProducts : allProducts.filter(product => product.category === filter); displayProducts(filteredProducts); }); }); }
    function showProductInModal(product) { if (!product) return; document.getElementById('modalTitle').textContent = product.name; document.getElementById('modalPrice').textContent = `${parseFloat(product.price).toLocaleString('ru-RU')} ₽`; currentProductImages = product.images || []; currentImageIndex = 0; const showNav = currentProductImages && currentProductImages.length > 1; modalNavPrev.classList.toggle('hidden', !showNav); modalNavNext.classList.toggle('hidden', !showNav); updateModalImage(); productModal.style.display = 'flex'; }
    
    function addAllEventListeners() {
        document.querySelectorAll('.btn-details, .product-card__image-wrapper').forEach(el => { el.addEventListener('click', (e) => { const productId = parseInt(e.currentTarget.dataset.id, 10); const product = allProducts.find(p => p.id === productId); if (product) showProductInModal(product); }); });
        document.querySelectorAll('.favorite-icon').forEach(icon => { icon.addEventListener('click', (e) => { const productId = parseInt(e.currentTarget.dataset.id, 10); toggleFavorite(productId); }); });
    }
    
    function addLookbookCardListeners() {
        document.querySelectorAll('.look-product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const productId = parseInt(e.currentTarget.dataset.id, 10);
                const product = allProducts.find(p => p.id === productId);
                if (product) showProductInModal(product);
            });
        });
    }

    const updateFavoritesCounter = () => { if(favoritesCounter) favoritesCounter.textContent = favorites.length; };
    const saveFavorites = () => { localStorage.setItem('koreanShopFavorites', JSON.stringify(favorites)); };
    function toggleFavorite(productId) { const index = favorites.indexOf(productId); if (index > -1) favorites.splice(index, 1); else favorites.push(productId); saveFavorites(); updateFavoritesCounter(); document.querySelectorAll(`.favorite-icon[data-id="${productId}"]`).forEach(icon => { icon.classList.toggle('active', index === -1); }); }
    function updateModalImage() { if (currentProductImages && currentProductImages.length > 0) { modalImage.style.opacity = 0; setTimeout(() => { modalImage.src = currentProductImages[currentImageIndex]; modalImage.style.opacity = 1; }, 200); let counter = productModal.querySelector('.modal-image-counter'); if (!counter) { counter = document.createElement('div'); counter.className = 'modal-image-counter'; productModal.querySelector('.modal-body').prepend(counter); } counter.textContent = `${currentImageIndex + 1} / ${currentProductImages.length}`; } }
    function showNextImage() { if (!currentProductImages || currentProductImages.length <= 1) return; currentImageIndex = (currentImageIndex + 1) % currentProductImages.length; updateModalImage(); }
    function showPrevImage() { if (!currentProductImages || currentProductImages.length <= 1) return; currentImageIndex = (currentImageIndex - 1 + currentProductImages.length) % currentProductImages.length; updateModalImage(); }
    
    function displayFavoritesModal() {
        if (!favoritesGrid) return;
        favoritesGrid.innerHTML = '';
        const favoriteProducts = allProducts.filter(p => favorites.includes(p.id));
        if (favoriteProducts.length === 0) { favoritesEmptyMsg.style.display = 'block'; } 
        else {
            favoritesEmptyMsg.style.display = 'none';
            favoriteProducts.forEach(product => {
                favoritesGrid.innerHTML += `<div class="favorite-item"><button class="favorite-item__remove" data-id="${product.id}" aria-label="Удалить из избранного">&times;</button><img src="${product.images[0]}" alt="${product.name}"><h4>${product.name}</h4><p>${parseFloat(product.price).toLocaleString('ru-RU')} ₽</p></div>`;
            });
        }
        addRemoveFromFavoritesListeners();
        if(favoritesModal) favoritesModal.style.display = 'flex';
    }

    function addRemoveFromFavoritesListeners() {
        document.querySelectorAll('.favorite-item__remove').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.currentTarget.dataset.id, 10);
                toggleFavorite(productId);
                displayFavoritesModal();
            });
        });
    }

    if(modalNavNext) modalNavNext.addEventListener('click', showNextImage);
    if(modalNavPrev) modalNavPrev.addEventListener('click', showPrevImage);
    if(modalImage){ modalImage.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }); modalImage.addEventListener('touchend', (e) => { const touchEndX = e.changedTouches[0].clientX; const swipeThreshold = 50; if (touchStartX - touchEndX > swipeThreshold) showNextImage(); else if (touchEndX - touchStartX > swipeThreshold) showPrevImage(); }); }
    if(favoritesBtn) favoritesBtn.addEventListener('click', (e) => { e.preventDefault(); displayFavoritesModal(); });
    document.querySelectorAll('.modal').forEach(modal => { modal.querySelector('.close-btn').addEventListener('click', () => { modal.style.display = 'none'; }); modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; }); });
    document.querySelectorAll('a[href^="#"]').forEach(anchor => { anchor.addEventListener('click', function (e) { e.preventDefault(); const target = document.querySelector(this.getAttribute('href')); if(target) target.scrollIntoView({ behavior: 'smooth' }); }); });
    if(heroBg) heroBg.addEventListener('mousemove', e => { const x = (e.clientX / window.innerWidth) * 100; const y = (e.clientY / window.innerHeight) * 100; heroBg.style.setProperty('--x', `${x}%`); heroBg.style.setProperty('--y', `${y}%`); });
    if (typeof ymaps !== 'undefined') { ymaps.ready(() => { try { const myMap = new ymaps.Map("map", { center: [42.0592, 48.2913], zoom: 16 }); const myPlacemark = new ymaps.Placemark([42.0592, 48.2913], { hintContent: 'KoreanAsiaShop', balloonContent: 'ул. Модная, д. 5' }, { iconLayout: 'default#image', iconImageHref: 'https://img.icons8.com/ios-filled/50/e6a4b4/marker.png', iconImageSize: [40, 40], iconImageOffset: [-20, -40] }); myMap.geoObjects.add(myPlacemark); myMap.controls.remove('geolocationControl').remove('searchControl').remove('trafficControl').remove('typeSelector').remove('rulerControl'); } catch (error) { console.error("Ошибка при инициализации Яндекс.Карт.", error); const mapEl = document.getElementById('map'); if(mapEl) mapEl.innerHTML = '<p style="text-align:center; padding: 2rem;">Не удалось загрузить карту.</p>'; } }); }
    
    window.addEventListener('load', () => {
        if(preloader) preloader.classList.add('hidden');
        document.body.classList.remove('loading');
        initAnimations();
    });
    initApp();
});