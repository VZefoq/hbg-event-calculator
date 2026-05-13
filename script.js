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
        const serverLabel = serverType === 'private' ? 'Private' : 'Public';
        const upcomingEvents = [];

        for (let i = 0; i < 4; i++) {
            const timeUntil = nextSpawnDelay + i * spawnInterval;

            upcomingEvents.push({
                minutes: Math.round(timeUntil * 10) / 10,
                time: formatTime(timeUntil)
            });
        }

        let html = '';
        upcomingEvents.forEach((event, index) => {
            const unixTimestamp = Math.floor(Date.now() / 1000 + event.minutes * 60);
            const timestampTag = `<t:${unixTimestamp}:R>`;
            const label = index === 0 ? 'Next Prototype' : `Prototype ${index + 1}`;

            html += `
                <div class="result-item prototype">
                    <div class="result-label">${label} - ${serverLabel} Server</div>
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

        resultDiv.innerHTML = html;
        resultDiv.classList.add('show');
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
