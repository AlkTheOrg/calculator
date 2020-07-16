
const infixStack = [];
const postfixStack = [];
let expressionIsEvaluated = false;
let dotIsPressed = false;

function add(a,b){return a+b;}
function subtract(a,b){return a-b;}
function multiply(a,b){return a*b;}
function divide(a,b){return a/b;} //div by zero!
function power(a,b) {return a**b;}

function operate(operator,a,b){
    let result = 0;
    switch(operator){
        case "+":
            result = add(a,b);
            break;
        case "-":
            result = subtract(a,b);
            break;
        case "*":
            result = multiply(a,b);
            break;
        case "/":
            result = divide(a,b);
            break;
        default:
            throw "Invalid Operator";
    }
    return result;
}

function convertInfixToPostfix(){
    for(let elmnt of infixStack){
        
    }
}
