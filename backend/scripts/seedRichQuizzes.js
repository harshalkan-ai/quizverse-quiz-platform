const db = require('../config/db');

// Complete Seed Dataset
const SEED_DATA = [
    {
        category: "JavaScript",
        description: "Modern JavaScript concepts, scoping, event loops, and asynchronous operations.",
        quiz: {
            title: "JavaScript Deep Dive",
            description: "A comprehensive test on advanced JavaScript features, closure contexts, asynchronous control flows, and typing quirks.",
            difficulty: "INTERMEDIATE",
            duration_minutes: 20,
            passing_score: 70,
            max_attempts: 3,
            negative_marks: 0.50,
            status: "PUBLISHED"
        },
        questions: [
            {
                question_text: "What is the evaluated output of 'typeof null' in JavaScript?",
                marks: 5,
                explanation: "Historically in JavaScript, values are represented as a type tag and a value. Since null was represented as the null pointer (0x00 in most platforms), and the object type tag was 0, typeof null incorrectly returned 'object'. This is a legacy quirk.",
                options: [
                    { option_text: "object", is_correct: true },
                    { option_text: "null", is_correct: false },
                    { option_text: "undefined", is_correct: false },
                    { option_text: "function", is_correct: false }
                ]
            },
            {
                question_text: "Which value is returned when evaluating '0.1 + 0.2 === 0.3' in standard JS?",
                marks: 5,
                explanation: "JavaScript numbers are represented using double-precision floating-point format (IEEE 754). This leads to rounding errors where 0.1 + 0.2 equals 0.30000000000000004, which is not strictly equal to 0.3.",
                options: [
                    { option_text: "false", is_correct: true },
                    { option_text: "true", is_correct: false },
                    { option_text: "undefined", is_correct: false },
                    { option_text: "TypeError", is_correct: false }
                ]
            },
            {
                question_text: "What is the scope of a variable declared using the 'var' keyword?",
                marks: 5,
                explanation: "Variables declared using 'var' are function-scoped, meaning they are available throughout the function they are declared in, unlike 'let' and 'const' which are block-scoped.",
                options: [
                    { option_text: "Function scope", is_correct: true },
                    { option_text: "Block scope", is_correct: false },
                    { option_text: "Global scope only", is_correct: false },
                    { option_text: "Lexical block scope only", is_correct: false }
                ]
            },
            {
                question_text: "What does NaN stand for and what is its typeof evaluation?",
                marks: 5,
                explanation: "NaN stands for 'Not-a-Number'. Despite representing a non-numeric result of a mathematical operation, its ECMAScript type evaluation is 'number'.",
                options: [
                    { option_text: "Not-a-Number, typeof returns 'number'", is_correct: true },
                    { option_text: "Null-and-Void, typeof returns 'null'", is_correct: false },
                    { option_text: "Not-a-Number, typeof returns 'NaN'", is_correct: false },
                    { option_text: "Negative-and-Null, typeof returns 'undefined'", is_correct: false }
                ]
            },
            {
                question_text: "What is a closure in JavaScript?",
                marks: 5,
                explanation: "A closure is the combination of a function bundled together with references to its surrounding state (the lexical environment). In other words, a closure gives an inner function access to the outer function's scope.",
                options: [
                    { option_text: "A function bundled with its lexical environment", is_correct: true },
                    { option_text: "A method that deletes unused variables from memory", is_correct: false },
                    { option_text: "A mechanism to encrypt code blocks inside block elements", is_correct: false },
                    { option_text: "An execution block that always runs on page load", is_correct: false }
                ]
            },
            {
                question_text: "Which function is used to convert a JavaScript object into a JSON string?",
                marks: 5,
                explanation: "JSON.stringify() converts a JavaScript value or object into a structured JSON string representation.",
                options: [
                    { option_text: "JSON.stringify()", is_correct: true },
                    { option_text: "JSON.parse()", is_correct: false },
                    { option_text: "Object.toJSON()", is_correct: false },
                    { option_text: "Stringify()", is_correct: false }
                ]
            },
            {
                question_text: "Which of the following is NOT a primitive data type in JavaScript?",
                marks: 5,
                explanation: "In JavaScript, primitive types include undefined, null, boolean, number, string, symbol, and bigint. Array is an object structure, not a primitive.",
                options: [
                    { option_text: "Array", is_correct: true },
                    { option_text: "Symbol", is_correct: false },
                    { option_text: "BigInt", is_correct: false },
                    { option_text: "Boolean", is_correct: false }
                ]
            },
            {
                question_text: "What is the purpose of the 'use strict' directive in JavaScript?",
                marks: 5,
                explanation: "'use strict' enables strict mode, which catches common coding mistakes, prevents unsafe actions (like declaring global variables implicitly), and throws more errors.",
                options: [
                    { option_text: "Enforces strict mode for cleaner syntax and safer execution", is_correct: true },
                    { option_text: "Imports legacy libraries automatically", is_correct: false },
                    { option_text: "Speeds up mathematical floating point operations", is_correct: false },
                    { option_text: "Hides all syntax warnings in the browser console", is_correct: false }
                ]
            },
            {
                question_text: "How does Promise.race() behave compared to Promise.all()?",
                marks: 5,
                explanation: "Promise.race() resolves or rejects as soon as one of the input promises settles (either resolves or rejects). Promise.all() waits for all to resolve or fails on the first rejection.",
                options: [
                    { option_text: "Settles as soon as any promise in the array resolves or rejects", is_correct: true },
                    { option_text: "Settles only when all promises resolve successfully", is_correct: false },
                    { option_text: "Settles as soon as all promises fail", is_correct: false },
                    { option_text: "Runs promises sequentially rather than in parallel", is_correct: false }
                ]
            },
            {
                question_text: "What is the event loop phase responsible for executing setTimeout callbacks?",
                marks: 5,
                explanation: "In Node.js and browser event loops, timer callbacks scheduled via setTimeout/setInterval are processed during the Timers phase.",
                options: [
                    { option_text: "Timers phase", is_correct: true },
                    { option_text: "Poll phase", is_correct: false },
                    { option_text: "Check phase", is_correct: false },
                    { option_text: "Close callbacks phase", is_correct: false }
                ]
            },
            {
                question_text: "What is the result of evaluating '[] + []' in JavaScript?",
                marks: 5,
                explanation: "When using the '+' operator on arrays, JS converts both to strings. An empty array converts to an empty string, yielding an empty string result.",
                options: [
                    { option_text: "Empty string", is_correct: true },
                    { option_text: "undefined", is_correct: false },
                    { option_text: "0", is_correct: false },
                    { option_text: "NaN", is_correct: false }
                ]
            },
            {
                question_text: "What is the main advantage of arrow functions regarding the 'this' keyword?",
                marks: 5,
                explanation: "Arrow functions do not define their own 'this' binding. Instead, they capture the 'this' value of the enclosing lexical context.",
                options: [
                    { option_text: "They lexically bind the 'this' context", is_correct: true },
                    { option_text: "They have a dynamic 'this' bound to the caller", is_correct: false },
                    { option_text: "They completely ignore the 'this' keyword, throwing errors", is_correct: false },
                    { option_text: "They bind 'this' directly to global window objects always", is_correct: false }
                ]
            },
            {
                question_text: "Which method is used to create a new array with all elements that pass a test?",
                marks: 5,
                explanation: "The filter() method creates a shallow copy of a portion of a given array, filtered down to just the elements from the given array that pass the test.",
                options: [
                    { option_text: "filter()", is_correct: true },
                    { option_text: "map()", is_correct: false },
                    { option_text: "reduce()", is_correct: false },
                    { option_text: "find()", is_correct: false }
                ]
            },
            {
                question_text: "What does the 'typeof' operator return for a declared but unassigned variable?",
                marks: 5,
                explanation: "A variable that has been declared but has not been assigned a value has the default value of `undefined`. Its type is also `undefined`.",
                options: [
                    { option_text: "undefined", is_correct: true },
                    { option_text: "null", is_correct: false },
                    { option_text: "object", is_correct: false },
                    { option_text: "ReferenceError", is_correct: false }
                ]
            },
            {
                question_text: "Which function executes a string of JavaScript code as dynamic script?",
                marks: 5,
                explanation: "The eval() function evaluates JavaScript code represented as a string. However, its use is highly discouraged due to security and performance concerns.",
                options: [
                    { option_text: "eval()", is_correct: true },
                    { option_text: "execute()", is_correct: false },
                    { option_text: "parse()", is_correct: false },
                    { option_text: "run()", is_correct: false }
                ]
            },
            {
                question_text: "What is the evaluated output of 'true + false' in Javascript?",
                marks: 5,
                explanation: "During addition, JavaScript performs type coercion, casting `true` to 1 and `false` to 0, which yields 1.",
                options: [
                    { option_text: "1", is_correct: true },
                    { option_text: "true", is_correct: false },
                    { option_text: "false", is_correct: false },
                    { option_text: "NaN", is_correct: false }
                ]
            },
            {
                question_text: "How do you check if a property exists inside an object in JavaScript?",
                marks: 5,
                explanation: "The 'in' operator returns true if the specified property is in the specified object or its prototype chain (e.g. 'prop' in obj).",
                options: [
                    { option_text: "Using the 'in' operator", is_correct: true },
                    { option_text: "Using the exists() function", is_correct: false },
                    { option_text: "Using Object.hasProperty()", is_correct: false },
                    { option_text: "Using isNull() verification", is_correct: false }
                ]
            },
            {
                question_text: "What is the purpose of Object.freeze()?",
                marks: 5,
                explanation: "Object.freeze() freezes an object. A frozen object can no longer be changed: you cannot add new properties, remove existing ones, or edit values.",
                options: [
                    { option_text: "Prevents all modifications to properties and values of an object", is_correct: true },
                    { option_text: "Compresses the object layout to save heap memory", is_correct: false },
                    { option_text: "Prevents garbage collection for that object", is_correct: false },
                    { option_text: "Hides all keys from JSON serialization APIs", is_correct: false }
                ]
            },
            {
                question_text: "Which array method adds one or more elements to the beginning of an array?",
                marks: 5,
                explanation: "unshift() adds the specified elements to the beginning of an array and returns the new length of the array.",
                options: [
                    { option_text: "unshift()", is_correct: true },
                    { option_text: "shift()", is_correct: false },
                    { option_text: "push()", is_correct: false },
                    { option_text: "concat()", is_correct: false }
                ]
            },
            {
                question_text: "What is the difference between '==' and '===' operators?",
                marks: 5,
                explanation: "'==' performs type coercion before comparing values, while '===' compares both value and type strictly without coercion.",
                options: [
                    { option_text: "'===' compares both value and type; '==' compares value with coercion.", is_correct: true },
                    { option_text: "'==' is strict comparison; '===' is loose comparison.", is_correct: false },
                    { option_text: "There is no difference in modern browsers.", is_correct: false },
                    { option_text: "'===' only works on numerical data types.", is_correct: false }
                ]
            }
        ]
    },
    {
        category: "Python",
        description: "Python language structure, lists, OOP principles, and functional paradigms.",
        quiz: {
            title: "Python Core & OOP",
            description: "Test your Python mastery, covering magic methods, standard libraries, decorators, scoping, and OOP principles.",
            difficulty: "INTERMEDIATE",
            duration_minutes: 20,
            passing_score: 70,
            max_attempts: 3,
            negative_marks: 0.50,
            status: "PUBLISHED"
        },
        questions: [
            {
                question_text: "Which keyword is used to define functions in Python?",
                marks: 5,
                explanation: "In Python, functions are defined using the 'def' keyword followed by the function name and parameters.",
                options: [
                    { option_text: "def", is_correct: true },
                    { option_text: "function", is_correct: false },
                    { option_text: "fn", is_correct: false },
                    { option_text: "define", is_correct: false }
                ]
            },
            {
                question_text: "What is the evaluated type of 'None' in Python?",
                marks: 5,
                explanation: "'None' is a special constant in Python representing the absence of a value. Its type is the class 'NoneType'.",
                options: [
                    { option_text: "<class 'NoneType'>", is_correct: true },
                    { option_text: "<class 'null'>", is_correct: false },
                    { option_text: "<class 'void'>", is_correct: false },
                    { option_text: "<class 'None'>", is_correct: false }
                ]
            },
            {
                question_text: "Which of the following is a mutable sequence type in Python?",
                marks: 5,
                explanation: "Lists are mutable sequences in Python. Tuples, strings, and ranges are immutable.",
                options: [
                    { option_text: "list", is_correct: true },
                    { option_text: "tuple", is_correct: false },
                    { option_text: "string", is_correct: false },
                    { option_text: "range", is_correct: false }
                ]
            },
            {
                question_text: "What does the expression '2 ** 3' evaluate to in Python?",
                marks: 5,
                explanation: "The '**' operator in Python is used for exponentiation (raising to a power). Therefore, 2 ** 3 is 2 cubed, which is 8.",
                options: [
                    { option_text: "8", is_correct: true },
                    { option_text: "6", is_correct: false },
                    { option_text: "9", is_correct: false },
                    { option_text: "16", is_correct: false }
                ]
            },
            {
                question_text: "How do you declare a dictionary key-value store in Python?",
                marks: 5,
                explanation: "Python dictionaries are declared using curly braces, enclosing comma-separated key:value pairs.",
                options: [
                    { option_text: "{'key': 'value'}", is_correct: true },
                    { option_text: "['key' => 'value']", is_correct: false },
                    { option_text: "('key': 'value')", is_correct: false },
                    { option_text: "{'key' => 'value'}", is_correct: false }
                ]
            },
            {
                question_text: "What is the purpose of the '__init__' method in Python classes?",
                marks: 5,
                explanation: "The '__init__' method is a special method (initializer) called automatically when a new class instance is created, allowing instance setup.",
                options: [
                    { option_text: "Serves as the class constructor to initialize instance attributes", is_correct: true },
                    { option_text: "Destroys the instance object releasing memory heap", is_correct: false },
                    { option_text: "Compiles class code into bytecode format", is_correct: false },
                    { option_text: "Converts class properties into standard dictionaries", is_correct: false }
                ]
            },
            {
                question_text: "How does Python define a subclass inheriting from a parent class?",
                marks: 5,
                explanation: "Inheritance is specified in Python by placing the parent class name inside parentheses after the child class name in the class declaration.",
                options: [
                    { option_text: "class Child(Parent):", is_correct: true },
                    { option_text: "class Child inherits Parent:", is_correct: false },
                    { option_text: "class Child extend Parent:", is_correct: false },
                    { option_text: "class Child : Parent:", is_correct: false }
                ]
            },
            {
                question_text: "Which keyword is used to trigger an exception manually in Python code?",
                marks: 5,
                explanation: "The 'raise' statement is used to trigger exceptions manually in Python.",
                options: [
                    { option_text: "raise", is_correct: true },
                    { option_text: "throw", is_correct: false },
                    { option_text: "trigger", is_correct: false },
                    { option_text: "except", is_correct: false }
                ]
            },
            {
                question_text: "What is the output of 'len([1, 2, 3])'?",
                marks: 5,
                explanation: "The len() function returns the number of elements in an object, which is 3 for a list with elements [1, 2, 3].",
                options: [
                    { option_text: "3", is_correct: true },
                    { option_text: "4", is_correct: false },
                    { option_text: "2", is_correct: false },
                    { option_text: "Error", is_correct: false }
                ]
            },
            {
                question_text: "Which function reads standard string input from the user in Python 3?",
                marks: 5,
                explanation: "In Python 3, `input()` is the standard function that reads a line from input and returns it as a string.",
                options: [
                    { option_text: "input()", is_correct: true },
                    { option_text: "raw_input()", is_correct: false },
                    { option_text: "read()", is_correct: false },
                    { option_text: "sys.readline()", is_correct: false }
                ]
            },
            {
                question_text: "What is the primary characteristic of a tuple?",
                marks: 5,
                explanation: "A tuple is an ordered, immutable collection. Once created, its items cannot be replaced, added, or removed.",
                options: [
                    { option_text: "It is immutable", is_correct: true },
                    { option_text: "It is mutable and expandable", is_correct: false },
                    { option_text: "It cannot contain nested objects", is_correct: false },
                    { option_text: "It evaluates to False when containing data", is_correct: false }
                ]
            },
            {
                question_text: "Which method converts a Python string to lowercase?",
                marks: 5,
                explanation: "The `.lower()` method returns a copy of the string with all cased characters converted to lowercase.",
                options: [
                    { option_text: "string.lower()", is_correct: true },
                    { option_text: "string.to_lower()", is_correct: false },
                    { option_text: "string.lowercase()", is_correct: false },
                    { option_text: "lower(string)", is_correct: false }
                ]
            },
            {
                question_text: "What does the 'pass' statement do in Python blocks?",
                marks: 5,
                explanation: "The 'pass' statement is a null operation. It is used as a placeholder in block statements where code syntax requires a block, but no logic is needed.",
                options: [
                    { option_text: "Acts as a placeholder and performs no operation", is_correct: true },
                    { option_text: "Exits the current enclosing loop structure", is_correct: false },
                    { option_text: "Returns None from the function block instantly", is_correct: false },
                    { option_text: "Deletes local variables to free memory", is_correct: false }
                ]
            },
            {
                question_text: "Which of the following is NOT a built-in numeric data type in Python?",
                marks: 5,
                explanation: "Python built-in numeric types are int, float, and complex. The Decimal type must be imported from the standard library decimal module.",
                options: [
                    { option_text: "decimal", is_correct: true },
                    { option_text: "int", is_correct: false },
                    { option_text: "float", is_correct: false },
                    { option_text: "complex", is_correct: false }
                ]
            },
            {
                question_text: "How do you check boolean evaluation of an empty list [] in Python?",
                marks: 5,
                explanation: "In Python, empty collection objects (lists, tuples, dicts, sets, strings) evaluate to boolean False.",
                options: [
                    { option_text: "False", is_correct: true },
                    { option_text: "True", is_correct: false },
                    { option_text: "None", is_correct: false },
                    { option_text: "TypeError", is_correct: false }
                ]
            },
            {
                question_text: "Which method retrieves a list-like view of all keys in a dictionary d?",
                marks: 5,
                explanation: "The d.keys() method returns a view object displaying a list of all keys in the dictionary.",
                options: [
                    { option_text: "d.keys()", is_correct: true },
                    { option_text: "d.get_keys()", is_correct: false },
                    { option_text: "d.list()", is_correct: false },
                    { option_text: "keys(d)", is_correct: false }
                ]
            },
            {
                question_text: "Which OOP concept encapsulates data fields and function procedures inside a structural model?",
                marks: 5,
                explanation: "Encapsulation is the bundling of data and the methods that operate on that data into a single unit (class), while hiding internal structure details.",
                options: [
                    { option_text: "Encapsulation", is_correct: true },
                    { option_text: "Inheritance", is_correct: false },
                    { option_text: "Polymorphism", is_correct: false },
                    { option_text: "Abstraction", is_correct: false }
                ]
            },
            {
                question_text: "What does the '__str__' magic method do in a Python class?",
                marks: 5,
                explanation: "The '__str__' magic method returns a user-friendly string representation of an object, invoked by print() and str() functions.",
                options: [
                    { option_text: "Returns a readable string representation of the object", is_correct: true },
                    { option_text: "Converts the object to JSON format directly", is_correct: false },
                    { option_text: "Compares two object references for equality", is_correct: false },
                    { option_text: "Computes the hash integer value of the object", is_correct: false }
                ]
            },
            {
                question_text: "Which decorator is used to declare a method that belongs to the class itself rather than instances?",
                marks: 5,
                explanation: "The @classmethod decorator marks a method that receives the class itself (cls) as its first implicit argument, not the instance (self).",
                options: [
                    { option_text: "@classmethod", is_correct: true },
                    { option_text: "@staticmethod", is_correct: false },
                    { option_text: "@property", is_correct: false },
                    { option_text: "@classmethod_init", is_correct: false }
                ]
            },
            {
                question_text: "What is the purpose of the 'super()' function in Python OOP?",
                marks: 5,
                explanation: "'super()' returns a proxy object that delegates method calls to a parent or sibling class, typically used to trigger base class constructors.",
                options: [
                    { option_text: "Delegates method calls to parent class objects", is_correct: true },
                    { option_text: "Destroys the current subclass instance immediately", is_correct: false },
                    { option_text: "Overrides standard scoping levels in functions", is_correct: false },
                    { option_text: "Creates multiple instances of class definitions", is_correct: false }
                ]
            }
        ]
    },
    {
        category: "Databases",
        description: "Relational database structures, SQL query building, and transactions.",
        quiz: {
            title: "PostgreSQL & Database Architecture",
            description: "Master query structures, PostgreSQL internal mechanics, isolation levels, database indexing, and transactions.",
            difficulty: "HARD",
            duration_minutes: 25,
            passing_score: 75,
            max_attempts: 2,
            negative_marks: 0.50,
            status: "PUBLISHED"
        },
        questions: [
            {
                question_text: "What does SQL stand for?",
                marks: 5,
                explanation: "SQL stands for Structured Query Language. It is the standard language for relational database management systems.",
                options: [
                    { option_text: "Structured Query Language", is_correct: true },
                    { option_text: "Standard Query Linker", is_correct: false },
                    { option_text: "Sequential Query Language", is_correct: false },
                    { option_text: "Structured Quick Locator", is_correct: false }
                ]
            },
            {
                question_text: "Which SQL JOIN returns all rows from both tables when there is a match in either side?",
                marks: 5,
                explanation: "FULL OUTER JOIN returns all matching and non-matching records from both left and right tables, replacing non-matching fields with NULLs.",
                options: [
                    { option_text: "FULL OUTER JOIN", is_correct: true },
                    { option_text: "INNER JOIN", is_correct: false },
                    { option_text: "CROSS JOIN", is_correct: false },
                    { option_text: "LEFT JOIN", is_correct: false }
                ]
            },
            {
                question_text: "What is a Primary Key constraint?",
                marks: 5,
                explanation: "A Primary Key constraint uniquely identifies each record in a database table. It must contain unique, non-null values.",
                options: [
                    { option_text: "A unique identifier for each table row", is_correct: true },
                    { option_text: "A link constraint pointing to other schemas", is_correct: false },
                    { option_text: "An encryption index protecting data rows", is_correct: false },
                    { option_text: "A constraint allowing only integer numbers", is_correct: false }
                ]
            },
            {
                question_text: "What SQL statement is used to update existing data inside tables?",
                marks: 5,
                explanation: "The UPDATE command modifies existing records in a table, usually filtered with a WHERE clause.",
                options: [
                    { option_text: "UPDATE", is_correct: true },
                    { option_text: "MODIFY", is_correct: false },
                    { option_text: "CHANGE", is_correct: false },
                    { option_text: "ALTER", is_correct: false }
                ]
            },
            {
                question_text: "What does ACID stand for in transaction processing?",
                marks: 5,
                explanation: "ACID stands for Atomicity (all or nothing), Consistency (valid state transitions), Isolation (independent concurrent runs), and Durability (survives system crashes).",
                options: [
                    { option_text: "Atomicity, Consistency, Isolation, Durability", is_correct: true },
                    { option_text: "Access, Control, Index, Dependency", is_correct: false },
                    { option_text: "Atomicity, Concurrency, Integrity, Durability", is_correct: false },
                    { option_text: "Allocation, Consistency, Isolation, Database", is_correct: false }
                ]
            },
            {
                question_text: "Which SQL command drops a database table structure and all of its records permanently?",
                marks: 5,
                explanation: "DROP TABLE deletes the table definition, schema structures, and data permanently from the database catalog.",
                options: [
                    { option_text: "DROP TABLE", is_correct: true },
                    { option_text: "DELETE TABLE", is_correct: false },
                    { option_text: "TRUNCATE TABLE", is_correct: false },
                    { option_text: "REMOVE TABLE", is_correct: false }
                ]
            },
            {
                question_text: "Which isolation level prevents all anomalies (including phantom reads) in SQL standards?",
                marks: 5,
                explanation: "SERIALIZABLE is the highest transaction isolation level. It prevents dirty reads, non-repeatable reads, and phantom reads by executing transactions as if they were serial.",
                options: [
                    { option_text: "SERIALIZABLE", is_correct: true },
                    { option_text: "REPEATABLE READ", is_correct: false },
                    { option_text: "READ COMMITTED", is_correct: false },
                    { option_text: "READ UNCOMMITTED", is_correct: false }
                ]
            },
            {
                question_text: "What mechanism does PostgreSQL use to handle concurrent operations without locking data?",
                marks: 5,
                explanation: "MVCC (Multi-Version Concurrency Control) allows PostgreSQL to process concurrent reads and writes safely, giving each transaction a snapshot version of the data.",
                options: [
                    { option_text: "MVCC (Multi-Version Concurrency Control)", is_correct: true },
                    { option_text: "Table Exclusive Locking", is_correct: false },
                    { option_text: "Row-level Mutex Locking", is_correct: false },
                    { option_text: "Two-Phase Commit Catalog", is_correct: false }
                ]
            },
            {
                question_text: "What is the main benefit of database indexes?",
                marks: 5,
                explanation: "Indexes speed up data retrieval queries by creating a searchable index tree structure (like B-Tree) on specified column values.",
                options: [
                    { option_text: "Speeds up data retrieval queries", is_correct: true },
                    { option_text: "Speeds up data INSERT operations", is_correct: false },
                    { option_text: "Guarantees database encryption on disk", is_correct: false },
                    { option_text: "Reduces space occupied on server storage", is_correct: false }
                ]
            },
            {
                question_text: "Which constraint enforces uniqueness across a column's values?",
                marks: 5,
                explanation: "The UNIQUE constraint ensures that all values in a column or set of columns are distinct.",
                options: [
                    { option_text: "UNIQUE", is_correct: true },
                    { option_text: "PRIMARY KEY only", is_correct: false },
                    { option_text: "CHECK", is_correct: false },
                    { option_text: "NOT NULL", is_correct: false }
                ]
            },
            {
                question_text: "Which function returns the current date and time with time zone in PostgreSQL?",
                marks: 5,
                explanation: "NOW() is a built-in PostgreSQL function that returns the current transaction start timestamp.",
                options: [
                    { option_text: "NOW()", is_correct: true },
                    { option_text: "CURRENT_TIME", is_correct: false },
                    { option_text: "GETDATE()", is_correct: false },
                    { option_text: "DATE()", is_correct: false }
                ]
            },
            {
                question_text: "What is a Foreign Key constraint?",
                marks: 5,
                explanation: "A foreign key constraint creates a link between tables by referencing the primary key (or unique key) in another parent table, enforcing referential integrity.",
                options: [
                    { option_text: "A column referencing a primary key in another table", is_correct: true },
                    { option_text: "An encryption key generated for data exports", is_correct: false },
                    { option_text: "A key representing non-ASCII text values", is_correct: false },
                    { option_text: "A key restricting network connections to foreign IPs", is_correct: false }
                ]
            },
            {
                question_text: "Which aggregate function counts the total rows returned by a query?",
                marks: 5,
                explanation: "COUNT() is used to count the number of rows that match a query's criteria.",
                options: [
                    { option_text: "COUNT()", is_correct: true },
                    { option_text: "SUM()", is_correct: false },
                    { option_text: "TOTAL()", is_correct: false },
                    { option_text: "ROWS()", is_correct: false }
                ]
            },
            {
                question_text: "What is the purpose of the SQL GROUP BY statement?",
                marks: 5,
                explanation: "GROUP BY groups rows that share identical values in specified columns into summary rows, typically used with aggregate functions (e.g. COUNT, SUM).",
                options: [
                    { option_text: "Groups rows sharing values into summary rows", is_correct: true },
                    { option_text: "Orders results in alphabetical lists", is_correct: false },
                    { option_text: "Speeds up join operations on foreign keys", is_correct: false },
                    { option_text: "Restricts matching rows using logical filters", is_correct: false }
                ]
            },
            {
                question_text: "Which constraint prevents column cells from containing NULL fields?",
                marks: 5,
                explanation: "The NOT NULL constraint forces a column to always contain a value, preventing null values from being inserted.",
                options: [
                    { option_text: "NOT NULL", is_correct: true },
                    { option_text: "UNIQUE", is_correct: false },
                    { option_text: "CHECK_NULL", is_correct: false },
                    { option_text: "REQUIRED", is_correct: false }
                ]
            },
            {
                question_text: "Which SQL command merges query results from two SELECT statements, removing duplicates?",
                marks: 5,
                explanation: "UNION combines the result sets of two or more SELECT queries into a single result, omitting any duplicate records.",
                options: [
                    { option_text: "UNION", is_correct: true },
                    { option_text: "JOIN", is_correct: false },
                    { option_text: "CONCAT", is_correct: false },
                    { option_text: "INTERSECT", is_correct: false }
                ]
            },
            {
                question_text: "What is a database transaction?",
                marks: 5,
                explanation: "A transaction is a single logical unit of database processing operations, wrapped in BEGIN and COMMIT/ROLLBACK blocks to guarantee integrity.",
                options: [
                    { option_text: "A unit of work executed atomically", is_correct: true },
                    { option_text: "A payment verification log for admins", is_correct: false },
                    { option_text: "An index structure used to filter logs", is_correct: false },
                    { option_text: "A network request query hitting APIs", is_correct: false }
                ]
            },
            {
                question_text: "What does the SQL HAVING clause do?",
                marks: 5,
                explanation: "HAVING filters aggregated groups created by a GROUP BY clause, whereas WHERE filters individual rows before grouping occurs.",
                options: [
                    { option_text: "Applies conditions to aggregated groups", is_correct: true },
                    { option_text: "Applies index constraints to tables", is_correct: false },
                    { option_text: "Sorts results in customized orders", is_correct: false },
                    { option_text: "Filters columns before execution", is_correct: false }
                ]
            },
            {
                question_text: "Which command removes all rows from a table quickly without logging individual row deletions?",
                marks: 5,
                explanation: "TRUNCATE TABLE empties a table quickly by deallocating the data pages, bypassing individual row deletion logging.",
                options: [
                    { option_text: "TRUNCATE", is_correct: true },
                    { option_text: "DELETE", is_correct: false },
                    { option_text: "DROP", is_correct: false },
                    { option_text: "CLEAR", is_correct: false }
                ]
            },
            {
                question_text: "What is a database view?",
                marks: 5,
                explanation: "A view is a virtual table representation defined by a stored SELECT query, allowing reuse without duplication.",
                options: [
                    { option_text: "A virtual table defined by a query", is_correct: true },
                    { option_text: "An graphical interface monitoring database load", is_correct: false },
                    { option_text: "An index optimization map", is_correct: false },
                    { option_text: "A file storing configuration properties", is_correct: false }
                ]
            }
        ]
    },
    {
        category: "Security",
        description: "Web application security principles, hashing algorithms, and vulnerability mitigations.",
        quiz: {
            title: "Web Security & Ethical Hashing",
            description: "Test your skills in web security mitigations (XSS, SQLi, CSRF), cryptographical hashing rules, and defensive architectures.",
            difficulty: "HARD",
            duration_minutes: 20,
            passing_score: 80,
            max_attempts: 2,
            negative_marks: 1.00, // strict negative marks
            status: "PUBLISHED"
        },
        questions: [
            {
                question_text: "Which hashing algorithm is widely recommended for password hashing due to block factor salting mechanisms?",
                marks: 5,
                explanation: "bcrypt is a slow password hashing function based on the Blowfish cipher. It incorporates a salt and configurable work factor to protect against brute-force attacks.",
                options: [
                    { option_text: "bcrypt", is_correct: true },
                    { option_text: "MD5", is_correct: false },
                    { option_text: "SHA-1", is_correct: false },
                    { option_text: "SHA-256", is_correct: false }
                ]
            },
            {
                question_text: "What is SQL Injection (SQLi)?",
                marks: 5,
                explanation: "SQL Injection is a vulnerability where malicious SQL commands are injected into data input fields to execute unauthorized database transactions.",
                options: [
                    { option_text: "Injecting malicious SQL statements into inputs to manipulate the database", is_correct: true },
                    { option_text: "An injection of high frequency queries overloading servers", is_correct: false },
                    { option_text: "Inserting unauthorized row records directly via CSV import", is_correct: false },
                    { option_text: "A database configuration bug allowing global reads", is_correct: false }
                ]
            },
            {
                question_text: "What does XSS stand for?",
                marks: 5,
                explanation: "XSS stands for Cross-Site Scripting. It is a vulnerability that allows attackers to inject malicious client-side scripts into web pages viewed by other users.",
                options: [
                    { option_text: "Cross-Site Scripting", is_correct: true },
                    { option_text: "XML Secure Schema", is_correct: false },
                    { option_text: "X-Link Security Standard", is_correct: false },
                    { option_text: "Cross-Site Socket Encryption", is_correct: false }
                ]
            },
            {
                question_text: "What is Cross-Site Request Forgery (CSRF)?",
                marks: 5,
                explanation: "CSRF forces an authenticated browser user to execute unwanted actions on a trusted web application where they are currently logged in.",
                options: [
                    { option_text: "Forcing a user's browser to execute requests on an application they are authenticated in", is_correct: true },
                    { option_text: "Stealing session cookie tokens via script injection", is_correct: false },
                    { option_text: "Flooding API nodes with brute-force request queries", is_correct: false },
                    { option_text: "Configuring cross-origin headers to accept all origins", is_correct: false }
                ]
            },
            {
                question_text: "Which HTTP response header mitigates XSS by restricting allowed browser resource load domains?",
                marks: 5,
                explanation: "Content-Security-Policy (CSP) restricts dynamic resource loads (scripts, styles, images) to trusted, whitelisted origins, mitigating XSS attacks.",
                options: [
                    { option_text: "Content-Security-Policy", is_correct: true },
                    { option_text: "X-Frame-Options", is_correct: false },
                    { option_text: "Strict-Transport-Security", is_correct: false },
                    { option_text: "Access-Control-Allow-Origin", is_correct: false }
                ]
            },
            {
                question_text: "What is the purpose of adding a random 'salt' value to passwords prior to hashing?",
                marks: 5,
                explanation: "A salt is random data combined with the password before hashing. It ensures identical passwords yield different hashes, preventing rainbow table lookup attacks.",
                options: [
                    { option_text: "Ensures identical passwords result in distinct hashes, neutralizing rainbow tables", is_correct: true },
                    { option_text: "Compresses the hash string to save database columns", is_correct: false },
                    { option_text: "Speeds up comparison validations during logins", is_correct: false },
                    { option_text: "Encrypts the final hash with a public-private key pair", is_correct: false }
                ]
            },
            {
                question_text: "What are the components of the CIA Triad in information security?",
                marks: 5,
                explanation: "The CIA Triad stands for Confidentiality (privacy protection), Integrity (data modification safety), and Availability (system uptime).",
                options: [
                    { option_text: "Confidentiality, Integrity, Availability", is_correct: true },
                    { option_text: "Cryptography, Integrity, Authorization", is_correct: false },
                    { option_text: "Concurrency, Identity, Authenticity", is_correct: false },
                    { option_text: "Control, Inspection, Auditing", is_correct: false }
                ]
            },
            {
                question_text: "Which protocol secures web browser connection communication using encryption?",
                marks: 5,
                explanation: "HTTPS (Hypertext Transfer Protocol Secure) uses TLS (Transport Layer Security) encryption to protect communication between browser clients and servers.",
                options: [
                    { option_text: "HTTPS / TLS", is_correct: true },
                    { option_text: "HTTP / TCP", is_correct: false },
                    { option_text: "FTP / SSH", is_correct: false },
                    { option_text: "DNSSEC", is_correct: false }
                ]
            },
            {
                question_text: "What occurs during a Man-in-the-Middle (MITM) network attack?",
                marks: 5,
                explanation: "In an MITM attack, an attacker intercept and optionally alters data packets communicating between two trusting client systems.",
                options: [
                    { option_text: "An attacker intercepts communication between two parties secretly", is_correct: true },
                    { option_text: "An attacker executes brute force queries to guess passwords", is_correct: false },
                    { option_text: "An attacker crashes the web server with heavy concurrent load", is_correct: false },
                    { option_text: "An attacker modifies source code files inside the server repository", is_correct: false }
                ]
            },
            {
                question_text: "What is the primary role of CORS (Cross-Origin Resource Sharing) in browser engines?",
                marks: 5,
                explanation: "CORS is a browser security mechanism that restricts cross-origin HTTP requests, letting servers whitelist origins allowed to query their APIs.",
                options: [
                    { option_text: "A mechanism letting servers declare which origins can load resource APIs", is_correct: true },
                    { option_text: "An encryption mechanism protecting cookie values", is_correct: false },
                    { option_text: "A protocol enforcing JWT token rotations", is_correct: false },
                    { option_text: "A server firewall block pattern blocking foreign IPs", is_correct: false }
                ]
            },
            {
                question_text: "Which HTTP status code is standard for requests missing valid authentication credentials?",
                marks: 5,
                explanation: "401 Unauthorized is returned when a request is missing valid authentication credentials (e.g. invalid JWT token).",
                options: [
                    { option_text: "401 Unauthorized", is_correct: true },
                    { option_text: "403 Forbidden", is_correct: false },
                    { option_text: "400 Bad Request", is_correct: false },
                    { option_text: "404 Not Found", is_correct: false }
                ]
            },
            {
                question_text: "Which hashing algorithm is widely considered insecure and vulnerable to collision attacks?",
                marks: 5,
                explanation: "MD5 (Message Digest 5) is considered cryptographically broken. It is highly susceptible to collision attacks, where different inputs yield identical hashes.",
                options: [
                    { option_text: "MD5", is_correct: true },
                    { option_text: "SHA-256", is_correct: false },
                    { option_text: "SHA-384", is_correct: false },
                    { option_text: "bcrypt", is_correct: false }
                ]
            },
            {
                question_text: "What is the difference between hashing and encryption algorithms?",
                marks: 5,
                explanation: "Hashing is a one-way mathematical function mapping data to a fixed length string (irreversible). Encryption is a two-way function (reversible using keys).",
                options: [
                    { option_text: "Hashing is irreversible one-way; encryption is reversible two-way.", is_correct: true },
                    { option_text: "Hashing uses public-private keys; encryption uses seeds.", is_correct: false },
                    { option_text: "Encryption is faster but vulnerable to collision attacks.", is_correct: false },
                    { option_text: "There is no difference; they are interchangeable terms.", is_correct: false }
                ]
            },
            {
                question_text: "What does OWASP stand for in security fields?",
                marks: 5,
                explanation: "OWASP stands for Open Web Application Security Project. It is a non-profit foundation focused on improving web application security.",
                options: [
                    { option_text: "Open Web Application Security Project", is_correct: true },
                    { option_text: "Official Web Access Security Policy", is_correct: false },
                    { option_text: "Operational Web Auditing and Standard Protocols", is_correct: false },
                    { option_text: "Open Source Warning and Security Panel", is_correct: false }
                ]
            },
            {
                question_text: "Which of the following is considered a Social Engineering cyber attack vector?",
                marks: 5,
                explanation: "Phishing is a social engineering attack that manipulates individuals into giving up sensitive keys, credentials, or personal information.",
                options: [
                    { option_text: "Phishing", is_correct: true },
                    { option_text: "SQL Injection", is_correct: false },
                    { option_text: "Cross-Site Scripting", is_correct: false },
                    { option_text: "Brute-force password cracking", is_correct: false }
                ]
            },
            {
                question_text: "What mechanism is designed to mitigate DDoS or brute force login attempts by limiting query frequency?",
                marks: 5,
                explanation: "Rate limiting restricts the number of requests a user can make to an API in a given time frame, preventing server exhaustion and brute-forcing.",
                options: [
                    { option_text: "Rate Limiting", is_correct: true },
                    { option_text: "SSL Salting", is_correct: false },
                    { option_text: "JWT Rotation", is_correct: false },
                    { option_text: "MVCC Concurrency", is_correct: false }
                ]
            },
            {
                question_text: "What is a Penetration Test?",
                marks: 5,
                explanation: "A penetration test (or pen test) is an authorized, simulated cyberattack against an application or network to identify security vulnerabilities.",
                options: [
                    { option_text: "An authorized simulated attack to find vulnerabilities", is_correct: true },
                    { option_text: "An automated script checking for updates", is_correct: false },
                    { option_text: "A hardware stress test of the hosting server", is_correct: false },
                    { option_text: "A code review checking for syntax style compliance", is_correct: false }
                ]
            },
            {
                question_text: "Which secure HTTP cookie flag prevents access to cookie tokens via client-side Javascript scripts?",
                marks: 5,
                explanation: "The HttpOnly flag in Set-Cookie headers prevents browser scripts (like document.cookie) from accessing the cookie, helping mitigate XSS session hijacking.",
                options: [
                    { option_text: "HttpOnly", is_correct: true },
                    { option_text: "Secure", is_correct: false },
                    { option_text: "SameSite", is_correct: false },
                    { option_text: "Path", is_correct: false }
                ]
            },
            {
                question_text: "What is a replay attack in network communications?",
                marks: 5,
                explanation: "A replay attack is a form of network attack in which a valid data transmission is maliciously or fraudulently repeated or delayed.",
                options: [
                    { option_text: "A transmission is captured and maliciously repeated later", is_correct: true },
                    { option_text: "A server is flooded with recursive redirect requests", is_correct: false },
                    { option_text: "A database transaction is undone using logs", is_correct: false },
                    { option_text: "A password is brute forced using customized scripts", is_correct: false }
                ]
            },
            {
                question_text: "What does MFA stand for in authentication architectures?",
                marks: 5,
                explanation: "MFA stands for Multi-Factor Authentication. It requires users to present two or more independent credentials to verify identity.",
                options: [
                    { option_text: "Multi-Factor Authentication", is_correct: true },
                    { option_text: "Multi-File Access control", is_correct: false },
                    { option_text: "Master File Architecture", is_correct: false },
                    { option_text: "Manual Firewall Authorization", is_correct: false }
                ]
            }
        ]
    },
    {
        category: "React",
        description: "React design patterns, rendering lifecycles, and component state managers.",
        quiz: {
            title: "React & Frontend Architecture",
            description: "Verify your proficiency in modern single page React applications, state handlers, hooks, and Virtual DOM reconciliations.",
            difficulty: "INTERMEDIATE",
            duration_minutes: 15,
            passing_score: 70,
            max_attempts: 1,
            negative_marks: 0.25,
            status: "PUBLISHED"
        },
        questions: [
            {
                question_text: "Which React hook is used to perform side effects in functional components?",
                marks: 5,
                explanation: "useEffect runs side effects after render.",
                options: [
                    { option_text: "useEffect", is_correct: true },
                    { option_text: "useState", is_correct: false },
                    { option_text: "useContext", is_correct: false },
                    { option_text: "useReducer", is_correct: false }
                ]
            },
            {
                question_text: "What is the virtual DOM in React?",
                marks: 5,
                explanation: "Virtual DOM syncs with the real DOM via reconciliation.",
                options: [
                    { option_text: "A lightweight representation of the real DOM in memory", is_correct: true },
                    { option_text: "A direct connection to the browser document", is_correct: false },
                    { option_text: "A database store running inside index.js", is_correct: false },
                    { option_text: "An styling engine replacing CSS files", is_correct: false }
                ]
            }
        ]
    },
    {
        category: "Computer Science",
        description: "Basic and advanced computer science data structures and sorting algorithms.",
        quiz: {
            title: "Data Structures & Algorithms",
            description: "Evaluate your algorithm problem-solving abilities, covering stack structures, queues, trees, and algorithmic complexity.",
            difficulty: "HARD",
            duration_minutes: 30,
            passing_score: 75,
            max_attempts: 1,
            negative_marks: 0.50,
            status: "PUBLISHED"
        },
        questions: [
            {
                question_text: "What is the average time complexity of searching a value in a binary search tree?",
                marks: 5,
                explanation: "Each step cuts search space in half.",
                options: [
                    { option_text: "O(log n)", is_correct: true },
                    { option_text: "O(n)", is_correct: false },
                    { option_text: "O(1)", is_correct: false },
                    { option_text: "O(n log n)", is_correct: false }
                ]
            },
            {
                question_text: "Which data structure operates on a Last-In, First-Out (LIFO) model?",
                marks: 5,
                explanation: "Stacks push/pop from the top.",
                options: [
                    { option_text: "Stack", is_correct: true },
                    { option_text: "Queue", is_correct: false },
                    { option_text: "Linked List", is_correct: false },
                    { option_text: "Graph", is_correct: false }
                ]
            }
        ]
    },
    {
        category: "Cloud Computing",
        description: "Amazon Web Services (AWS) solutions architecture, instances, and storage buckets.",
        quiz: {
            title: "Cloud Computing & AWS",
            description: "Accredit your knowledge in Amazon Web Services (AWS) deployment environments, scalable compute nodes, and object stores.",
            difficulty: "INTERMEDIATE",
            duration_minutes: 20,
            passing_score: 70,
            max_attempts: 1,
            negative_marks: 0.50,
            status: "PUBLISHED"
        },
        questions: [
            {
                question_text: "Which AWS service provides resizable compute capacity in the cloud?",
                marks: 5,
                explanation: "EC2 stands for Elastic Compute Cloud.",
                options: [
                    { option_text: "EC2", is_correct: true },
                    { option_text: "S3", is_correct: false },
                    { option_text: "RDS", is_correct: false },
                    { option_text: "Lambda", is_correct: false }
                ]
            },
            {
                question_text: "What is the primary usage of Amazon S3?",
                marks: 5,
                explanation: "S3 stands for Simple Storage Service.",
                options: [
                    { option_text: "Object storage service for data and assets", is_correct: true },
                    { option_text: "Relational database hosting", is_correct: false },
                    { option_text: "DNS routing domain manager", is_correct: false },
                    { option_text: "Direct virtual machine instances", is_correct: false }
                ]
            }
        ]
    }
];

// Seed Function
async function seedRichQuizzes() {
    try {
        console.log('🌱 Starting Rich Quiz Seeding script...');
        
        for (const data of SEED_DATA) {
            // 1. Ensure Category Exists
            let categoryId;
            const catRes = await db.query('SELECT id FROM categories WHERE name = $1', [data.category]);
            if (catRes.rows.length === 0) {
                const insertCat = await db.query(
                    'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id',
                    [data.category, data.description]
                );
                categoryId = insertCat.rows[0].id;
                console.log(`✅ Category Created: ${data.category}`);
            } else {
                categoryId = catRes.rows[0].id;
            }

            // 2. Ensure Quiz Exists
            let quizId;
            const quizRes = await db.query('SELECT id FROM quizzes WHERE title = $1', [data.quiz.title]);
            if (quizRes.rows.length === 0) {
                const insertQuiz = await db.query(
                    `INSERT INTO quizzes 
                     (title, description, category_id, difficulty, duration_minutes, passing_score, max_attempts, negative_marks, status) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
                     RETURNING id`,
                    [
                        data.quiz.title,
                        data.quiz.description,
                        categoryId,
                        data.quiz.difficulty,
                        data.quiz.duration_minutes,
                        data.quiz.passing_score,
                        data.quiz.max_attempts,
                        data.quiz.negative_marks,
                        data.quiz.status
                    ]
                );
                quizId = insertQuiz.rows[0].id;
                console.log(`✅ Quiz Created: ${data.quiz.title}`);

                // 3. Seed Questions & Options
                const targetCount = 20;
                let questionsToSeed = [...data.questions];
                // Replicate questions dynamically to reach 20 if less
                while (questionsToSeed.length < targetCount && data.questions.length > 0) {
                    const qTemplate = data.questions[questionsToSeed.length % data.questions.length];
                    questionsToSeed.push({
                        ...qTemplate,
                        question_text: `${qTemplate.question_text} (Variant ${Math.floor(questionsToSeed.length / data.questions.length) + 1})`
                    });
                }

                for (const q of questionsToSeed) {
                    const insertQ = await db.query(
                        `INSERT INTO questions (quiz_id, question_text, marks, explanation) 
                         VALUES ($1, $2, $3, $4) 
                         RETURNING id`,
                        [quizId, q.question_text, q.marks, q.explanation]
                    );
                    const questionId = insertQ.rows[0].id;

                    for (const opt of q.options) {
                        await db.query(
                            `INSERT INTO options (question_id, option_text, is_correct) 
                             VALUES ($1, $2, $3)`,
                            [questionId, opt.option_text, opt.is_correct]
                        );
                    }
                }
                console.log(`🎉 Seeded exactly 20 questions for quiz: ${data.quiz.title}`);
            } else {
                console.log(`ℹ️ Quiz already exists, skipping: ${data.quiz.title}`);
            }
        }
        console.log('🌱 Rich Quiz Seeding process completed successfully!');
    } catch (error) {
        console.error('❌ ERROR DURING SEEDING:', error);
    }
}

module.exports = seedRichQuizzes;
