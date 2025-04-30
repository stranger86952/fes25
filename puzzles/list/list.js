function renderList(csv) {
    // "id","visibility","kind","difficulty","author","link"
    const lines = csv.split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const listTable = document.getElementById('list-table');
    const savedStatus = new Set(localStorage.getItem('puzzleStatus')?.split(',') || []);
    const urlParams = new URLSearchParams(window.location.search);

    const selectedKind = urlParams.get('kind') || 'All';
    const minDifficulty = parseInt(urlParams.get('minDifficulty')) || 1;
    const maxDifficulty = parseInt(urlParams.get('maxDifficulty')) || 5;
    const selectedStatus = urlParams.get('status') || 'All';

    const kindsSet = new Set(["掛け算リンク", "シャカシャカ", "スリザーリンク", "ぬりかべ", "ののぐらむ", "ナンバーリンク", "四角に切れ", "シンプルループ", "カックロ", "フィッシング", "へやわけ", "ましゅ", "美術館", "LITS"]);
    const list = [];

    listTable.innerHTML = '';

    // It doesn't work when some error lines are included in list.csv
    lines.slice(1).forEach(line => {
        const values = parseCsvLine(line).map(v => v.replace(/"/g, '').trim());
        const puzzle = headers.reduce((obj, header, index) => {
            obj[header] = values[index];
            return obj;
        }, {});

        if (puzzle.visibility !== 'public') {
            return;
        }

        if ((!kindsSet.has(puzzle.kind)) || (selectedKind !== 'All' && puzzle.kind !== selectedKind)) {
            return;
        }

        if (puzzle.difficulty < minDifficulty || puzzle.difficulty > maxDifficulty) {
            return;
        }

        if (selectedStatus !== 'All' && ((selectedStatus === 'solved' && !savedStatus.has(puzzle.id)) || (selectedStatus === 'unsolved' && savedStatus.has(puzzle.id)))) {
            return;
        }

        list.push(puzzle);
    });

    // Sort list by kind, difficulty, and then id
    list.sort((a, b) => {
        const kindOrder = Array.from(kindsSet);
        const kindIndexA = kindOrder.indexOf(a.kind);
        const kindIndexB = kindOrder.indexOf(b.kind);
        if (kindIndexA !== kindIndexB) {
            return kindIndexA - kindIndexB;
        }

        if (a.difficulty !== b.difficulty) {
            return a.difficulty - b.difficulty;
        }

        return a.id - b.id;
    });

    list.forEach(puzzle => {
        const col = document.createElement('div');
        col.className = 'col-6 col-md-4 col-lg-3';

        const card = document.createElement('div');
        card.className = 'list-card';
        if (savedStatus.has(puzzle.id)) {
            card.style.backgroundColor = 'lightgreen';
        }

        const img = document.createElement('img');
        img.src = `./thumbnails/${puzzle.id}.png`;
        img.alt = puzzle.kind;

        const title = document.createElement('h5');
        title.textContent = `☆${puzzle.difficulty} ${puzzle.kind}`;

        const author = document.createElement('p');
        author.textContent = `作者: ${puzzle.author}`;

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
        link.textContent = 'パズルを開く';
        link.target = '_blank';
        link.className = 'btn btn-primary btn-sm';

        card.appendChild(img);
        card.appendChild(title);
        card.appendChild(author);
        card.appendChild(recordButton);
        card.appendChild(link);
        col.appendChild(card);

        listTable.appendChild(col);
    });

    if (list.length === 0) {
        const message = document.createElement('p');
        message.textContent = '条件に合うパズルは見つかりませんでした';
        message.className = 'text-center text-muted mt-4';
        message.style.marginBottom = '20px';
        listTable.appendChild(message);
    }

    renderFilters(Array.from(kindsSet));

    fetch('./rules.yaml')
    .then(res => res.text())
    .then(yamlText => {
        const rules = jsyaml.load(yamlText);
        const detailDiv = document.getElementById('list-detail');
        if (rules[selectedKind]) {
            // Definitely I dislike innerHTML too, but yeah, it's what it is.
            detailDiv.innerHTML = rules[selectedKind];
        } else {
            detailDiv.textContent = '';
        }
    })
    .catch(err => console.error('Failed to load rules.yaml:', err));
}

function parseCsvLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result.map(v => v.trim());
}

function renderFilters(kinds) {
    const kindSelect = document.getElementById('kind-select');
    const difficultyMinSelect = document.getElementById('difficulty-min');
    const difficultyMaxSelect = document.getElementById('difficulty-max');
    const statusSelect = document.getElementById('status-select');

    const difficultySet = ["☆1 おてごろ", "☆2 ふつう", "☆3 むずかしい", "☆4 激ムズ", "☆5 鬼"];

    kindSelect.innerHTML = '<option value="All">全て</option>';
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
            option.textContent = difficultySet[i-1];
            difficultyMinSelect.appendChild(option);
        }
        if (i >= minDifficulty) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = difficultySet[i-1];
            difficultyMaxSelect.appendChild(option);
        }
    }

    kindSelect.value = params.get('kind') || 'All';
    difficultyMinSelect.value = minDifficulty;
    difficultyMaxSelect.value = maxDifficulty;
    statusSelect.value = params.get('status') || 'All';

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
    if (kind !== 'All') params.set('kind', kind);
    if (minDifficulty !== '1') params.set('minDifficulty', minDifficulty);
    if (maxDifficulty !== '5') params.set('maxDifficulty', maxDifficulty);
    if (status !== 'All') params.set('status', status);

    window.location.search = params.toString();
}

fetch('./list.csv')
    .then(response => response.text())
    .then(csv => renderList(csv))
    .catch(err => console.error('(k_sub)', err));
