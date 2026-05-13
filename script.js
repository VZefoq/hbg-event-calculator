function parseUptime() {
    const hours = parseInt(document.getElementById('hours').value) || 0;
    const minutes = parseInt(document.getElementById('minutes').value) || 0;
    const seconds = parseInt(document.getElementById('seconds').value) || 0;

    if (minutes >= 60 || seconds >= 60) {
        throw new Error('Minutes and seconds must be less than 60');
    }

    return hours * 60 + minutes + seconds / 60;
}

function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const secs = Math.floor((minutes * 60) % 60);

    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied Timestamp!');
    }).catch(err => {
        console.error('Copy failed:', err);
    });
}

function getServerType() {
    return document.querySelector('input[name="server-type"]:checked').value;
}

function getSpawnInterval(serverType) {
    return serverType === 'private' ? 30 : 300;
}

function getNextSpawnDelay(totalMinutes, intervalMinutes) {
    const remainder = totalMinutes % intervalMinutes;

    if (totalMinutes > 0 && remainder === 0) {
        return 0;
    }

    return intervalMinutes - remainder;
}

const resultsPerPage = 4;
const maxResultPages = 3;
let currentPage = 1;
let currentResults = [];
let currentServerLabel = '';
let currentBaseUnixTime = 0;

function renderResults() {
    const resultDiv = document.getElementById('result');
    const totalPages = Math.ceil(currentResults.length / resultsPerPage);
    const pageStart = (currentPage - 1) * resultsPerPage;
    const pageResults = currentResults.slice(pageStart, pageStart + resultsPerPage);

    let html = '<div class="result-list">';
    pageResults.forEach((event, index) => {
        const resultIndex = pageStart + index;
        const unixTimestamp = Math.floor(currentBaseUnixTime + event.minutes * 60);
        const timestampTag = `<t:${unixTimestamp}:R>`;
        const label = resultIndex === 0 ? 'Next Prototype' : `Prototype ${resultIndex + 1}`;

        html += `
            <div class="result-item prototype">
                <div class="result-label">${label} - ${currentServerLabel} Server</div>
                <div class="result-value">
                    <img src="https://static.wikia.nocookie.net/heroes-battlegrounds/images/4/4b/NamuMHB.png" alt="Prototype" class="event-icon">
                    Prototype
                </div>
                <div class="result-time">
                    Spawns in ${event.minutes} minutes (${event.time})
                    <button class="copy-btn" onclick="copyToClipboard('${timestampTag}')" title="Copy Discord timestamp">
                        <svg class="copy-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    });
    html += '</div>';

    html += '<div class="pagination" aria-label="Result pages">';
    html += `<button class="page-btn arrow-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} aria-label="Previous page">&lsaquo;</button>`;

    for (let page = 1; page <= totalPages; page++) {
        html += `<button class="page-btn ${page === currentPage ? 'active' : ''}" onclick="changePage(${page})" aria-label="Page ${page}">${page}</button>`;
    }

    html += `<button class="page-btn arrow-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} aria-label="Next page">&rsaquo;</button>`;
    html += '</div>';

    resultDiv.innerHTML = html;
    resultDiv.classList.add('show');
}

function changePage(page) {
    const totalPages = Math.ceil(currentResults.length / resultsPerPage);

    if (page < 1 || page > totalPages || page === currentPage) {
        return;
    }

    currentPage = page;
    renderResults();
}

function calculate() {
    const errorDiv = document.getElementById('error');
    const resultDiv = document.getElementById('result');

    errorDiv.classList.remove('show');
    resultDiv.classList.remove('show');

    try {
        const totalMinutes = parseUptime();
        const serverType = getServerType();
        const spawnInterval = getSpawnInterval(serverType);
        const nextSpawnDelay = getNextSpawnDelay(totalMinutes, spawnInterval);
        const upcomingEvents = [];

        for (let i = 0; i < resultsPerPage * maxResultPages; i++) {
            const timeUntil = nextSpawnDelay + i * spawnInterval;

            upcomingEvents.push({
                minutes: Math.round(timeUntil * 10) / 10,
                time: formatTime(timeUntil)
            });
        }

        currentPage = 1;
        currentResults = upcomingEvents;
        currentServerLabel = serverType === 'private' ? 'Private' : 'Public';
        currentBaseUnixTime = Math.floor(Date.now() / 1000);
        renderResults();
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.add('show');
    }
}

const inputs = ['hours', 'minutes', 'seconds'];

inputs.forEach((id, index) => {
    const input = document.getElementById(id);

    input.addEventListener('input', function() {
        if (this.value.length === 2 && index < inputs.length - 1) {
            document.getElementById(inputs[index + 1]).focus();
        }
    });

    input.addEventListener('keydown', function(e) {
        if (e.key === 'Backspace' && this.value.length === 0 && index > 0) {
            const prevInput = document.getElementById(inputs[index - 1]);
            prevInput.focus();
            prevInput.setSelectionRange(prevInput.value.length, prevInput.value.length);
        }
    });

    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            calculate();
        }

        if (!/^\d$/.test(e.key)) {
            e.preventDefault();
        }
    });
});
