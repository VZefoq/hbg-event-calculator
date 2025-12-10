function parseUptime() {
    const hours = parseInt(document.getElementById('hours').value) || 0;
    const minutes = parseInt(document.getElementById('minutes').value) || 0;
    const seconds = parseInt(document.getElementById('seconds').value) || 0;

    if (minutes >= 60 || seconds >= 60) {
        throw new Error('Minutes and seconds must be less than 60');
    }

    const totalMinutes = hours * 60 + minutes + seconds / 60;
    return totalMinutes;
}

function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const secs = Math.floor((minutes * 60) % 60);
    
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function calculate() {
    const errorDiv = document.getElementById('error');
    const resultDiv = document.getElementById('result');

    errorDiv.classList.remove('show');
    resultDiv.classList.remove('show');

    try {
        const totalMinutes = parseUptime();
        
        const cycleLength = 75;
        const fullCycleLength = 300; // 4 events
        
        const positionInFullCycle = totalMinutes % fullCycleLength;
        
        let nextEventType, nextEventMinutes, nextEventTime;
        
        if (positionInFullCycle < 75) {
            nextEventType = "Pumpkin Moon";
            nextEventMinutes = 75 - positionInFullCycle;
            nextEventTime = totalMinutes + nextEventMinutes;
        } else if (positionInFullCycle < 150) {
            nextEventType = "Pumpkin Moon";
            nextEventMinutes = 150 - positionInFullCycle;
            nextEventTime = totalMinutes + nextEventMinutes;
        } else if (positionInFullCycle < 225) {
            nextEventType = "Pumpkin Moon";
            nextEventMinutes = 225 - positionInFullCycle;
            nextEventTime = totalMinutes + nextEventMinutes;
        } else {
            nextEventType = "Prototype";
            nextEventMinutes = 300 - positionInFullCycle;
            nextEventTime = totalMinutes + nextEventMinutes;
        }

        const upcomingEvents = [];
        
        for (let i = 0; i < 4; i++) {
            const eventTime = nextEventTime + (i * cycleLength);
            const timeUntil = eventTime - totalMinutes;
            
            const eventPosition = Math.floor(eventTime / cycleLength) % 4;
            
            let type;
            if (eventPosition === 0) {
                type = "Prototype";
            } else {
                type = "Pumpkin Moon";
            }
            
            upcomingEvents.push({
                type: type,
                minutes: Math.round(timeUntil * 10) / 10,
                time: formatTime(timeUntil)
            });
        }

        let html = '';
        upcomingEvents.forEach((event, index) => {
            const cssClass = event.type === "Pumpkin Moon" ? "pumpkin" : "prototype";
            const emoji = event.type === "Pumpkin Moon" ? "🎃" : "";
            const imgTag = event.type === "Prototype" ? '<img src="https://static.wikia.nocookie.net/heroes-battlegrounds/images/4/4b/NamuMHB.png" alt="Prototype" class="event-icon">' : "";
            
            html += `
                <div class="result-item ${cssClass}">
                    <div class="result-label">${index === 0 ? 'Next Event' : `Event ${index + 1}`}</div>
                    <div class="result-value">${emoji}${imgTag} ${event.type}</div>
                    <div class="result-time">Spawns in ${event.minutes} minutes (${event.time})</div>
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

    // particle generator
function createParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    document.body.appendChild(particlesContainer);
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 4 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        particle.style.left = `${Math.random() * 100}vw`;
        
        const duration = Math.random() * 20 + 20;
        particle.style.animationDuration = `${duration}s`;
        
        particle.style.animationDelay = `${Math.random() * 5}s`;
        
        particle.style.opacity = Math.random() * 0.3 + 0.1;
        
        particlesContainer.appendChild(particle);
    }
}

window.addEventListener('load', createParticles);
});
