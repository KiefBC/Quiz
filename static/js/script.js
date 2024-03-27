const questions = [
    {
        question: 'Who was the original Lich King before merging with Arthas?',
        answers: [
            'Sylvanas Windrunner',
            'Ner&#39;zhul',
            'Illidan Stormrage',
            'Gul&#39;dan '],
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
        const pattern = `^[a-zA-Z]+(\s[a-zA-Z]+)?$`;
        const regex = new RegExp(pattern);

        if (!regex.test(userName)) {
            console.log("Invalid name");
            $(".error-message").text("Please enter a valid name.").fadeIn("slow");
            return false;
        } else {
            $(".error-message").fadeOut("slow");
        }

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
 * Flashes the background red if the user selects the wrong answer
 */
const flashRed = () => {
    $(".question").fadeOut("slow");
    const originalColor = $('body').css('background-color');

    // Animate the change to red
    $('body').animate({backgroundColor: 'red'}, 1000, () => {
        // After the animation to red is complete, fade back to the original color
        $('body').animate({backgroundColor: originalColor}, 1000);
    });
}

const flashGreen = () => {
    $(".question").fadeOut("slow");
    const originalColor = $('body').css('background-color');

    // Animate the change to green
    $('body').animate({backgroundColor: 'green'}, 1000, () => {
        // After the animation to green is complete, fade back to the original color
        $('body').animate({backgroundColor: originalColor}, 1000);
    });

}

/**
 * Shows and hides divs after a buildIntroduction()
 */
const showHide = () => {
    $(".intro").fadeIn("slow");
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
 * Renders the question form
 */
const buildQuestionForm = () => {
    questionNumber += 1;
    startQuiz();
    let answersHtml = '';
    const isLastQuestion = lastQuestion(questionIndex);
    const errorMessageHtml = `<div class="error-message" style="color: red; display: none;"></div>`;

    // Loop through the answers and create the HTML
    questions[questionIndex].answers.forEach((answer, index) => {
        if (isLastQuestion) {
            // Use checkboxes for the last question
            answersHtml += `
            <div class='answers'>
                <input id='answer${index + 1}' type="checkbox" name='answer' value='${answer}'>
                <label for='answer${index + 1}'>${answer}</label>
            </div>`;
        } else {
            // Use radio buttons for all other questions
            answersHtml += `
            <div class='answers'>
                <input id='answer${index + 1}' type="radio" name='answer' value='${answer}' required>
                <label for='answer${index + 1}'>${answer}</label>
            </div>`;
        }
    });

    $(".question").html(`
    <form id='form'>
        <div class='counters'>
            <p>Question: <span class="question-number">${questionIndex + 1}</span> / 5</p>
            <p>Timer: <span class="countDownTimer"></span></p>
            <p>Score: <span class="currentScore">${score}</span></p>
        </div>
            <legend><h2>${questions[questionIndex].question}</h2></legend>
            ${answersHtml}
        <div class="controls">
            <button class='button question-submit'>Submit</button>
            <button class='button question-hint'>Hint</button>
        </div>
        ${isLastQuestion ? errorMessageHtml : ''}
    </form>`);

    $(".question-hint").on("click", (event) => {
        event.preventDefault();
        correctSelection(questionIndex);
    });
}

/**
 * Displays the correct answer
 * @param questionIndex - The index of the question in the questions array
 */
const correctSelection = (questionIndex) => {
    const correctAnswer = questions[questionIndex].correctAnswer;
    let correctAnswerHtml = '';

    // Check if the correct answer is an array
    if (Array.isArray(correctAnswer)) {
        correctAnswer.forEach((answer, index) => {
            correctAnswerHtml += `<p>${index + 1}. ${answer}</p>`;
        });
    } else {
        // If not an array, it must be a single choice question
        correctAnswerHtml = `<p>${correctAnswer}</p>`;
    }

    // Check if a hint already exists and is visible
    if ($(".hint").length > 0 && $(".hint").is(':visible')) {
        // If visible, fade it out
        $(".hint").hide("fade", { easing: "easeInOutQuad" }, 1000, () => {
            // Remove the hint after fading out
            $(this).remove();
        });
    } else {
        // Remove existing hint if any (this is for when the hint is not visible but exists)
        $(".hint").remove();

        $(".question").append(`
            <div class="hint" style="display: none;">
                <h3 class="mt-4">Hint</h3>
                <p>The correct answer is:</p>
                ${correctAnswerHtml}
            </div>
        `);

        // Fade in the hint
        $(".hint").show("fade", { easing: "easeInOutQuad" }, 1000);
    }
}

/**
 * Hides the divs that are not needed and shows the question div
 */
const startQuiz = () => {
    $(".intro").fadeOut("slow");
    // wait for the intro to fade out before showing the question
    setTimeout(() => {

        $(".question-feedback").hide();
        $("#intro-image").hide();
        $("#introduction-name").hide();
        $(".question").fadeIn("slow");
    }, 1000);
}

/**
 * Adds event listener to the question submit button
 */
const questionSubmitListener = () => {
    $(".question").on("submit", event => {
        event.preventDefault();
        const values = lastQuestion(questionIndex) ? getCheckboxSelection(event) : [getRadioSelection(event)];
        const answerIsCorrect = checkAnswer(values, questionIndex);
        const isLastQuestion = lastQuestion(questionIndex);

        // Check if the user has checked at least one checkbox
        let checked = 0;
        if (isLastQuestion) {
            checked = $("input[type=checkbox]:checked").length;
            if (!checked) {
                $(".error-message").text("You must check at least one checkbox.").fadeIn("slow");
                return;
            }
        }

        // Stop the timer if the last question is reached
        if (lastQuestion(questionIndex)) {
            clearInterval(currentTimer);
        }

        if (answerIsCorrect) {
            score += 10;

            startConfetti();
            $("#confetti-canvas").show();
            $("body").css("overflow", "hidden");

            $("#quiz").hide();
            setTimeout(() => {
                stopConfetti();
                $("#confetti-canvas").hide();
                $("#quiz").fadeIn("slow");
            }, 2000);
        } else {
            $(".question-feedback").fadeOut("slow");
            flashRed();
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
        // Sort user's answers and correct answers before comparison
        let userAnswersSorted = answers.sort();
        let correctAnswersSorted = questions[questionIndex].correctAnswer.sort();

        // Compare the sorted arrays
        return JSON.stringify(userAnswersSorted) === JSON.stringify(correctAnswersSorted);
    } else {
        // If not an array, it must be a single choice question
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
    } else {
        responseMsg = `<h2>Ouch, this is not right</h2>
                <p>The correct answer is: '${questions[questionIndex].correctAnswer}'</p>
                <div class="controls">
                <button class='button question-feedback-submit'>Next</button>
                </div>`;
    }

    $(".question-feedback").on("click", ".question-feedback-submit", () => {
        if (questionIndex === 5) {
            showResults();
            buildQuizResults();
        } else {
            $(".question-feedback").fadeOut("slow");
            buildQuestionForm();
        }
    });

    return responseMsg;
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
    $(".question-feedback").fadeOut("slow", () => {
        // This function is called after the fadeOut completes
        $(".quiz-results").fadeIn("slow");
    });
}

/**
 * Builds the quiz results
 */
const buildQuizResults = () => {
    const remainingTime = parseInt($(".countDownTimer").text(), 10);
    const timeTaken = 60 - remainingTime;

    $(".quiz-results").html(`
          <h2>You did it!</h2>
          <h3>Your final score is <span id="score-value">${score}.</span></h3>
          <h3>That is <span id="user-score">${score/10} out of 5</span>.</h3>
          <!-- let user know how long it took them to complete the quiz -->
          <h3>It took you <span class="time-taken-complete">${timeTaken}</span> seconds to complete the quiz.</h3>
          <h3>Out of a total of <span class="time-taken-complete">60</span> seconds.</h3>
          <h3>Time left: <span class="time-taken-complete">${60 - timeTaken}</span> seconds.</h3>
          <div class="controls">
            <button class='button quiz-replay'>Play again?</button>
          </div>
    `).on("click", ".quiz-replay", () => {
        $(".quiz-results").fadeOut("slow", () => {
            buildIntroduction();
        });
    });

    // Check if the user got a perfect score
    if (score === 50) {
        $('#perfectScoreModal').modal('show');
        flashGreen();
    }
}

/**
 * Starts the countdown timer
 */
const startTimer = () => {
    if (currentTimer !== null) {
        clearInterval(currentTimer); // clear the old timer
    }

    let time = 60;
    currentTimer = setInterval(() => {
        time--;
        $(".countDownTimer").text(time);
        if (time === 0) {
            clearInterval(currentTimer);
            $(".question").hide();
            showResults();
            buildTimerRunOut();
        }
    }, 1000);
};

/**
 * Builds the quiz results when the timer runs out
 */
const buildTimerRunOut = () => {
    $(".quiz-results").html(`
          <h2>You could not survive!</h2>
          <h3 class="text-decoration-underline">Next time go a little faster?</h3>
          <h3>Your final score is <span id="score-value">${score}.</span></h3>
          <h3>That is <span id="user-score">${score/10} out of 5</span>.</h3>
          <div class="controls">
            <button class='button quiz-replay'>Play again?</button>
          </div>
    `).on("click", ".quiz-replay", () => {
        buildIntroduction();
    });
}

/**
 * Starts the website
 */
const startApp = () => {
    buildIntroduction();
    buildQuestion();
    questionSubmitListener();

    /*
    There must be a better way of doing this. I will look into it later.
     */
    //<editor-fold desc="Animations">
    $(document).on('mouseenter', '.question-feedback-submit', (event) => {
        $(event.currentTarget).addClass('animate__animated animate__pulse animate__infinite');
    });

    $(document).on('mouseleave', '.question-feedback-submit', (event) => {
        $(event.currentTarget).removeClass('animate__animated animate__pulse animate__infinite');
    });

    $(document).on('mouseenter', '.button', (event) => {
        $(event.currentTarget).addClass('animate__animated animate__pulse animate__infinite');
    });

    $(document).on('mouseleave', '.button', (event) => {
        $(event.currentTarget).removeClass('animate__animated animate__pulse animate__infinite');
    });

    $(document).on('mouseenter', '#intro-image', (event) => {
        $(event.currentTarget).addClass('animate__animated animate__pulse animate__infinite');
    });

    $(document).on('mouseleave', '#intro-image', (event) => {
        $(event.currentTarget).removeClass('animate__animated animate__pulse animate__infinite');
    });

    $('#perfectScoreModal').on('shown.bs.modal', () => {
        setTimeout(function() {
            $('#perfectScoreModal').modal('hide');
        }, 2000); // Hide the modal after 5 seconds
    });
    //</editor-fold>
}

$(startApp);
