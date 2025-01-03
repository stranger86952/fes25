function renderHeader(html) {
    document.querySelector('header').innerHTML = html;
    document.getElementById('menu-toggle').addEventListener('click', () => {
        document.getElementById('menu').classList.toggle('show');
    });
}

fetch('/fes25/tpl/header.html')
    .then(response => response.text())
    .then(html => renderHeader(html))
    .catch(err => console.error('(k_sub)', err));
