class FactQuiz {
    constructor() {
        this.facts = [];
        this.shuffledFacts = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.totalQuestions = 10;
        this.gameActive = false;
        this.timeLeft = 15;
        this.timerInterval = null;
        this.correctAnswers = 0;
        
        this.init();
    }

    async init() {
        await this.loadFacts();
        this.setupEventListeners();
        this.updateDisplay();
    }

    async loadFacts() {
        try {
            const response = await fetch('facts.json');
            this.facts = await response.json();
            console.log('Loaded facts:', this.facts.length);
        } catch (error) {
            console.error('Fehler beim Laden der Fakten:', error);
            // Fallback data with more variety
            this.facts = [
                {
                    "statement": "Bananen sind botanisch gesehen Beeren.",
                    "isTrue": true,
                    "explanation": "Bananen sind tatsächlich Beeren! Botanisch gesehen sind sie einsamige Früchte mit weichem Fruchtfleisch."
                },
                {
                    "statement": "Goldfish haben ein Gedächtnis von nur 3 Sekunden.",
                    "isTrue": false,
                    "explanation": "Das ist ein Mythos! Goldfische können sich tatsächlich monatelang an Dinge erinnern."
                },
                {
                    "statement": "Der Eiffelturm ist im Sommer höher als im Winter.",
                    "isTrue": true,
                    "explanation": "Durch Wärmeausdehnung wird der Eiffelturm im Sommer etwa 15 cm höher."
                },
                {
                    "statement": "Oktopusse haben drei Herzen.",
                    "isTrue": true,
                    "explanation": "Oktopusse haben tatsächlich drei Herzen! Zwei für die Kiemen, eins für den Körper."
                },
                {
                    "statement": "Honig verdirbt niemals.",
                    "isTrue": true,
                    "explanation": "Honig hat unbegrenzte Haltbarkeit! 3000 Jahre alter Honig wurde noch essbar gefunden."
                }
            ];
        }
    }

    startGame() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.gameActive = true;
        
        // Erstelle eine neue gemischte Liste für dieses Spiel
        this.shuffledFacts = this.shuffleFacts([...this.facts]);
        console.log('Shuffled facts for this game:', this.shuffledFacts.map(f => f.statement.substring(0, 30) + '...'));
        
        document.getElementById('startBtn').style.display = 'none';
        document.getElementById('results').style.display = 'none';
        document.getElementById('newGameBtn').style.display = 'none';
        
        this.loadCurrentQuestion();
    }

    shuffleFacts(factsArray) {
        const shuffled = [...factsArray];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    loadCurrentQuestion() {
        if (this.currentQuestionIndex >= this.totalQuestions || this.currentQuestionIndex >= this.shuffledFacts.length) {
            this.endGame();
            return;
        }

        const fact = this.shuffledFacts[this.currentQuestionIndex];
        console.log(`Question ${this.currentQuestionIndex + 1}: ${fact.statement.substring(0, 50)}...`);
        
        document.getElementById('questionText').textContent = fact.statement;
        document.getElementById('progress').textContent = `${this.currentQuestionIndex + 1}/${this.totalQuestions}`;
        
        // Reset UI
        document.getElementById('answerButtons').style.display = 'flex';
        document.getElementById('feedback').style.display = 'none';
        document.getElementById('trueBtn').disabled = false;
        document.getElementById('falseBtn').disabled = false;
        
        const questionCard = document.getElementById('questionCard');
        questionCard.classList.remove('correct', 'incorrect');
        
        // Start timer
        this.timeLeft = 15;
        this.startTimer();
    }

    startTimer() {
        this.updateTimerDisplay();
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 0) {
                this.handleTimeout();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const timerElement = document.getElementById('timer');
        timerElement.textContent = `${this.timeLeft}s`;
        
        if (this.timeLeft <= 5) {
            timerElement.classList.add('timer-warning');
        } else {
            timerElement.classList.remove('timer-warning');
        }
    }

    handleTimeout() {
        clearInterval(this.timerInterval);
        this.showFeedback(false, "⏰ Zeit abgelaufen!");
    }

    answerQuestion(userAnswer) {
        if (!this.gameActive) return;
        
        clearInterval(this.timerInterval);
        
        const fact = this.shuffledFacts[this.currentQuestionIndex];
        const isCorrect = userAnswer === fact.isTrue;
        
        if (isCorrect) {
            this.score += this.calculatePoints();
            this.correctAnswers++;
        }
        
        this.showFeedback(isCorrect, isCorrect ? "✅ Richtig!" : "❌ Falsch!");
    }

    calculatePoints() {
        // Bonus points for quick answers
        if (this.timeLeft > 10) return 100;
        if (this.timeLeft > 5) return 75;
        return 50;
    }

    showFeedback(isCorrect, resultText) {
        const fact = this.shuffledFacts[this.currentQuestionIndex];
        
        // Disable buttons
        document.getElementById('trueBtn').disabled = true;
        document.getElementById('falseBtn').disabled = true;
        
        // Update UI
        document.getElementById('answerButtons').style.display = 'none';
        document.getElementById('feedback').style.display = 'block';
        
        const feedbackResult = document.getElementById('feedbackResult');
        feedbackResult.textContent = resultText;
        feedbackResult.className = `feedback-result ${isCorrect ? 'correct' : 'incorrect'}`;
        
        document.getElementById('feedbackExplanation').textContent = fact.explanation;
        
        // Update question card style
        const questionCard = document.getElementById('questionCard');
        questionCard.classList.add(isCorrect ? 'correct' : 'incorrect');
        
        // Update score display
        document.getElementById('score').textContent = this.score;
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        this.loadCurrentQuestion();
    }

    endGame() {
        this.gameActive = false;
        clearInterval(this.timerInterval);
        
        const accuracy = Math.round((this.correctAnswers / this.totalQuestions) * 100);
        const rating = this.getRating(accuracy);
        
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalAccuracy').textContent = accuracy;
        document.getElementById('finalRating').textContent = rating;
        
        document.getElementById('results').style.display = 'block';
        document.getElementById('newGameBtn').style.display = 'inline-block';
        
        // Hide question card
        document.getElementById('answerButtons').style.display = 'none';
        document.getElementById('feedback').style.display = 'none';
        document.getElementById('questionText').textContent = 'Quiz beendet! Schau dir deine Ergebnisse an.';
    }

    getRating(accuracy) {
        if (accuracy >= 90) return '🏆 Experte';
        if (accuracy >= 70) return '🎯 Gut';
        if (accuracy >= 50) return '👍 Okay';
        return '🤔 Übung macht den Meister';
    }

    resetGame() {
        this.gameActive = false;
        clearInterval(this.timerInterval);
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.shuffledFacts = [];
        
        document.getElementById('startBtn').style.display = 'inline-block';
        document.getElementById('newGameBtn').style.display = 'none';
        document.getElementById('results').style.display = 'none';
        document.getElementById('answerButtons').style.display = 'none';
        document.getElementById('feedback').style.display = 'none';
        
        document.getElementById('score').textContent = '0';
        document.getElementById('progress').textContent = '1/10';
        document.getElementById('timer').textContent = '15s';
        document.getElementById('questionText').textContent = 'Klicke auf "Spiel starten" um zu beginnen!';
        
        const questionCard = document.getElementById('questionCard');
        questionCard.classList.remove('correct', 'incorrect');
    }

    updateDisplay() {
        document.getElementById('progress').textContent = `1/${this.totalQuestions}`;
    }

    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('newGameBtn').addEventListener('click', () => {
            this.resetGame();
        });

        document.getElementById('trueBtn').addEventListener('click', () => {
            this.answerQuestion(true);
        });

        document.getElementById('falseBtn').addEventListener('click', () => {
            this.answerQuestion(false);
        });

        document.getElementById('nextBtn').addEventListener('click', () => {
            this.nextQuestion();
        });
    }
}

new FactQuiz();
