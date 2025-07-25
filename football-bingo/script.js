class FootballBingo {
    constructor() {
        this.gameGrid = [];
        this.countries = ['Deutschland', 'Spanien', 'England', 'Frankreich', 'Italien', 'Niederlande', 'Portugal', 'Brasilien', 'Argentinien', 'Belgien'];
        this.clubs = ['Bayern München', 'Real Madrid', 'Manchester City', 'PSG', 'FC Barcelona', 'Liverpool', 'Chelsea', 'Juventus', 'AC Milan', 'Borussia Dortmund', 'Arsenal', 'Manchester United'];
        this.init();
    }

    init() {
        this.generateGrid();
        this.renderGrid();
        this.setupEventListeners();
    }

    generateGrid() {
        this.gameGrid = [];
        const shuffledCountries = [...this.countries].sort(() => 0.5 - Math.random());
        const shuffledClubs = [...this.clubs].sort(() => 0.5 - Math.random());
        
        for (let i = 0; i < 16; i++) {
            const country = shuffledCountries[i % shuffledCountries.length];
            const club = shuffledClubs[i % shuffledClubs.length];
            this.gameGrid.push({ 
                country, 
                club, 
                playerInput: '', 
                validated: false, 
                correct: false,
                loading: false 
            });
        }
    }

    renderGrid() {
        const grid = document.getElementById('bingoGrid');
        grid.innerHTML = '';
        
        this.gameGrid.forEach((cell, index) => {
            const cellDiv = document.createElement('div');
            cellDiv.className = 'bingo-cell';
            
            let inputContent = '';
            if (cell.loading) {
                inputContent = '<div class="loading-spinner">🔍</div>';
            } else {
                inputContent = `<input type="text" class="player-input" data-index="${index}" 
                               placeholder="Spielername..." ${cell.validated ? 'disabled' : ''}
                               value="${cell.playerInput}">`;
            }
            
            cellDiv.innerHTML = `
                <div class="cell-header">${cell.country}</div>
                <div class="cell-club">${cell.club}</div>
                ${inputContent}
            `;
            
            if (cell.validated) {
                cellDiv.classList.add(cell.correct ? 'correct' : 'incorrect');
            }
            
            grid.appendChild(cellDiv);
        });
    }

    async validateAnswers() {
        const inputs = document.querySelectorAll('.player-input');
        const validationPromises = [];
        
        // Zeige Loading-Spinner für alle Eingaben
        inputs.forEach((input, index) => {
            const playerName = input.value.trim();
            if (playerName && !this.gameGrid[index].validated) {
                this.gameGrid[index].loading = true;
                this.gameGrid[index].playerInput = playerName;
            }
        });
        
        this.renderGrid();
        
        // Simuliere API-Aufrufe mit realistischen Delays
        for (let index = 0; index < inputs.length; index++) {
            const cell = this.gameGrid[index];
            if (cell.playerInput && !cell.validated) {
                validationPromises.push(this.validateSinglePlayer(index));
            }
        }
        
        await Promise.all(validationPromises);
        this.renderGrid();
        this.checkGameComplete();
    }

    async validateSinglePlayer(index) {
        const cell = this.gameGrid[index];
        const playerName = cell.playerInput;
        
        // Simuliere realistische API-Verzögerung (500-2000ms)
        const delay = 500 + Math.random() * 1500;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Simuliere "intelligente" Validierung basierend auf realistischen Mustern
        const isCorrect = this.simulatePlayerValidation(playerName, cell.country, cell.club);
        
        cell.validated = true;
        cell.correct = isCorrect;
        cell.loading = false;
        
        // Zeige Zwischenergebnisse
        this.renderGrid();
    }

    simulatePlayerValidation(playerName, country, club) {
        // Normalisiere den Namen
        const normalizedName = playerName.toLowerCase().trim();
        
        // Bekannte Spieler-Kombinationen (erweiterte Liste)
        const knownPlayers = {
            // Deutschland
            'manuel neuer': { countries: ['deutschland'], clubs: ['bayern münchen', 'schalke 04'] },
            'thomas müller': { countries: ['deutschland'], clubs: ['bayern münchen'] },
            'joshua kimmich': { countries: ['deutschland'], clubs: ['bayern münchen', 'rb leipzig'] },
            'toni kroos': { countries: ['deutschland'], clubs: ['real madrid', 'bayern münchen'] },
            'ilkay gündogan': { countries: ['deutschland'], clubs: ['manchester city', 'borussia dortmund'] },
            
            // Frankreich
            'kylian mbappé': { countries: ['frankreich'], clubs: ['psg', 'as monaco'] },
            'karim benzema': { countries: ['frankreich'], clubs: ['real madrid', 'lyon'] },
            'antoine griezmann': { countries: ['frankreich'], clubs: ['fc barcelona', 'atletico madrid'] },
            'paul pogba': { countries: ['frankreich'], clubs: ['manchester united', 'juventus'] },
            
            // England
            'harry kane': { countries: ['england'], clubs: ['bayern münchen', 'tottenham'] },
            'raheem sterling': { countries: ['england'], clubs: ['chelsea', 'manchester city'] },
            'jack grealish': { countries: ['england'], clubs: ['manchester city', 'aston villa'] },
            'phil foden': { countries: ['england'], clubs: ['manchester city'] },
            
            // Spanien
            'pedri': { countries: ['spanien'], clubs: ['fc barcelona'] },
            'gavi': { countries: ['spanien'], clubs: ['fc barcelona'] },
            'sergio busquets': { countries: ['spanien'], clubs: ['fc barcelona', 'al hilal'] },
            'rodri': { countries: ['spanien'], clubs: ['manchester city', 'atletico madrid'] },
            
            // Weitere Länder
            'erling haaland': { countries: ['norwegen'], clubs: ['manchester city', 'borussia dortmund'] },
            'kevin de bruyne': { countries: ['belgien'], clubs: ['manchester city', 'chelsea'] },
            'virgil van dijk': { countries: ['niederlande'], clubs: ['liverpool', 'southampton'] },
            'cristiano ronaldo': { countries: ['portugal'], clubs: ['real madrid', 'manchester united', 'juventus'] },
            'lionel messi': { countries: ['argentinien'], clubs: ['psg', 'fc barcelona'] },
            'neymar': { countries: ['brasilien'], clubs: ['psg', 'fc barcelona'] },
            'luka modrić': { countries: ['kroatien'], clubs: ['real madrid', 'tottenham'] },
        };
        
        const player = knownPlayers[normalizedName];
        if (!player) {
            // Für unbekannte Namen: 15% Chance auf "richtig" (simuliert seltene/neue Spieler)
            return Math.random() < 0.15;
        }
        
        // Prüfe Land und Verein
        const countryMatch = player.countries.some(c => 
            c.toLowerCase() === country.toLowerCase()
        );
        const clubMatch = player.clubs.some(c => 
            c.toLowerCase() === club.toLowerCase()
        );
        
        return countryMatch && clubMatch;
    }

    checkGameComplete() {
        const validatedCells = this.gameGrid.filter(cell => cell.validated);
        const correctCells = this.gameGrid.filter(cell => cell.correct);
        
        if (validatedCells.length === 16) {
            setTimeout(() => {
                const percentage = Math.round((correctCells.length / 16) * 100);
                alert(`Spiel beendet! ${correctCells.length}/16 richtig (${percentage}%) 🎉`);
            }, 100);
        }
    }

    resetGame() {
        this.generateGrid();
        this.renderGrid();
    }

    setupEventListeners() {
        document.getElementById('validateBtn').addEventListener('click', () => {
            this.validateAnswers();
        });

        document.getElementById('newGameBtn').addEventListener('click', () => {
            this.resetGame();
        });
    }
}

new FootballBingo();

