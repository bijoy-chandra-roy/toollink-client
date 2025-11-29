const initCategoryFilters = () => {
    const categoryLinks = document.querySelectorAll('.category-list a');

    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); 
            categoryLinks.forEach(item => item.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
};

initCategoryFilters();