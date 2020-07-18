const displayAreaP = document.querySelector('.display').firstElementChild;
const buttons = document.querySelectorAll('.button');
const dotButton = document.querySelector('#dot');

const infixStack = [];
const postfixStack = [];
let displayText = "";

let dotIsEnabled = true;
const infixExpressionHist = []

buttons.forEach(button => {
    button.addEventListener('click',pressButton);
    button.addEventListener('mousedown', mouseDownButton);
    button.addEventListener('mouseup', mouseUpButton);
});

function pressButton(e){
    if(displayText==="Invalid Expression" || displayText==="Div by zero error!"){
        displayText=""; updateDisplay();
    }
    const val = e.target.value;
    if(val==="<==") removeLastFromDisplay();
    else if(val==="C") clearCalculator();
    else if(val==="=") evaluateExpression();
    else if(val===".") appendDot();
    else addToDisplay(val);
}


function add(a,b){return (a+b);}
function subtract(a,b){return (a-b);}
function multiply(a,b){return (a*b);}
function divide(a,b){
    if(b===0) throw "Div by zero!";
    return (a/b);
}
function power(a,b) {return (a**b);}

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
            try{
                result = divide(a,b);
                break;
            }catch(e){
                // handleDivByZero();
                return;
            }
        case "^":
            result = power(a,b);
            break;
        default:
            throw "Invalid Operator";
    }
    if((result%1).toString(10).length>7) return result.toFixed(6);
    return result;
}

function clearCalculator(){
    infixExpressionHist.push(infixStack.join(""));
    infixStack.length = 0;
    postfixStack.length = 0;
    displayText = "";
    updateDisplay();
    enableDotButton();
}

function removeLastFromDisplay(){
    if(displayText!=""){
        let toBeRemoved = displayText.slice(-1);
        displayText = displayText.slice(0,-1);
        removeFromInfixStack(toBeRemoved);
        updateDisplay();
        checkDotSituation(toBeRemoved);
    }
}

function removeFromInfixStack(toBeRemoved){
    const lastIndex = infixStack.length-1;
    if(infixStack[lastIndex]===toBeRemoved) 
        infixStack.pop();
    else 
        infixStack[lastIndex] = infixStack[lastIndex].slice(0,-1);
}

function checkDotSituation(toBeRemoved){
    if(toBeRemoved==='.') enableDotButton();
    else if(dotIsEnabled && lastElmntContainsDot()) disableDotButton();
}

function lastElmntContainsDot(){
    let last = infixStack[infixStack.length-1];
    if(last!==undefined)
        return last.includes('.');
    else return false;
}

function addToDisplay(elmnt){

    if(dotIsEnabled && isOperator(elmnt)){
        if(!infixStackIsEmpty()&&lastElmntIsOperator())
            replaceLastElmntWith(elmnt);
        else
            appendToDisplay(elmnt);
    }else if(dotIsEnabled) appendToDisplay(elmnt);
    else{//IF DOT is Disabled
        addWhileDotIsDisabled(elmnt);
    }
}

function replaceLastElmntWith(elmnt){
    infixStack[infixStack.length-1] = elmnt;
    displayText = displayText.slice(0,-1) + elmnt;
    updateDisplay();
}

function appendToDisplay(elmnt){
    displayText += elmnt;
    addToInfixStack(elmnt);
    updateDisplay();
}

function addToInfixStack(elmnt){

    const lastIndex = infixStack.length-1;
    if(Number.isNaN(+infixStack[lastIndex]) || Number.isNaN(+elmnt))
        infixStack.push(elmnt);
    else
         infixStack[lastIndex] += elmnt;
}

function addWhileDotIsDisabled(elmnt){
    if(lastElmntIsDot() && isNumber(elmnt))
        appendFloatDigit(elmnt);
    else if(!lastElmntIsDot()){
        if(isOperator(elmnt)){
            enableDotButton();
            mergeDotPart();
            appendToDisplay(elmnt);
        }else if(!isOperator(elmnt) && isNumber())
            appendFloatDigit(elmnt);
        else
            appendToDisplay(elmnt);
    }
}

function lastElmntIsDot(){
    return infixStack[infixStack.length-1] === '.';
}

function appendDot(){
    disableDotButton();
    if(infixStackIsEmpty()) appendToDisplay('0');
    appendToDisplay('.');
}

function appendFloatDigit(elmnt){
    if(lastElmntIsDot())
        replaceLastElmntWith(infixStack[infixStack.length-1] + elmnt)
    
}

function mergeDotPart(){
    if(!dotPartIsMerged()){
        let floatPart = infixStack.pop();
        infixStack[infixStack.length-1] += floatPart;
    }
}

function dotPartIsMerged(){
    let lastElmnt = infixStack[infixStack.length-1];
    return !(isNumber(infixStack[infixStack.length-2]) && !isInt(lastElmnt));
}

function updateDisplay(){
    displayAreaP.textContent = displayText;
}

function isOperator(elmnt){
    return (elmnt==='+' || elmnt==='-' ||
            elmnt==='*' || elmnt==='/' || elmnt==='^' );
}

function lastElmntIsOperator(){
    if(displayText!=="") 
        return isOperator(displayText.slice(-1));
    return -1;
}

function evaluateExpression(){
    if(!dotIsEnabled) mergeDotPart();
    let result;
    try{
        convertInfixToPostfix();
        result = evaluatePostfixExprs();
        clearCalculator();
        displayText = result.toString(10);
        infixStack.push(result.toString(10));
    }catch(e){
        clearCalculator();
        if(e instanceof TypeError)
            displayText = "Div by zero error!";
        else
            displayText = "Invalid Expression";
    }
    updateDisplay();
    if(!isInt(+result)) disableDotButton();
}

 function isInt(n) {
    return n === +n && n === (n|0);
}


//MAY THROW EXCEPTION
function evaluatePostfixExprs(){
    const stack = [];
    for(elmnt of postfixStack){
        if(isNumber(elmnt)) stack.push(elmnt);
        else{//there must be at least 2 operans for the operator
            if(stack.length<2) throw "Invalid Expression";
            else{
                let num2 = stack.pop();
                let num1 = stack.pop();
                let result = operate(elmnt,+num1,+num2);
                stack.push(result);
            }
        }
    }
    return stack.pop();
}

function convertInfixToPostfix(){
    let stack = [];
    stack.push('(');
    infixStack.push(')');
    for(let elmnt of infixStack){
        if(isNumber(elmnt)) postfixStack.push(elmnt);
        else if(elmnt==='(') stack.push(elmnt); 
        else if(elmnt!==')'){
            let e = stack.pop();
            while(e!=='(' && e!==')' && precedenceOf(e)>=precedenceOf(elmnt)){
                postfixStack.push(e);
                e = stack.pop();
            }
            stack.push(e);
            stack.push(elmnt);
        }
        else if(elmnt===')'){
            let e = stack.pop();
            while(e!=='('){
                postfixStack.push(e);
                e=stack.pop();
            }
        }else {throw "Invalid Expression";}
    }
}

function precedenceOf(symbol){
    if(symbol==='^') return 3;
    else if(symbol==='*' || symbol==='/') return 2;
    else if(symbol==='+'||symbol==='-') return 1;
    else return 0;
}

function enableDotButton(){
    dotIsEnabled = true;
    dotButton.classList.remove('dot-button-disabled')
}

function disableDotButton(){
    dotIsEnabled = false;
    dotButton.classList.add('dot-button-disabled')
}

function isNumber(elmnt){return !Number.isNaN(+elmnt);}

function infixStackIsEmpty(){return infixStack.length === 0;}

function mouseDownButton(e){
    e.target.classList.add('button-mousedown');
}

function mouseUpButton(e){
    e.target.classList.remove('button-mousedown');
}