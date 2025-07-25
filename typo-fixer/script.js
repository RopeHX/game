class TypoFixer {
    constructor() {
        this.sentences = [];
        this.currentSentenceIndex = 0;
        this.currentSentence = '';
        this.targetSentence = '';
        this.startTime = null;
        this.gameActive = false;
        this.totalCharacters = 0;
        this.correctCharacters = 0;
        this.timerInterval = null;
        
        this.init();
    }

    async init() {
        await this.loadSentences();
        this.setupEventListeners();
        this.updateDisplay();
    }

    async loadSentences() {
        try {
            const response = await fetch('sentences.json');
            this.sentences = await response.json();
            console.log('Loaded sentences:', this.sentences.length); // Debug
        } catch (error) {
            console.error('Fehler beim Laden der Sätze:', error);
            // Fallback data
            this.sentences = [
                {
                    "correct": "Der schnelle braune Fuchs springt über den faulen Hund.",
                    "typo": "Der schnele braune Fux springt übre den faulen Hun."
                },
                {
                    "correct": "Programmieren macht Spaß und ist sehr kreativ.",
                    "typo": "Programieren macht Spas und ist ser kreativ."
                }
            ];
        }
    }

    startGame() {
        this.currentSentenceIndex = 0;
        this.gameActive = true;
        this.startTime = Date.now();
        this.totalCharacters = 0;
        this.correctCharacters = 0;
        
        document.getElementById('startBtn').style.display = 'none';
        document.getElementById('skipBtn').style.display = 'inline-block';
        document.getElementById('userInput').disabled = false;
        document.getElementById('userInput').focus();
        document.getElementById('results').style.display = 'none';
        
        this.loadCurrentSentence();
        this.startTimer();
    }

    loadCurrentSentence() {
        console.log('Loading sentence:', this.currentSentenceIndex, 'of', this.sentences.length); // Debug
        
        if (this.currentSentenceIndex >= this.sentences.length) {
            this.endGame();
            return;
        }

        const sentence = this.sentences[this.currentSentenceIndex];
        this.currentSentence = sentence.typo;
        this.targetSentence = sentence.correct;
        
        document.getElementById('errorSentence').textContent = this.currentSentence;
        document.getElementById('userInput').value = '';
        document.getElementById('progress').textContent = `${this.currentSentenceIndex + 1}/${this.sentences.length}`;
        
        this.updateTypingDisplay('');
    }

    updateTypingDisplay(userInput) {
        const display = document.getElementById('typingDisplay');
        const target = this.targetSentence;
        let html = '';

        for (let i = 0; i < target.length; i++) {
            const targetChar = target[i];
            const userChar = userInput[i];
            
            if (i < userInput.length) {
                if (userChar === targetChar) {
                    html += `<span class="char-correct">${targetChar}</span>`;
                } else {
                    html += `<span class="char-incorrect">${userChar}</span>`;
                }
            } else if (i === userInput.length) {
                html += `<span class="char-current">${targetChar}</span>`;
            } else {
                html += targetChar;
            }
        }

        // Zeige extra Zeichen als falsch an
        if (userInput.length > target.length) {
            const extraChars = userInput.slice(target.length);
            html += `<span class="char-incorrect">${extraChars}</span>`;
        }

        display.innerHTML = html;
    }

    checkInput() {
        const userInput = document.getElementById('userInput').value;
        this.updateTypingDisplay(userInput);

        // Prüfe ob Satz komplett und korrekt ist
        if (userInput === this.targetSentence) {
            console.log('Sentence completed correctly!'); // Debug
            this.correctCharacters += this.targetSentence.length;
            this.totalCharacters += this.targetSentence.length;
            this.nextSentence();
        }
    }

    nextSentence() {
        console.log('Moving to next sentence from:', this.currentSentenceIndex); // Debug
        this.currentSentenceIndex++;
        
        // Kurze Pause für visuelles Feedback
        setTimeout(() => {
            this.loadCurrentSentence();
        }, 800);
    }

    skipSentence() {
        this.totalCharacters += this.targetSentence.length;
        this.nextSentence();
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            if (this.gameActive) {
                const elapsed = (Date.now() - this.startTime) / 1000;
                document.getElementById('timer').textContent = elapsed.toFixed(1) + 's';
                this.updateWPM();
            }
        }, 100);
    }

    updateWPM() {
        const elapsed = (Date.now() - this.startTime) / 1000 / 60; // in Minuten
        const wordsTyped = this.correctCharacters / 5; // Standard: 5 Zeichen = 1 Wort
        const wpm = elapsed > 0 ? Math.round(wordsTyped / elapsed) : 0;
        document.getElementById('wpm').textContent = wpm;
    }

    endGame() {
        console.log('Game ended!'); // Debug
        this.gameActive = false;
        clearInterval(this.timerInterval);
        
        const totalTime = (Date.now() - this.startTime) / 1000;
        const accuracy = this.totalCharacters > 0 ? Math.round((this.correctCharacters / this.totalCharacters) * 100) : 0;
        const finalWPM = Math.round((this.correctCharacters / 5) / (totalTime / 60));

        document.getElementById('finalTime').textContent = totalTime.toFixed(1);
        document.getElementById('finalAccuracy').textContent = accuracy;
        document.getElementById('finalWPM').textContent = finalWPM;
        
        document.getElementById('results').style.display = 'block';
        document.getElementById('skipBtn').style.display = 'none';
        document.getElementById('newGameBtn').style.display = 'inline-block';
        document.getElementById('userInput').disabled = true;
    }

    resetGame() {
        this.gameActive = false;
        clearInterval(this.timerInterval);
        this.currentSentenceIndex = 0; // Reset sentence index
        
        document.getElementById('startBtn').style.display = 'inline-block';
        document.getElementById('skipBtn').style.display = 'none';
        document.getElementById('newGameBtn').style.display = 'none';
        document.getElementById('results').style.display = 'none';
        document.getElementById('userInput').disabled = true;
        document.getElementById('userInput').value = '';
        
        document.getElementById('timer').textContent = '0.0s';
        document.getElementById('wpm').textContent = '0';
        document.getElementById('progress').textContent = `1/${this.sentences.length}`;
        document.getElementById('typingDisplay').innerHTML = '';
        document.getElementById('errorSentence').textContent = '';
    }

    updateDisplay() {
        if (this.sentences.length > 0) {
            document.getElementById('progress').textContent = `1/${this.sentences.length}`;
        }
    }

    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('skipBtn').addEventListener('click', () => {
            this.skipSentence();
        });

        document.getElementById('newGameBtn').addEventListener('click', () => {
            this.resetGame();
        });

        document.getElementById('userInput').addEventListener('input', () => {
            if (this.gameActive) {
                this.checkInput();
            }
        });

        document.getElementById('userInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.gameActive) {
                const userInput = document.getElementById('userInput').value;
                if (userInput === this.targetSentence) {
                    this.nextSentence();
                }
            }
        });
    }
}

new TypoFixer();
