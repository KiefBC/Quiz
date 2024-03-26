const questions = [
    {
        question: 'Who was the original Lich King before merging with Arthas?',
        answers: [
            'Sylvanas Windrunner',
            'Ner\'zhul',
            'Illidan Stormrage',
            'Gul\'dan '],
        correctAnswer: 'Ner\'zhul'
    },
    {
        question: 'Which Dragon Aspect was given the charge to guard time and watch over the pathways of fate?',
        answers: [
            'Alexstrasza',
            'Malygos',
            'Ysera',
            'Nozdormu'
        ],
        correctAnswer: 'Nozdormu'
    },
    {
        question: 'Which World Tree was planted to heal the damage caused by the first invasion of the Burning Legion?',
        answers: [
            'Vordrassil',
            'Teldrassil',
            'Nordrassil',
            'Shaladrassil'
        ],
        correctAnswer: 'Nordrassil'
    },
    {
        question: 'Who is the Elemental Lord of Fire?',
        answers: [
            'Neptulon',
            'Therazane',
            'Al\'Akir',
            'Ragnaros'
        ],
        correctAnswer: 'Ragnaros'
    },
    {
        question: 'Which two characters played pivotal roles in the events leading to the Sundering of Azeroth?',
        answers: [
            'Tyrande Whisperwind',
            'Illidan Stormrage',
            'Malfurion Stormrage',
            'Queen Azshara'
        ],
        correctAnswer: ['Illidan Stormrage', 'Queen Azshara']
    }
]

//<editor-fold desc="Global Variables">
let questionIndex = 0;
let questionNumber = 0;
let score = 0;
let currentTimer = null;
let addToScore;
//</editor-fold>

/**
 * Builds the introduction form
 */
const buildIntroduction = () => {
    showHide();

    questionIndex = 0;
    questionNumber = 0;
    score = 0;
    $(".question-number").text(0);
    $(".currentScore").text(0);

    $("#user-name-form").on("submit", event => {
        event.preventDefault();
        const userName = $("#user-name").val();
        console.log(userName);

        $(this).fadeOut("slow", () => {
            $(".start-quiz-btn").fadeIn("slow");
            $("#user-name-form").fadeOut("slow");
            $("#user-name-display").text(userName);
            $("#introduction-name").fadeIn("slow");
            $("#user-name").val('');
        });
    });
}

/**
 * Shows and hides divs after a buildIntroduction()
 */
const showHide = () => {
    $(".intro").show();
    $("#intro-image").show();
    $("#user-name-form").show();
    $(".start-quiz-btn").hide();
    $(".question").hide();
    $(".question-feedback").hide();
    $(".quiz-results").hide();
}

/**
 * Builds the question form
 */
const buildQuestion = () => {
    $(".intro-submit").on("click", event => {
        event.preventDefault();
        buildQuestionForm();
        startTimer();
    });
}

/**
 * Increases the counter for the question number
 */
const updateQuestionCounter = () => {
    $(".question-number").text(questionNumber++);
}

/**
 * Renders the question form
 */
const buildQuestionForm = () => {
    updateQuestionCounter();
    startQuiz();
    let answersHtml = '';
    const isLastQuestion = lastQuestion(questionIndex);

    // Loop through the answers and create the HTML
    questions[questionIndex].answers.forEach((answer, index) => {
        if (isLastQuestion) {
            // Use checkboxes for the last question
            answersHtml += `
            <div class='css-answers'>
                <input id='answer${index + 1}' type="checkbox" name='answer' value='${answer}'>
                <label for='answer${index + 1}'>${answer}</label>
            </div>`;
        } else {
            // Use radio buttons for all other questions
            answersHtml += `
            <div class='css-answers'>
                <input id='answer${index + 1}' type="radio" name='answer' value='${answer}' required>
                <label for='answer${index + 1}'>${answer}</label>
            </div>`;
        }
    });

    // Render the question form
    $(".question").html(`
    <form id='form'>
        <div class='counters'>
            <p>Question: <span class="question-number">${questionNumber}</span> / 5</p>
            <p>Timer: <span class="countDownTimer"></span></p>
            <p>Score: <span class="currentScore">${score}</span></p>
        </div>
        <fieldset>
            <legend><h2>${questions[questionIndex].question}</h2></legend>
            ${answersHtml}
        </fieldset>
        <div class="controls">
        <button class='button question-submit'>Submit</button>
        </div>
    </form>`);
}


/**
 * Hides the divs that are not needed and shows the question div
 */
const startQuiz = () => {
    $(".intro").hide();
    $(".question-feedback").hide();
    $(".question").show();
    $("#intro-image").hide();
    $("#introduction-name").hide();
}

/**
 * Adds event listener to the question submit button
 */
const questionSubmitListener = () => {
    $(".question").on("submit", event => {
        event.preventDefault();
        const values = lastQuestion(questionIndex) ? getCheckboxSelection(event) : [getRadioSelection(event)];
        const answerIsCorrect = checkAnswer(values, questionIndex);

        if (answerIsCorrect) {
            score += 10;
        }

        const feedbackText = buildResponse(answerIsCorrect);
        questionResults(feedbackText);
    });
}

/**
 * Checks if the current question is the last question
 * @param questionIndex - The current question index
 * @returns {boolean} - True if the current question is the last question, false otherwise
 */
const lastQuestion = (questionIndex) => {
    return questionIndex === questions.length - 1;
}

/**
 * Gets the value of the radio button that is checked
 * @param event - The radio button event
 * @returns {string} - The value of the radio button that is checked
 */
const getRadioSelection = (event) => {
    return $(event.currentTarget).find("input:checked").val();
}

/**
 * Gets the value of the checkbox(s) that are checked
 * @param event - The checkbox event
 * @returns {Array} - The value of the checkbox(s) that are checked
 */
const getCheckboxSelection = (event) => {
    return $(event.currentTarget).find("input:checked").map((index, element) => $(element).val()).get();
}

/**
 * Checks if the answer is correct
 * @param answers - The answers to the question
 * @param questionIndex - The index of the question in the questions array
 * @returns {boolean} - True if the answer is correct, false otherwise
 */
const checkAnswer = (answers, questionIndex) => {
    // Check if the correct answer is an array
    if (Array.isArray(questions[questionIndex].correctAnswer)) {
        let answers = questions[questionIndex].correctAnswer.sort();
        let correctAnswers = answers.sort();
        return JSON.stringify(answers) === JSON.stringify(correctAnswers);
    } else {
        // Must be a string
        return answers.length === 1 && answers[0] === questions[questionIndex].correctAnswer;
    }
}

/**
 * Builds the response based on if the answer is correct or not
 * @param correctAnswer - True if the answer is correct, false otherwise
 * @returns {string} - The response message
 */
const buildResponse = (correctAnswer) => {
    let responseMsg;

    if (correctAnswer) {
        responseMsg = `
                <h2>Correct</h2>
                <p>On to the next.</p>
                <div class="controls">
                <button class='button question-feedback-submit'>Next</button>
                </div>
        `;

        increasePoints();
    } else {
        responseMsg = `<h2>Ouch, this is not right</h2>
                <p>The correct answer is: '${questions[questionIndex].correctAnswer}'</p>
                <div class="controls">
                <button class='button question-feedback-submit'>Next</button>
                </div>`;

        decreasePoints();
    }

    $(".question-feedback").on("click", ".question-feedback-submit", () => {
        if (questionIndex === 5) {
            showResults();
            buildQuizResults();
        } else {
            buildQuestionForm();
        }
    });

    return responseMsg;
}

/**
 * Increases the score by 10
 */
const increasePoints = () => {
    addToScore += 10;
    $(".currentScore").text(addToScore);
}

/**
 * Decreases the score by 10
 */
const decreasePoints = () => {
    addToScore -= 10;
    $(".currentScore").text(addToScore);
}

/**
 * Shows the results of the quiz
 * @param results - The response message
 */
const questionResults = (results) => {
    $(".question").hide();
    $(".question-feedback").show().html(results);

    questionIndex++;
}

/**
 * Shows the quiz results and hides the question feedback
 */
const showResults = () => {
    $(".question-feedback").hide();
    $(".quiz-results").show();
}

/**
 * Builds the quiz results
 */
const buildQuizResults = () => {
    $(".quiz-results").html(`
          <h2>You did it!</h2>
          <h3>Your final score is ${score}.</h3>
          <h3>That is ${score/10} out of 5.</h3>
          <div class="controls">
            <button class='button quiz-replay'>Play again</button>
          </div>
    `).on("click", ".quiz-replay", () => {
        buildIntroduction();
    });
}

/**
 * Starts the countdown timer
 */
const startTimer = () => {
    if (currentTimer !== null) {
        clearInterval(currentTimer); // clear the old timer
    }

    let time = 5;
    currentTimer = setInterval(() => {
        time--;
        $(".countDownTimer").text(time);
        if (time === 0) {
            clearInterval(currentTimer);
            $(".question").hide();
            showResults();
            buildQuizResults();
        }
    }, 1000);
};

const startApp = () => {
    buildIntroduction();
    buildQuestion();
    questionSubmitListener();
}

$(startApp);
