var keys = document.querySelectorAll('#calculator span');
var operators = ['+', '-', 'x', '÷']
var decimalAdded = false;
var input = document.querySelector('.screen');
var factField = document.getElementById('fact');
var radioBtns = document.querySelectorAll('#calculator input');
var disabledBtns = '';
var currentNumSystem = 'decimal';
var hexaLetters = ['A', 'B', 'C', 'D', 'E', 'F']

for (var i = 0; i < keys.length; i++) {
	keys[i].onclick = function(e) {
		var inputVal = input.innerHTML;
		var btnVal = this.innerHTML;
				
		if (btnVal == 'C') {
			input.innerHTML = '';
			factField.innerHTML = 'You can read interesting facts about numbers in this field.';
			decimalAdded = false;
		}
		
		else if (btnVal == '=') {
			var equation = inputVal;
			var lastChar = equation[equation.length - 1];
			
			// Replace all instances of x and ÷ with * and / respectively
			equation = equation.replace(/x/g, '*').replace(/÷/g, '/');
			
			// Final thing left to do is checking the last character of the
			// equation. If it's an operator or a decimal, remove it
			if (operators.indexOf(lastChar) > -1 || lastChar == '.')
				equation = equation.replace(/.$/, '');
			
			if (equation)
				input.innerHTML = eval(equation);
				getFact();
			
			decimalAdded = false;
		}
		
		// indexOf works only in IE9+
		else if (operators.indexOf(btnVal) > -1) {
			// Operator is clicked
			// Get the last character from the equation
			var lastChar = inputVal[inputVal.length - 1];
			
			// Only add operator if input is not empty and there is no operator
			// at the last
			if (inputVal != '' && operators.indexOf(lastChar) == -1)
				input.innerHTML += btnVal;
			
			// Allow minus if the string is empty
			else if (inputVal == '' && btnVal == '-')
				input.innerHTML += btnVal;
			
			// Replace the last operator (if exists) with the newly pressed operator
			if (operators.indexOf(lastChar) > -1 && inputVal.length > 1) {
				input.innerHTML = inputVal.replace(/.$/, btnVal);
			}
			
			decimalAdded = false;
		}
		
		else if (btnVal == '.') {
			if (!decimalAdded) {
				input.innerHTML += btnVal;
				decimalAdded = true;
			}
		}
		
		// If any other key is pressed, just append it
		else if (disabledBtns.indexOf(e.target.innerHTML) === -1) {
			input.innerHTML += btnVal;
		}
				
		// Prevent page jumps
		e.preventDefault();
	}
}

var request;

function getFact() {
	var number = input.innerHTML;
	
	if (input.innerHTML.indexOf('.') > -1) {
		factField.innerHTML = "There is not any facts available about decimal numbers.";
		return;
	}
	
	if (window.XMLHttpRequest) {
		request = new XMLHttpRequest();
	}
	else {
		request = new ActiveXObject('Microsoft.XMLHTTP');
	}
	
	request.onreadystatechange = writeFact;
	request.open('GET', 'http://numbersapi.com/' + number + '?json');
	request.send();
}

function writeFact() {
	if (request.readyState == XMLHttpRequest.DONE) {
		if (request.status == 200) {
			var response = request.responseText;
			factField.innerHTML = JSON.parse(response).text;
		}
		else {
			factField.innerHTML = "There is no response from the server...";
		}
	}
	else {
		factField.innerHTML = "Please wait...";
	}
}

for (var i = 0; i < radioBtns.length; i++) {
	if (radioBtns[i].id === 'numsystem') {
		radioBtns[i].onchange = threatNumberSystems;
	}
}

function getSelectedRadioBtn(whichGroup) {
	for (var i = 0; i < radioBtns.length; i++) {
		if (radioBtns[i].checked) {
			if (whichGroup === radioBtns[i].id) {
				return radioBtns[i].value;
			}			
		}
	}
}

function threatNumberSystems() {
	var numSystem = getSelectedRadioBtn('numsystem');
	var screen = input.innerHTML
	var numbersAndOperators = [];
	var currentNum = "";
	var resultScreen = "";
	
	for (var i = 0; i < screen.length; i++) {
		if (isNaN(screen[i]) && screen[i] !== '.') {
			numbersAndOperators.push(Number(currentNum));
			numbersAndOperators.push(screen[i]);
			currentNum = "";
		}
		else {
			currentNum += screen[i];
		}
	}
	
	if (currentNum) {
		numbersAndOperators.push(Number(currentNum));
	}
		
	for (var i = 0; i < numbersAndOperators.length; i++) {
		if (isNaN(numbersAndOperators[i])) {
			resultScreen += numbersAndOperators[i];
		}
		else {
			if (numSystem === 'binary' && currentNumSystem === 'decimal') {
				resultScreen += changeDecToOther(numbersAndOperators[i], 2);
			}
			else if (numSystem === 'octal' && currentNumSystem === 'decimal') {
				resultScreen += changeDecToOther(numbersAndOperators[i], 8);
			}
			else if (currentNumSystem !== numSystem 
				&& (currentNumSystem === 'binary' || currentNumSystem === 'octal' || currentNumSystem === 'hexa')
				&& (numSystem === 'binary' || numSystem === 'octal' || numSystem === 'hexa')) {
				
				resultScreen += changeInterBinOctHex(numbersAndOperators[i], numSystem);
			}
		}
	}
	
	if (numSystem === 'binary') {
		disabledBtns = '23456789ABCDEF';
	}
	else if (numSystem === 'octal') {
		disabledBtns = '89ABCDEF';
	}
	else if (numSystem === 'decimal') {
		disabledBtns = 'ABCDEF';
	}
	input.innerHTML = resultScreen;
	currentNumSystem = numSystem;
	changeDisabledKeyColor();
}

function changeDecToOther(number, numsys) {
	var result = "";
	var integer;
	var decimal;
	
	if (number.toString().indexOf('.') > -1) {
		number = number.toString();
		integer = Number(number.substr(0, number.indexOf('.')));
		decimal = Number('0.' + number.substr(number.indexOf('.') + 1));
	}
	else {
		integer = number;
	}
	
	while (integer != 0) {
		if (integer % numsys > 0) {
			var remainder = integer % numsys
			result = remainder + result;
			integer = (integer - remainder) / numsys;
		}
		else {
			result = '0' + result;
			integer = integer / numsys;
		}
	}
	
	if (decimal) {
		result += ".";
		
		while (decimal != 0) {
			decimal *= numsys;
			if (decimal >= 1) {
				var intPart = decimal.toString().substring(0, decimal.toString().indexOf('.'));
				if (!intPart) {
					intPart = decimal;
				}
				result += intPart;
				decimal -= intPart;
			}
			else {
				result += '0';
			}
		}
	}
	return result;
}

function changeInterBinOctHex(number, numsys) {
	var result = '';
	var resultPart = 0;
	var numberOfDigits;
	number = number.toString();
	
	if (currentNumSystem === 'binary') {
		numberOfDigits = numsys === 'hexa' ? 4 : 3;
		var currentNumPartLong;
		
		for (var i = 0; i < number.length; i++) {
			if (number[i] === '.') {
				if (resultPart > 9) {
					result += hexaLetters[resultPart - 10];
				}
				else {
					result += resultPart;
				}
				resultPart = 0;
				result += '.';
				continue;
			}
			else if (number.indexOf('.') > -1 && number.indexOf('.') < i) {
				currentNumPartLong = (numberOfDigits - (i - 1 - number.indexOf('.'))) % numberOfDigits;
			}
			else if (number.indexOf('.') > -1) {
				currentNumPartLong = number.substring(i, number.indexOf('.')).length % numberOfDigits;
			}			
			else {
				currentNumPartLong = number.substr(i).length % numberOfDigits;
			}
			
			if (currentNumPartLong === 0) {
				if (resultPart > 9) {
					result += hexaLetters[resultPart - 10];
				}
				else if (result && result[result.length - 1] !== '.' || resultPart) {
					result += resultPart;
				}
				resultPart = 0;
				if (number[i] === '1') {
					resultPart += Math.pow(2, numberOfDigits - 1);
				}
			}
			else if (number[i] === '1') {
				resultPart += Math.pow(2, currentNumPartLong - 1);
			}
		}
		if (resultPart > 9) {
			result += hexaLetters[resultPart - 10];
		}
		else {
			result += resultPart;
		}
	}
	return result;	
}

function changeOtherToDec(number) {
	
}

function changeDisabledKeyColor() {
	for (var i = 0; i < keys.length; i++) {
		if (disabledBtns.indexOf(keys[i].innerHTML) > -1 && keys[i].id !== 'clear') {
			keys[i].style.backgroundColor = '#AAA';
		}
		else if ('0123456789ABCDEF'.indexOf(keys[i].innerHTML) > -1 && keys[i].id !== 'clear') {
			keys[i].style = null;
		}
	}	
}
