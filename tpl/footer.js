function renderFooter(html) {
    document.querySelector('footer').innerHTML = html;
}

fetch('/fes25/tpl/footer.html')
    .then(response => response.text())
    .then(html => renderFooter(html))
    .catch(err => console.error('(k_sub)', err));
