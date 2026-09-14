const exampleCode = {
  Python: 'value = 2\\nresult = value * 3\\nprint(result)',
  Go: 'package main\\n\\nimport \"fmt\"\\n\\nfunc main() {\\n\\tvalues := []int{1, 2, 3}\\n\\tfor _, value := range values {\\n\\t\\tfmt.Println(value)\\n\\t}\\n}',
  JavaScript: 'const values = [1, 2, 3]\\nconsole.log(values.map(value => value * 2))',
  Java: 'class Main { public static void main(String[] args) { System.out.println(\"Focus\"); } }',
  Rust: 'fn main() { let values = vec![1, 2, 3]; println!(\"{:?}\", values); }',
  'C++': '#include <iostream>\\nint main() { std::cout << \"Focus\"; }',
}

const pythonRequirements = {
  'Start Python: What is Python?': ['print'],
  'How a Python program runs': ['print'],
  'Your first Python program': ['print', '='],
  'Reading Python syntax & comments': ['#', 'print'],
  'Values, variables & assignment': ['='],
  'Numbers & arithmetic': ['+', 'print'],
  'Strings & text': ['"'],
  'Booleans & comparisons': ['True', 'False'],
  'Input & output': ['input', 'print'],
  'Conversions & formatting': ['int', 'print'],
  'Conditional statements': ['if'],
  'Truthiness & guard clauses': ['if', 'not'],
  'For loops & range': ['for', 'range'],
  'While loops': ['while'],
  'break, continue & pass': ['for'],
  'Nested loops': ['for'],
  'Lists': ['[', ']'],
  'List methods': ['.', '[', ']'],
  'Slicing sequences': ['[', ':', ']'],
  'List comprehensions': ['for', '[', ']'],
  'Tuples & unpacking': ['=', '('],
  'Dictionaries': ['{', ':', '}'],
  'Sets': ['{', '}'],
  'Dictionary & set comprehensions': ['for', '{', '}'],
  'Functions': ['def', 'return'],
  'Parameters & return values': ['def', 'return'],
  'Scope & namespaces': ['def'],
  'Recursion': ['def'],
  'Lambda, sorted & key functions': ['lambda'],
  'Iterators & generators': ['yield'],
  'Exceptions': ['try', 'except'],
  'Custom exceptions & validation': ['raise', 'class'],
  'Files & paths': ['open'],
  'CSV & JSON data': ['json'],
  'Modules & imports': ['import'],
  'Packages & virtual environments': ['import'],
  'Classes & objects': ['class', 'self'],
  'Inheritance & composition': ['class'],
  'Dataclasses & properties': ['class', '@'],
  'Dunder methods & protocols': ['__'],
  'Type hints': [':', '->'],
  'Testing with unittest': ['unittest', 'assert'],
  'Debugging & logging': ['logging'],
  'Regular expressions': ['re'],
  'Dates & time': ['datetime'],
  'Command-line programs': ['argparse'],
  'Concurrency with threading': ['Thread'],
  'Async programming': ['async', 'await'],
  'Performance & complexity': ['set'],
  'Capstone: build a CLI tracker': ['def', '[', ']'],
}

const languageRequirements = {
  Go: ['package', 'func'],
  JavaScript: ['const'],
  Java: ['class'],
  Rust: ['fn'],
  'C++': ['#include'],
}

const conceptRequirements = {
  Go: { 'Loops': ['for'], 'Arrays & slices': ['[]'], Maps: ['map'], 'Structs & methods': ['struct'], Interfaces: ['interface'], Pointers: ['*'], Testing: ['testing'], 'Goroutines & channels': ['go', 'chan'], 'HTTP services': ['http'] },
  JavaScript: { 'Functions': ['function'], 'Arrays & objects': ['[', '{'], 'Control flow': ['if'], 'Array methods': ['map'], 'Scope & closures': ['let'], 'DOM events': ['querySelector'], 'Promises & async': ['async'], 'Classes': ['class'], 'Node.js & HTTP': ['createServer'], Testing: ['test'] },
  Java: { 'Control flow': ['if'], 'Methods & arrays': ['static'], 'Classes & objects': ['class'], Inheritance: ['extends'], Interfaces: ['interface'], Exceptions: ['try'], Collections: ['List'], Generics: ['<'], Streams: ['stream'], Testing: ['@Test'], Concurrency: ['Thread'], 'HTTP services': ['http'] },
  Rust: { 'Control flow': ['if'], Functions: ['fn'], 'Structs & enums': ['struct'], 'Pattern matching': ['match'], 'Vectors & strings': ['vec!'], 'Hash maps': ['HashMap'], Borrowing: ['&'], Lifetimes: ["'"] , 'Traits & generics': ['trait'], 'Error handling': ['Result'], Iterators: ['iter'], 'Modules & crates': ['mod'], Concurrency: ['thread'], 'Async Rust': ['async'], Testing: ['#[test]'] },
  'C++': { 'Control flow': ['if'], Functions: ['int main'], 'Arrays & strings': ['string'], 'References & pointers': ['&'], Classes: ['class'], Inheritance: [':'], Templates: ['template'], 'STL containers': ['vector'], 'Algorithms & iterators': ['algorithm'], 'Memory management': ['unique_ptr'], Exceptions: ['try'], 'Files & streams': ['fstream'], Concurrency: ['thread'], Testing: ['TEST'], Performance: ['chrono'] },
}

const makeLesson = (language, title, explanation, code = exampleCode[language]) => ({
  title,
  summary: 'Understand ' + title.toLowerCase() + ' through a guided example.',
  explanation: explanation + ' This is useful beyond this small example: it gives you a way to predict behavior in larger programs, explain a bug to another developer, and choose a design that keeps state visible. When you meet this idea in a new problem, first name the values involved, then identify the operation that changes them, and finally check what the caller or next line can observe.',
  guide: [
    'Start by identifying the values, names, or objects introduced before the main operation.',
    'Trace the example from top to bottom. Pause whenever a value is created, changed, returned, or passed into another scope.',
    'Change one input after the first run. Predict the result before running it again, then compare your prediction with the trace.',
  ],
  pitfalls: 'Do not try to memorize the syntax first. Focus on what state exists before the line runs and what state exists after it.',
  exercise: {
    prompt: 'Modify the example so it demonstrates the idea in a new case. Change at least one input or operation, then predict the result before checking your work.',
    starter: code,
    requiredTokens: language === 'Python' ? (pythonRequirements[title] || []) : [...languageRequirements[language], ...(conceptRequirements[language]?.[title] || [])],
    minOccurrences: [],
    maxOccurrences: title === 'How a Python program runs' ? [{ token: 'print', count: 3 }] : [],
    ...(title === 'How a Python program runs' ? {
      prompt: 'Write a small program that demonstrates statements running in order. You may print any values you choose, but produce no more than three outputs. Put statements on separate lines or use normal Python syntax; do not type the characters \\n.',
      starter: 'print("alpha")\nprint("beta")\nprint("gamma")',
      skipOutputCheck: true,
    } : {}),
    ...(title === 'Your first Python program' ? {
      prompt: 'Write your own first greeting program. Assign any name you choose to a variable, then print a greeting that uses that variable. Ada is only the worked-example name; your exercise can use your name or any other name.',
      starter: 'name = "Learner"\nprint("Welcome, " + name)',
      skipOutputCheck: true,
    } : {}),
  },
  code,
  objectives: [
    'Explain the core idea in your own words.',
    'Trace the example one state change at a time.',
    'Modify the example and predict the new output.',
  ],
})

const pythonTitles = [
  'Start Python: What is Python?', 'How a Python program runs', 'Your first Python program', 'Reading Python syntax & comments',
  'Values, variables & assignment', 'Numbers & arithmetic', 'Strings & text', 'Booleans & comparisons', 'Input & output',
  'Conversions & formatting', 'Conditional statements', 'Truthiness & guard clauses', 'For loops & range', 'While loops',
  'break, continue & pass', 'Nested loops', 'Lists', 'List methods', 'Slicing sequences', 'List comprehensions',
  'Tuples & unpacking', 'Dictionaries', 'Sets', 'Dictionary & set comprehensions', 'Functions', 'Parameters & return values',
  'Scope & namespaces', 'Recursion', 'Lambda, sorted & key functions', 'Iterators & generators', 'Exceptions',
  'Custom exceptions & validation', 'Files & paths', 'CSV & JSON data', 'Modules & imports', 'Packages & virtual environments',
  'Classes & objects', 'Inheritance & composition', 'Dataclasses & properties', 'Dunder methods & protocols', 'Type hints',
  'Testing with unittest', 'Debugging & logging', 'Regular expressions', 'Dates & time', 'Command-line programs',
  'Concurrency with threading', 'Async programming', 'Performance & complexity', 'Capstone: build a CLI tracker',
]

const pythonExplanations = {
  'Start Python: What is Python?': 'Python is a general-purpose programming language designed to make instructions readable. A program is a sequence of precise instructions, and Python is the set of rules that turns those instructions into behavior. We will use Python to learn a broader skill: breaking a problem into state, decisions, repetition, and reusable behavior.',
  'How a Python program runs': 'When you run a Python file, the interpreter reads the source, parses its structure, and executes statements in order. It creates values in memory, evaluates expressions, and reports output or errors. Thinking in this execution order will let you predict a program before pressing Run.',
  'Your first Python program': 'The first program should make the full cycle visible: source code is written, Python executes a statement, and the program produces output. print is a function that displays a value; the text inside quotes is a string literal passed into that function.',
  'Reading Python syntax & comments': 'Python uses indentation, punctuation, names, operators, and keywords to communicate structure. Comments begin with # and help humans understand intent; Python ignores them during execution. Learning to read a line by identifying its pieces is more useful than memorizing keywords.',
  'Values, variables & assignment': 'Python evaluates the right side before binding a value to the name on the left. Reassignment changes what a name refers to, so trace state after every assignment.',
  'Numbers & arithmetic': 'Arithmetic follows precedence rules. Use parentheses when order matters, and remember that division, floor division, and remainder produce different results.',
  'Strings & text': 'Strings are immutable sequences. Concatenation, slicing, and methods create new strings rather than modifying the original value.',
  'Conditional statements': 'Python checks branches from top to bottom and executes the first matching branch. Indentation is part of the program structure.',
  'For loops & range': 'A for loop gets the next item from an iterable, binds it, runs the body, and repeats. range produces a sequence of numbers lazily.',
  'While loops': 'A while loop checks its condition before every iteration. The body must move state toward a false condition or it can run forever.',
  'Functions': 'A function runs only when called. Arguments enter parameters, local variables live inside the call, and return sends a result back.',
  'Scope & namespaces': 'Python resolves names through local, enclosing, global, and built-in scopes. Passing values is usually clearer than changing global state.',
  'Recursion': 'A recursive function needs a base case and a step toward it. Each call creates a stack frame, making return order important.',
  'Exceptions': 'An exception interrupts normal flow and searches for a matching handler. Catch only errors you can actually handle.',
  'Files & paths': 'Use with to close files safely. pathlib makes path operations readable and portable across operating systems.',
  'Classes & objects': 'A class describes attributes and methods while each instance owns its state. self is the instance receiving a method call.',
  'Testing with unittest': 'A test compares known behavior with an expected result. Isolated tests make failures close to their cause.',
  'Async programming': 'async functions return coroutines and await gives control back while work waits. Blocking work must not run on the event loop.',
}

const pythonCode = {
  'Start Python: What is Python?': '# This is a Python statement\nprint("Python is readable")',
  'How a Python program runs': 'print("first")\nprint("second")\nprint("third")',
  'Your first Python program': 'name = "Ada"\nprint("Hello, " + name)',
  'Reading Python syntax & comments': '# Python ignores this comment\nmessage = "Focus"\nprint(message)',
  'Values, variables & assignment': 'score = 10\\nscore = score + 5\\nprint(score)',
  'Conditional statements': 'temperature = 24\\nif temperature > 20:\\n    print(\"Warm\")\\nelse:\\n    print(\"Cool\")',
  'For loops & range': 'total = 0\\nfor number in range(1, 6):\\n    total += number\\nprint(total)',
  'Functions': 'def double(value):\\n    return value * 2\\nprint(double(5))',
  'Recursion': 'def countdown(n):\\n    if n == 0: return\\n    print(n)\\n    countdown(n - 1)\\ncountdown(3)',
  'Exceptions': 'try:\\n    number = int(\"oops\")\\nexcept ValueError:\\n    number = 0\\nprint(number)',
  'Classes & objects': 'class Counter:\\n    def __init__(self): self.value = 0\\n    def increment(self): self.value += 1\\ncounter = Counter()\\ncounter.increment()\\nprint(counter.value)',
  'Testing with unittest': 'import unittest\\ndef add(a, b): return a + b\\nclass AddTests(unittest.TestCase):\\n    def test_sum(self): self.assertEqual(add(2, 3), 5)',
}

const tracks = {
  Python: {
    mark: 'Py', color: 'gold',
    description: '49 guided lessons from Python zero-to-one orientation through testing, concurrency, and a capstone.',
    lessons: pythonTitles.map((title) => makeLesson('Python', title, pythonExplanations[title] || title + ' is introduced with a clear mental model, then connected to a real program. Trace the example, change one input, and observe which state changes and why.', pythonCode[title])),
  },
}

const trackTitles = {
  Go: ['Setup & packages', 'Variables & types', 'Functions & errors', 'Conditionals', 'Loops', 'Arrays & slices', 'Maps', 'Structs & methods', 'Interfaces', 'Pointers', 'Testing', 'Goroutines & channels', 'HTTP services', 'Project design', 'Capstone'],
  JavaScript: ['Values & variables', 'Operators & coercion', 'Functions', 'Arrays & objects', 'Control flow', 'Array methods', 'Scope & closures', 'DOM events', 'Promises & async', 'Errors & debugging', 'Classes', 'Node.js & HTTP', 'Testing', 'Application architecture', 'Capstone'],
  Java: ['Syntax & types', 'Control flow', 'Methods & arrays', 'Classes & objects', 'Inheritance', 'Interfaces', 'Exceptions', 'Collections', 'Generics', 'Streams', 'Files & I/O', 'Testing', 'Concurrency', 'HTTP services', 'Persistence', 'Capstone'],
  Rust: ['Cargo & ownership', 'Variables & mutability', 'Functions', 'Structs & enums', 'Pattern matching', 'Vectors & strings', 'Hash maps', 'Borrowing', 'Lifetimes', 'Traits & generics', 'Error handling', 'Iterators', 'Modules & crates', 'Concurrency', 'Async Rust', 'Testing', 'Web services', 'Capstone'],
  'C++': ['Builds & syntax', 'Types & expressions', 'Control flow', 'Functions', 'Arrays & strings', 'References & pointers', 'Classes', 'Inheritance', 'Templates', 'STL containers', 'Algorithms & iterators', 'Memory management', 'Exceptions', 'Files & streams', 'Concurrency', 'Testing', 'Performance', 'Capstone'],
}

for (const [language, titles] of Object.entries(trackTitles)) {
  tracks[language] = {
    mark: language === 'Java' ? 'J' : language === 'Rust' ? 'Rs' : language === 'C++' ? 'C+' : language === 'Go' ? 'Go' : 'JS',
    color: language === 'Java' ? 'red' : language === 'Rust' ? 'orange' : language === 'C++' ? 'purple' : language === 'Go' ? 'blue' : 'yellow',
    description: titles.length + ' guided lessons covering the language from core syntax to real application patterns.',
    lessons: titles.map((title) => makeLesson(language, title, title + ' is introduced with a clear mental model, then connected to how real ' + language + ' programs use it. Trace the example, change one input, and observe which state changes and why.')),
  }
}

export { tracks }
