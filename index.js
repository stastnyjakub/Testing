console.log("Hello, World!");

function add(a, b) {
    return a + b;
}

function subtract(a, b) {
    return a - b;
}

function multiply(a, b) {
    return a * b;
}

function divide(a, b) {
    if (b === 0) {
        throw new Error("Division by zero");
    }
    return a / b;
}

for (let i = 0; i < 10; i++) {
    console.log(`Iteration ${i}: ${add(i, 2)}`);
}

const numbers = [1, 2, 3, 4, 5];
const squared = numbers.map(num => multiply(num, num));
console.log("Squared numbers:", squared);

const result = divide(10, 2);
console.log("10 divided by 2 is:", result);