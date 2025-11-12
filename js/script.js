   const questions = [
          {
            question: "¿Qué jugador tiene el récord de más goles en una sola temporada de LaLiga?",
            options: [
              "Lionel Messi",
              "Cristiano Ronaldo",
              "Telmo Zarra",
              "Hugo Sánchez"
            ],
            correct: 0,
            fact: "Lionel Messi anotó 50 goles en la temporada 2011-2012, estableciendo el récord actual."
          },
          {
            question: "¿Qué selección ha ganado más Copas del Mundo?",
            options: [
              "Alemania",
              "Italia",
              "Brasil",
              "Argentina"
            ],
            correct: 2,
            fact: "Brasil ha ganado 5 Copas del Mundo (1958, 1962, 1970, 1994, 2002)."
          },
          {
            question: "¿Quién fue el máximo goleador del Mundial 2018?",
            options: [
              "Cristiano Ronaldo",
              "Luka Modrić",
              "Harry Kane",
              "Kylian Mbappé"
            ],
            correct: 2,
            fact: "Harry Kane de Inglaterra anotó 6 goles en el Mundial de Rusia 2018."
          },
          {
            question: "¿Qué equipo ganó la primera Champions League?",
            options: [
              "Real Madrid",
              "Benfica",
              "AC Milan",
              "Barcelona"
            ],
            correct: 0,
            fact: "El Real Madrid ganó las primeras 5 ediciones de la Copa de Europa (ahora Champions League) desde 1956 hasta 1960."
          },
          {
            question: "¿Qué jugador tiene más Balones de Oro?",
            options: [
              "Lionel Messi",
              "Cristiano Ronaldo",
              "Michel Platini",
              "Johan Cruyff"
            ],
            correct: 0,
            fact: "Lionel Messi ha ganado 8 Balones de Oro (2009, 2010, 2011, 2012, 2015, 2019, 2021, 2023)."
          }
        ];

        // Variables de estado
        let currentQuestion = 0;
        let score = 0;
        let selectedOption = null;

        // Elementos DOM
        const questionElement = document.getElementById('question');
        const optionsContainer = document.getElementById('options-container');
        const scoreElement = document.getElementById('score');
        const currentQuestionElement = document.getElementById('current-question');
        const totalQuestionsElement = document.getElementById('total-questions');
        const progressElement = document.getElementById('progress');
        const nextButton = document.getElementById('next-btn');
        const restartButton = document.getElementById('restart-btn');

        // Inicializar trivia
        function initTrivia() {
          totalQuestionsElement.textContent = questions.length;
          loadQuestion();
          
          // Event listeners
          nextButton.addEventListener('click', nextQuestion);
          restartButton.addEventListener('click', restartTrivia);
        }

        // Cargar pregunta actual
        function loadQuestion() {
          resetOptions();
          const question = questions[currentQuestion];
          
          questionElement.textContent = question.question;
          currentQuestionElement.textContent = currentQuestion + 1;
          
          // Actualizar barra de progreso
          progressElement.style.width = `${((currentQuestion) / questions.length) * 100}%`;
          
          // Crear opciones
          question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.classList.add('option');
            optionElement.innerHTML = `
              <div class="option-number">${index + 1}</div>
              <div class="option-text">${option}</div>
            `;
            
            optionElement.addEventListener('click', () => selectOption(optionElement, index));
            optionsContainer.appendChild(optionElement);
          });
        }

        // Seleccionar una opción
        function selectOption(optionElement, index) {
          if (selectedOption !== null) return;
          
          selectedOption = index;
          optionElement.classList.add('selected');
          
          const question = questions[currentQuestion];
          const options = optionsContainer.querySelectorAll('.option');
          
          // Mostrar respuesta correcta/incorrecta
          if (index === question.correct) {
            optionElement.classList.add('correct');
            score += 10;
            scoreElement.textContent = score;
          } else {
            optionElement.classList.add('incorrect');
            options[question.correct].classList.add('correct');
          }
          
          // Habilitar botón siguiente
          nextButton.disabled = false;
        }

        // Resetear opciones
        function resetOptions() {
          optionsContainer.innerHTML = '';
          selectedOption = null;
          nextButton.disabled = true;
        }

        // Siguiente pregunta
        function nextQuestion() {
          currentQuestion++;
          
          if (currentQuestion < questions.length) {
            loadQuestion();
          } else {
            showResults();
          }
        }

        // Mostrar resultados finales
        function showResults() {
          const triviaContainer = document.querySelector('.trivia-container');
          triviaContainer.innerHTML = `
            <div class="trivia-result">
              <div class="result-icon">
                <i class="fas fa-trophy"></i>
              </div>
              <h3 class="result-title">¡Trivia Completada!</h3>
              <div class="result-score">${score} puntos</div>
              <p class="result-text">Has respondido correctamente ${score/10} de ${questions.length} preguntas. ${score >= questions.length*5 ? '¡Excelente conocimiento futbolístico!' : 'Sigue practicando para mejorar.'}</p>
              <button class="trivia-btn restart" id="restart-btn">
                <i class="fas fa-redo"></i> Jugar Again
              </button>
            </div>
          `;
          
          document.getElementById('restart-btn').addEventListener('click', restartTrivia);
        }

        // Reiniciar trivia
        function restartTrivia() {
          currentQuestion = 0;
          score = 0;
          selectedOption = null;
          scoreElement.textContent = '0';
          progressElement.style.width = '0%';
          
          const triviaContainer = document.querySelector('.trivia-container');
          triviaContainer.innerHTML = `
            <div class="trivia-header">
              <div class="score">
                <i class="fas fa-trophy"></i>
                <span id="score">0</span> puntos
              </div>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress" id="progress"></div>
                </div>
              </div>
              <div class="question-count">
                Pregunta <span id="current-question">1</span> de <span id="total-questions">5</span>
              </div>
            </div>
            
            <div class="question-text" id="question"></div>
            
            <div class="options-container" id="options-container"></div>
            
            <div class="trivia-controls">
              <button class="trivia-btn next" id="next-btn" disabled>
                <i class="fas fa-arrow-right"></i> Siguiente
              </button>
              <button class="trivia-btn restart" id="restart-btn">
                <i class="fas fa-redo"></i> Reiniciar
              </button>
            </div>
          `;
          
          // Reasignar elementos DOM después de reiniciar
          questionElement = document.getElementById('question');
          optionsContainer = document.getElementById('options-container');
          scoreElement = document.getElementById('score');
          currentQuestionElement = document.getElementById('current-question');
          progressElement = document.getElementById('progress');
          nextButton = document.getElementById('next-btn');
          restartButton = document.getElementById('restart-btn');
          
          // Volver a inicializar
          initTrivia();
        }

        // Iniciar la trivia cuando se cargue la página
        window.addEventListener('DOMContentLoaded', initTrivia);