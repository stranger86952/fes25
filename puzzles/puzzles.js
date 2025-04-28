function renderPuzzles(csv) {
    // "id","visibility","kind","difficulty","author","link"
    const lines = csv.split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const puzzlesTable = document.getElementById('puzzles-table');
    const savedStatus = new Set(localStorage.getItem('puzzleStatus')?.split(',') || []);
    const urlParams = new URLSearchParams(window.location.search);
    
    const selectedKind = urlParams.get('kind') || 'all';
    const minDifficulty = parseInt(urlParams.get('minDifficulty')) || 1;
    const maxDifficulty = parseInt(urlParams.get('maxDifficulty')) || 5;
    const selectedStatus = urlParams.get('status') || 'all';

    const kindsSet = new Set();
    puzzlesTable.innerHTML = '';

    // It doesn't work when some error lines are included in puzzles.csv
    lines.slice(1).forEach(line => {
        const values = line.split(',').map(v => v.replace(/"/g, '').trim());
        const puzzle = headers.reduce((obj, header, index) => {
            obj[header] = values[index];
            return obj;
        }, {});
        kindsSet.add(puzzle.kind);
        renderFilters(Array.from(kindsSet));

        if (puzzle.visibility !== 'public') {

        }

        if (selectedKind !== 'all' && puzzle.kind !== selectedKind) {
            return;
        }

        if (puzzle.difficulty < minDifficulty || puzzle.difficulty > maxDifficulty) {
            return;
        }

        if (selectedStatus !== 'all' && ((selectedStatus === 'solved' && !savedStatus.has(puzzle.id)) || (selectedStatus === 'unsolved' && savedStatus.has(puzzle.id)))) {
            return;
        }

        const col = document.createElement('div');
        col.className = 'col-6 col-md-4 col-lg-3';

        const card = document.createElement('div');
        card.className = 'puzzle-card';
        if (savedStatus.has(puzzle.id)) {
            card.style.backgroundColor = 'lightgreen';
        }

        const img = document.createElement('img');
        img.src = `/fes25/puzzles/img/${puzzle.id}.png`;
        img.alt = puzzle.kind;

        const title = document.createElement('h5');
        title.textContent = `☆${puzzle.difficulty} ${puzzle.kind}`;

        const author = document.createElement('p');
        author.textContent = `Author: ${puzzle.author}`;

        const recordButton = document.createElement('i');
        recordButton.className = savedStatus.has(puzzle.id)
            ? 'fa-solid fa-square-check btn btn-lg'
            : 'fa-regular fa-square-check btn btn-lg';
        recordButton.style.cursor = 'pointer';
        recordButton.onclick = () => {
            if (savedStatus.has(puzzle.id)) {
                savedStatus.delete(puzzle.id);
                card.style.backgroundColor = '';
                recordButton.className = 'fa-regular fa-square-check btn btn-lg';
            } else {
                savedStatus.add(puzzle.id);
                card.style.backgroundColor = 'lightgreen';
                recordButton.className = 'fa-solid fa-square-check btn btn-lg';
            }
            localStorage.setItem('puzzleStatus', Array.from(savedStatus).join(','));
        };

        const link = document.createElement('a');
        link.href = puzzle.link;
        link.textContent = 'Solve Puzzle';
        link.target = '_blank';
        link.className = 'btn btn-primary btn-sm';

        card.appendChild(img);
        card.appendChild(title);
        card.appendChild(author);
        card.appendChild(recordButton);
        card.appendChild(link);
        col.appendChild(card);

        puzzlesTable.appendChild(col);
    });
}


function renderFilters(kinds) {
    const kindSelect = document.getElementById('kind-select');
    const difficultyMinSelect = document.getElementById('difficulty-min');
    const difficultyMaxSelect = document.getElementById('difficulty-max');
    const statusSelect = document.getElementById('status-select');

    kindSelect.innerHTML = '<option value="all">All</option>';
    kinds.forEach(kind => {
        const option = document.createElement('option');
        option.value = kind;
        option.textContent = kind;
        kindSelect.appendChild(option);
    });

    const params = new URLSearchParams(window.location.search);
    const minDifficulty = parseInt(params.get('minDifficulty')) || 1;
    const maxDifficulty = parseInt(params.get('maxDifficulty')) || 5;

    difficultyMinSelect.innerHTML = '';
    difficultyMaxSelect.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= maxDifficulty) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            difficultyMinSelect.appendChild(option);
        }
        if (i >= minDifficulty) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            difficultyMaxSelect.appendChild(option);
        }
    }

    kindSelect.value = params.get('kind') || 'all';
    difficultyMinSelect.value = minDifficulty;
    difficultyMaxSelect.value = maxDifficulty;
    statusSelect.value = params.get('status') || 'all';

    kindSelect.onchange = updateFilters;
    difficultyMinSelect.onchange = () => {
        if (parseInt(difficultyMinSelect.value) >= parseInt(difficultyMaxSelect.value)) {
            difficultyMaxSelect.value = difficultyMinSelect.value;
        }
        updateFilters();
    };
    difficultyMaxSelect.onchange = () => {
        if (parseInt(difficultyMaxSelect.value) <= parseInt(difficultyMinSelect.value)) {
            difficultyMinSelect.value = difficultyMaxSelect.value;
        }
        updateFilters();
    };
    statusSelect.onchange = updateFilters;

    document.getElementById('reset-filters').onclick = () => {
        window.location.href = window.location.pathname;
    };
}


function updateFilters() {
    const kind = document.getElementById('kind-select').value;
    const minDifficulty = document.getElementById('difficulty-min').value;
    const maxDifficulty = document.getElementById('difficulty-max').value;
    const status = document.getElementById('status-select').value;

    const params = new URLSearchParams();
    if (kind !== 'all') params.set('kind', kind);
    if (minDifficulty !== '1') params.set('minDifficulty', minDifficulty);
    if (maxDifficulty !== '5') params.set('maxDifficulty', maxDifficulty);
    if (status !== 'all') params.set('status', status);

    window.location.search = params.toString();
}

fetch('./puzzles.csv')
    .then(response => response.text())
    .then(csv => renderPuzzles(csv))
    .catch(err => console.error('(k_sub)', err));
