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

const makeLesson = (language, title, explanation, code = exampleCode[language]) => {
  const normalizedCode = code.replaceAll('\\n', '\n')
  return {
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
    starter: normalizedCode,
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
  code: normalizedCode,
  objectives: [
    'Explain the core idea in your own words.',
    'Trace the example one state change at a time.',
    'Modify the example and predict the new output.',
  ],
  }
}

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

Object.assign(pythonExplanations, {
  'Booleans & comparisons': 'Comparisons produce True or False, which conditions use to decide what to do next.',
  'Input & output': 'input returns text from a person; convert it when you need a number, then print a useful response.',
  'Conversions & formatting': 'Functions such as int and str change a value into the type an operation needs, while f-strings make output readable.',
  'Truthiness & guard clauses': 'Empty collections, zero, None, and False are false-like. A guard clause handles a missing value before the main work.',
  'break, continue & pass': 'break ends a loop, continue skips its current iteration, and pass intentionally leaves a block empty.',
  'Nested loops': 'For every outer value, Python completes the full inner loop before advancing the outer loop.',
  'Lists': 'Lists are ordered and mutable, so you can read or replace one item by its zero-based index.',
  'List methods': 'Methods such as append and pop add or remove items while keeping the list as one shared object.',
  'Slicing sequences': 'A slice selects a range of a sequence without changing the original; its end position is excluded.',
  'List comprehensions': 'A comprehension is a compact loop that creates a new list from each source value.',
  'Tuples & unpacking': 'Tuples keep an ordered group of values fixed, and unpacking gives each position a descriptive name.',
  'Dictionaries': 'Dictionaries store values under meaningful keys, which makes records easier to read than positional lists.',
  'Sets': 'Sets store unique values and support operations such as intersection for finding shared members.',
  'Dictionary & set comprehensions': 'Comprehensions can build dictionaries and sets directly from a transformation loop.',
  'Parameters & return values': 'Parameters give a function input and return sends its computed result back to the caller.',
  'Lambda, sorted & key functions': 'A lambda is a small unnamed function, often used as the key that tells sorted how to compare values.',
  'Iterators & generators': 'A generator yields one result at a time, so a program can process a sequence without building it all at once.',
  'Custom exceptions & validation': 'Raise a clear exception when input breaks a rule, keeping invalid data out of the rest of the program.',
  'CSV & JSON data': 'CSV represents rows and columns; JSON represents nested data. Python can convert both into normal values.',
  'Modules & imports': 'Imports make names from another module available so you can reuse tested functionality.',
  'Packages & virtual environments': 'Packages group modules, while virtual environments isolate one project’s installed dependencies.',
  'Inheritance & composition': 'Inheritance specializes a class; composition builds an object from other objects with separate responsibilities.',
  'Dataclasses & properties': 'Dataclasses reduce boilerplate for data-focused classes, while properties control access to an attribute.',
  'Dunder methods & protocols': 'Double-underscore methods let an object work with Python operations such as print, iteration, and comparison.',
  'Type hints': 'Type hints document expected inputs and return values so people and tools can catch mismatches earlier.',
  'Debugging & logging': 'Logging records useful program events without leaving permanent print calls in the program logic.',
  'Regular expressions': 'Regular expressions describe text patterns for searching, extracting, and validating text.',
  'Dates & time': 'datetime values represent dates and times safely, without relying on fragile string arithmetic.',
  'Command-line programs': 'Command-line arguments configure a program when it starts; argparse provides names, defaults, and help text.',
  'Concurrency with threading': 'Threads can overlap independent waiting tasks, but shared state needs deliberate coordination.',
  'Performance & complexity': 'Performance depends on how work grows with input; a set can make membership checks much faster than a list.',
  'Capstone: build a CLI tracker': 'The capstone combines functions, structured data, validation, persistence, and a clear command-line interface.',
})

Object.assign(pythonCode, {
  'Booleans & comparisons': 'score = 82\npassed = score >= 60\nprint(passed)', 'Input & output': 'name = "Mina"\nprint(f"Hello, {name}!")',
  'Conversions & formatting': 'age = int("24")\nprint(f"Next year: {age + 1}")', 'Truthiness & guard clauses': 'items = []\nif not items:\n    print("Nothing to process")',
  'break, continue & pass': 'for number in range(5):\n    if number == 2:\n        continue\n    print(number)', 'Nested loops': 'for row in ["A", "B"]:\n    for seat in [1, 2]:\n        print(row, seat)',
  'Lists': 'colors = ["red", "blue"]\ncolors[1] = "gold"\nprint(colors)', 'List methods': 'tasks = ["read"]\ntasks.append("practice")\nprint(tasks.pop())',
  'Slicing sequences': 'word = "Focus"\nprint(word[1:4])', 'List comprehensions': 'numbers = [1, 2, 3]\nprint([number ** 2 for number in numbers])',
  'Tuples & unpacking': 'point = (10, 20)\nx, y = point\nprint(x + y)', 'Dictionaries': 'student = {"name": "Ada", "score": 8}\nstudent["score"] += 2\nprint(student["score"])',
  'Sets': 'first = {"Ada", "Mina"}\nsecond = {"Mina", "Kai"}\nprint(first & second)', 'Dictionary & set comprehensions': 'scores = {"Ada": 4, "Mina": 7}\nprint({name: score * 2 for name, score in scores.items()})',
  'Parameters & return values': 'def welcome(name, greeting="Hello"):\n    return f"{greeting}, {name}"\nprint(welcome("Mina"))', 'Lambda, sorted & key functions': 'names = ["Ada", "Mina", "Bo"]\nprint(sorted(names, key=lambda name: len(name)))',
  'Iterators & generators': 'def countdown(start):\n    while start:\n        yield start\n        start -= 1\nprint(list(countdown(3)))', 'Custom exceptions & validation': 'def require_positive(value):\n    if value <= 0: raise ValueError("positive only")\n    return value\nprint(require_positive(3))',
  'CSV & JSON data': 'import json\nrecord = {"name": "Ada", "score": 10}\nprint(json.dumps(record))', 'Modules & imports': 'import math\nprint(math.sqrt(81))',
  'Packages & virtual environments': 'from pathlib import Path\nprint(Path("notes.txt").suffix)', 'Inheritance & composition': 'class Animal:\n    def speak(self): return "sound"\nclass Dog(Animal):\n    def speak(self): return "woof"\nprint(Dog().speak())',
  'Dataclasses & properties': 'from dataclasses import dataclass\n@dataclass\nclass Student:\n    name: str\nprint(Student("Ada").name)', 'Dunder methods & protocols': 'class Score:\n    def __init__(self, value): self.value = value\n    def __str__(self): return f"Score: {self.value}"\nprint(Score(10))',
  'Type hints': 'def add(left: int, right: int) -> int:\n    return left + right\nprint(add(2, 3))', 'Debugging & logging': 'import logging\nlogging.basicConfig(level=logging.INFO)\nlogging.info("Starting")\nprint(2 + 3)',
  'Regular expressions': 'import re\nprint(re.findall(r"\\d+", "Order 42"))', 'Dates & time': 'from datetime import date\nprint(date(2026, 9, 15).isoformat())',
  'Command-line programs': 'import argparse\nparser = argparse.ArgumentParser()\nparser.add_argument("--name", default="Learner")\nprint(parser.parse_args([]).name)', 'Concurrency with threading': 'from threading import Thread\ndef greet(): print("Hello")\nworker = Thread(target=greet)\nworker.start()\nworker.join()',
  'Performance & complexity': 'seen = {"Ada", "Mina"}\nprint("Mina" in seen)', 'Capstone: build a CLI tracker': 'tasks = [{"title": "Trace code", "done": False}]\ntasks[0]["done"] = True\nprint(tasks)',
})

Object.assign(pythonCode, {
  'Numbers & arithmetic': 'price = 12\nquantity = 3\ntotal = price * quantity\nprint(total)',
  'Strings & text': 'first = "Focus"\nmessage = first.upper() + " helps"\nprint(message)',
  'While loops': 'count = 3\nwhile count > 0:\n    print(count)\n    count -= 1',
  'Scope & namespaces': 'message = "outside"\ndef show_message():\n    message = "inside"\n    print(message)\nshow_message()\nprint(message)',
  'Files & paths': 'from pathlib import Path\npath = Path("notes.txt")\nprint(path.name)',
  'Async programming': 'import asyncio\nasync def greet():\n    await asyncio.sleep(0)\n    return "Hello"\nprint(asyncio.run(greet()))',
})

const tracks = {
  Python: {
    mark: 'Py', color: 'gold',
    description: '50 guided lessons across Python foundations, core language skills, intermediate tools, advanced practices, and a real-world capstone.',
    levels: [
      { title: 'Level 1 · Python Foundations', start: 0, end: 12, checkpoint: 'Checkpoint: combine values, types, input, operators, and conditions.' },
      { title: 'Level 2 · Core Python', start: 12, end: 31, checkpoint: 'Checkpoint: build a small grade-book with a loop, a data structure, and a function.' },
      { title: 'Level 3 · Intermediate Python', start: 31, end: 41, checkpoint: 'Checkpoint: build a persistent contact book with JSON, files, exceptions, and a class.' },
      { title: 'Level 4 · Advanced Python', start: 41, end: 49, checkpoint: 'Checkpoint: create a typed CLI tool that handles errors and records useful logs.' },
      { title: 'Level 5 · Real-World Python', start: 49, end: 50, checkpoint: 'Capstone: turn the CLI tracker into a portfolio-ready project.' },
    ],
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
