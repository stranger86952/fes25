fetch('/tpl/header.html')
  .then(response => response.text())
  .then(html => {
    // embedding /tpl/header.html
    document.querySelector('header').innerHTML = html;
    // setting header button
    document.getElementById('menu-toggle').addEventListener('click', () => {
        document.getElementById('menu').classList.toggle('show');
    });
  })
  .catch(err => console.error('Failed to load /tpl/header.html: ', err));