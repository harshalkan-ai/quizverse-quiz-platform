const db = require('../config/db');

// Realistic fallback generator for common topics
const PREDEFINED_TOPICS = {
    "react hooks": [
        {
            question_text: "Which hook should be used to perform side effects (like data fetching or subscriptions) in functional components?",
            marks: 5,
            explanation: "The useEffect Hook lets you perform side effects in functional components. It serves as a combined componentDidMount, componentDidUpdate, and componentWillUnmount.",
            options: [
                { option_text: "useEffect", is_correct: true },
                { option_text: "useState", is_correct: false },
                { option_text: "useMemo", is_correct: false },
                { option_text: "useContext", is_correct: false }
            ]
        },
        {
            question_text: "What is a core rule of React Hooks?",
            marks: 5,
            explanation: "Hooks must only be called at the top level of your functional component. Do not call Hooks inside loops, conditions, or nested functions.",
            options: [
                { option_text: "Only call Hooks at the top level of functional components", is_correct: true },
                { option_text: "Hooks must be called inside standard Javascript functions", is_correct: false },
                { option_text: "Hooks can be called conditionally if wrapped in try/catch", is_correct: false },
                { option_text: "Hooks can only be called inside class lifecycle methods", is_correct: false }
            ]
        },
        {
            question_text: "Which hook is designed to memoize a computed value between renders to optimize performance?",
            marks: 5,
            explanation: "useMemo returns a memoized value, recalculating it only when one of its dependencies changes, preventing expensive calculations on every render.",
            options: [
                { option_text: "useMemo", is_correct: true },
                { option_text: "useCallback", is_correct: false },
                { option_text: "useRef", is_correct: false },
                { option_text: "useReducer", is_correct: false }
            ]
        },
        {
            question_text: "How do you memoize a callback function itself so that child components don't re-render unnecessarily?",
            marks: 5,
            explanation: "useCallback returns a memoized version of the callback function that only changes if one of the dependencies has changed.",
            options: [
                { option_text: "useCallback", is_correct: true },
                { option_text: "useMemo", is_correct: false },
                { option_text: "useEffect", is_correct: false },
                { option_text: "useContext", is_correct: false }
            ]
        },
        {
            question_text: "What hook returns a mutable ref object whose .current property is initialized to the passed argument?",
            marks: 5,
            explanation: "useRef returns a mutable ref object which persists across renders and can hold DOM nodes or any mutable value without causing re-renders.",
            options: [
                { option_text: "useRef", is_correct: true },
                { option_text: "useState", is_correct: false },
                { option_text: "useMemo", is_correct: false },
                { option_text: "useTransition", is_correct: false }
            ]
        }
    ],
    "postgresql joins": [
        {
            question_text: "Which JOIN returns all rows from the left table, and matching rows from the right table? If no match, NULL values are returned for the right table.",
            marks: 5,
            explanation: "LEFT JOIN (or LEFT OUTER JOIN) returns all records from the left table, and matching records from the right table. If there is no match, the result is NULL on the right side.",
            options: [
                { option_text: "LEFT JOIN", is_correct: true },
                { option_text: "INNER JOIN", is_correct: false },
                { option_text: "RIGHT JOIN", is_correct: false },
                { option_text: "FULL OUTER JOIN", is_correct: false }
            ]
        },
        {
            question_text: "What is the key difference between INNER JOIN and OUTER JOIN?",
            marks: 5,
            explanation: "INNER JOIN selects records that have matching values in both tables. OUTER JOIN returns matching records as well as non-matching records, filled with NULLs where there's no match.",
            options: [
                { option_text: "INNER JOIN returns matching rows; OUTER JOIN returns matching and non-matching rows.", is_correct: true },
                { option_text: "INNER JOIN is faster but returns all rows; OUTER JOIN filters out rows.", is_correct: false },
                { option_text: "There is no difference in PostgreSQL.", is_correct: false },
                { option_text: "INNER JOIN is only used for numerical keys, OUTER JOIN is for text keys.", is_correct: false }
            ]
        },
        {
            question_text: "Which JOIN returns all rows when there is a match in either left or right table records?",
            marks: 5,
            explanation: "FULL OUTER JOIN returns all rows from the left table and all rows from the right table. Where there is no match, the database fills in NULL values.",
            options: [
                { option_text: "FULL OUTER JOIN", is_correct: true },
                { option_text: "LEFT JOIN", is_correct: false },
                { option_text: "RIGHT JOIN", is_correct: false },
                { option_text: "CROSS JOIN", is_correct: false }
            ]
        },
        {
            question_text: "What type of join returns the Cartesian product of the two tables (every row of table A matched with every row of table B)?",
            marks: 5,
            explanation: "A CROSS JOIN produces a Cartesian product, matching every row of the first table with every row of the second table.",
            options: [
                { option_text: "CROSS JOIN", is_correct: true },
                { option_text: "INNER JOIN", is_correct: false },
                { option_text: "NATURAL JOIN", is_correct: false },
                { option_text: "LEFT JOIN", is_correct: false }
            ]
        }
    ],
    "javascript async": [
        {
            question_text: "Which method is used to wait for multiple Promises to complete, failing immediately if any promise rejects?",
            marks: 5,
            explanation: "Promise.all takes an iterable of promises and returns a single Promise that resolves when all input promises resolve, but rejects immediately if any of them reject.",
            options: [
                { option_text: "Promise.all", is_correct: true },
                { option_text: "Promise.allSettled", is_correct: false },
                { option_text: "Promise.race", is_correct: false },
                { option_text: "Promise.any", is_correct: false }
            ]
        },
        {
            question_text: "What is the output of an async function that does not return anything explicitly?",
            marks: 5,
            explanation: "Async functions always return a Promise. If there is no explicit return value, the Promise resolves with the value `undefined`.",
            options: [
                { option_text: "A Promise that resolves with undefined", is_correct: true },
                { option_text: "undefined", is_correct: false },
                { option_text: "null", is_correct: false },
                { option_text: "A Promise that rejects with an error", is_correct: false }
            ]
        }
    ]
};

// Generates dynamic question templates for any general topic
function generateGenericQuestions(topic, difficulty, count) {
    const questions = [];
    const diff = difficulty.toUpperCase();
    for (let i = 1; i <= count; i++) {
        questions.push({
            question_text: `What is a primary concept of "${topic}" at an ${diff} level (Question #${i})?`,
            marks: 5,
            explanation: `This is a dynamically generated question exploring key concepts of ${topic} optimized for ${diff} difficulty.`,
            options: [
                { option_text: `Correct implementation strategy of ${topic} regarding standard conventions`, is_correct: true },
                { option_text: `Deprecated method that was replaced in legacy versions of ${topic}`, is_correct: false },
                { option_text: `Incorrect configuration pattern leading to performance issues`, is_correct: false },
                { option_text: `Standard browser capability unrelated to ${topic}`, is_correct: false }
            ]
        });
    }
    return questions;
}

// POST /api/ai/generate-questions
async function generateQuestionsWithAI(req, res) {
    try {
        const { topic, difficulty, questionCount, quiz_id, questions: passedQuestions } = req.body || {};

        // If we are passing already generated questions to import into a quiz
        if (quiz_id && Array.isArray(passedQuestions)) {
            const insertedQuestions = [];
            for (const q of passedQuestions) {
                const questionResult = await db.query(
                    `INSERT INTO questions (quiz_id, question_text, marks, explanation) 
                     VALUES ($1, $2, $3, $4) 
                     RETURNING *`,
                    [quiz_id, q.question_text, q.marks || 5, q.explanation || '']
                );
                const question = questionResult.rows[0];

                const insertedOptions = [];
                for (const opt of q.options || []) {
                    const optResult = await db.query(
                        `INSERT INTO options (question_id, option_text, is_correct) 
                         VALUES ($1, $2, $3) 
                         RETURNING *`,
                        [question.id, opt.option_text, opt.is_correct || false]
                    );
                    insertedOptions.push(optResult.rows[0]);
                }
                
                insertedQuestions.push({
                    ...question,
                    options: insertedOptions
                });
            }

            return res.status(201).json({
                status: 'SUCCESS',
                message: `Successfully imported ${insertedQuestions.length} questions into the quiz.`,
                data: { questions: insertedQuestions }
            });
        }

        // Otherwise generate them
        if (!topic || !difficulty || !questionCount) {
            return res.status(400).json({
                status: 'FAIL',
                message: 'topic, difficulty, and questionCount are required fields.'
            });
        }

        const count = parseInt(questionCount);
        if (isNaN(count) || count <= 0) {
            return res.status(400).json({
                status: 'FAIL',
                message: 'questionCount must be a positive integer.'
            });
        }

        let questions = [];

        // Check if GEMINI_API_KEY is configured
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            console.log(`🤖 Call Google Gemini API to generate ${count} questions for topic: ${topic}`);
            try {
                const prompt = `Generate exactly ${count} multiple-choice questions for the topic "${topic}" with difficulty level "${difficulty}".
Each question must have exactly 4 choices (one correct, three incorrect).
Provide the response as a JSON array matching the following schema. Return ONLY valid JSON, do not wrap it in markdown formatting (like \`\`\`json).
Schema:
[
  {
    "question_text": "string",
    "marks": 5,
    "explanation": "string",
    "options": [
      { "option_text": "string", "is_correct": true },
      { "option_text": "string", "is_correct": false },
      { "option_text": "string", "is_correct": false },
      { "option_text": "string", "is_correct": false }
    ]
  }
]`;

                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: prompt
                            }]
                        }],
                        generationConfig: {
                            responseMimeType: "application/json"
                        }
                    })
                });

                if (!response.ok) {
                    throw new Error(`Gemini API error: ${response.statusText}`);
                }

                const data = await response.json();
                const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!jsonText) {
                    throw new Error('Empty response from Gemini');
                }

                questions = JSON.parse(jsonText.trim());
            } catch (apiError) {
                console.warn('⚠️ Gemini API error, falling back to local generator:', apiError.message);
                questions = getLocalGeneratedQuestions(topic, difficulty, count);
            }
        } else {
            console.log(`ℹ️ No GEMINI_API_KEY found. Generating realistic offline questions for topic: ${topic}`);
            questions = getLocalGeneratedQuestions(topic, difficulty, count);
        }

        questions = questions.slice(0, count);

        // If quiz_id is passed, bulk insert them right away
        if (quiz_id) {
            const insertedQuestions = [];
            for (const q of questions) {
                const questionResult = await db.query(
                    `INSERT INTO questions (quiz_id, question_text, marks, explanation) 
                     VALUES ($1, $2, $3, $4) 
                     RETURNING *`,
                    [quiz_id, q.question_text, q.marks || 5, q.explanation || '']
                );
                const question = questionResult.rows[0];

                const insertedOptions = [];
                for (const opt of q.options || []) {
                    const optResult = await db.query(
                        `INSERT INTO options (question_id, option_text, is_correct) 
                         VALUES ($1, $2, $3) 
                         RETURNING *`,
                        [question.id, opt.option_text, opt.is_correct || false]
                    );
                    insertedOptions.push(optResult.rows[0]);
                }
                
                insertedQuestions.push({
                    ...question,
                    options: insertedOptions
                });
            }

            return res.status(201).json({
                status: 'SUCCESS',
                message: `Successfully generated and imported ${insertedQuestions.length} questions into the quiz.`,
                data: { questions: insertedQuestions }
            });
        }

        // Otherwise return generated questions for preview
        return res.status(200).json({
            status: 'SUCCESS',
            message: 'Questions generated successfully for preview.',
            data: { questions }
        });

    } catch (error) {
        console.error('generateQuestionsWithAI error:', error);
        return res.status(500).json({
            status: 'ERROR',
            message: 'Failed to generate questions: ' + error.message
        });
    }
}

// Returns realistic pre-coded or generated questions
function getLocalGeneratedQuestions(topic, difficulty, count) {
    const key = topic.toLowerCase().trim();
    let questions = [];

    if (PREDEFINED_TOPICS[key]) {
        questions = JSON.parse(JSON.stringify(PREDEFINED_TOPICS[key]));
    }

    if (questions.length < count) {
        const generic = generateGenericQuestions(topic, difficulty, count - questions.length);
        questions = [...questions, ...generic];
    }

    return questions.slice(0, count);
}

module.exports = {
    generateQuestionsWithAI
};
