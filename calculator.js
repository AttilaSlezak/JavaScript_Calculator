var keys = document.querySelectorAll('#calculator span');
var operators = ['+', '-', 'x', '÷']
var decimalAdded = false;
var input = document.querySelector('.screen');
var factField = document.getElementById('fact');
var radioBtns = document.querySelectorAll('#calculator input');
var disabledBtns = 'ABCDEF';
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
			
			if (equation) {				
				var numSystemBackup;
				if (currentNumSystem != 'decimal') {
					numSystemBackup = currentNumSystem;
					equation = threatNumberSystems('decimal');
				}
				
				input.innerHTML = eval(equation);
				getFact();
				
				if (numSystemBackup) {
					input.innerHTML = threatNumberSystems(numSystemBackup);
					numSystemBackup = '';
				}
				
			}
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

function threatNumberSystems(numsys) {
	var numSystem;
	
	if (typeof numsys === 'string') {
		numSystem = numsys;
	}
	else {
		numSystem = getSelectedRadioBtn('numsystem');
	}
	
	var screen = input.innerHTML
	var numbersAndOperators = [];
	var currentNum = "";
	var resultScreen = "";
	
	for (var i = 0; i < screen.length; i++) {
		if (isNaN(screen[i]) && screen[i] !== '.' && hexaLetters.indexOf(screen[i]) === -1) {
			numbersAndOperators.push(currentNum);
			numbersAndOperators.push(screen[i]);
			currentNum = "";
		}
		else {
			currentNum += screen[i];
		}
	}
	
	if (currentNum) {
		numbersAndOperators.push(currentNum);
	}
		
	for (var i = 0; i < numbersAndOperators.length; i++) {
		var pattern = new RegExp('^[A-F0-9.]+$');
		
		if (!pattern.test(numbersAndOperators[i])) {
			resultScreen += numbersAndOperators[i];
		}
		else {
			if (numSystem === 'binary' && currentNumSystem === 'decimal') {
				resultScreen += changeDecToOther(numbersAndOperators[i], 2);
			}
			else if (numSystem === 'octal' && currentNumSystem === 'decimal') {
				resultScreen += changeDecToOther(numbersAndOperators[i], 8);
			}
			else if (numSystem === 'hexa' && currentNumSystem === 'decimal') {
				resultScreen += changeDecToOther(numbersAndOperators[i], 16);
			}
			else if ((currentNumSystem === 'binary' || currentNumSystem === 'octal' || currentNumSystem === 'hexa') 
				&& numSystem == 'decimal') {
				resultScreen += changeOtherToDec(numbersAndOperators[i]);
			}
			else if ((currentNumSystem === 'octal' && numSystem === 'hexa') 
				|| (currentNumSystem === 'hexa' && numSystem === 'octal')) {
				
				numbersAndOperators[i] = changeInterBinOctHex(numbersAndOperators[i], currentNumSystem);
				currentNumSystem = 'binary';
				resultScreen += changeInterBinOctHex(numbersAndOperators[i], numSystem);
				currentNumSystem = numSystem === 'hexa' ? 'octal' : 'hexa';
			}
			else if (currentNumSystem !== numSystem 
				&& (currentNumSystem === 'binary' || currentNumSystem === 'octal' || currentNumSystem === 'hexa')
				&& (numSystem === 'binary' || numSystem === 'octal' || numSystem === 'hexa')) {
				
				resultScreen += changeInterBinOctHex(numbersAndOperators[i], currentNumSystem === 'binary' ? numSystem : currentNumSystem);
			}
		}
	}
	
	currentNumSystem = numSystem;
	
	if (typeof numsys === 'string') {
		return resultScreen;
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
	else {
		disabledBtns = '';
	}
	input.innerHTML = resultScreen;
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
			if (remainder > 9) {
				result = hexaLetters[remainder - 10] + result;
			}
			else {
				result = remainder + result;
			}
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
				if (intPart > 9) {
					result += hexaLetters[intPart - 10];
				}
				else {
					result += intPart;
				}
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
	var numberOfDigits = numsys === 'hexa' ? 4 : 3;
	number = number.toString();
	
	if (currentNumSystem === 'binary') {
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
				currentNumPartLong = (i * numberOfDigits - (i - 1 - number.indexOf('.'))) % numberOfDigits;
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
	
	else {
		for (var i = 0; i < number.length; i++) {
		
			if (hexaLetters.indexOf(number[i].toString()) > -1) {
				resultPart = hexaLetters.indexOf(number[i]) + 10;
			}
			else {
				resultPart = number[i];
			}

			if (resultPart === '.') {
				result += resultPart;
				continue;
			}
			
			resultPart = changeDecToOther(resultPart, 2);

			while (i > 0 && resultPart.toString().length < numberOfDigits) {
				resultPart = '0' + resultPart;
			}
			
			while (result.indexOf('.') > -1 && i + 1 === number.length && resultPart[resultPart.length - 1] == 0) {
				resultPart = resultPart.substring(0, resultPart.length - 1);
			}
		
			result += resultPart;
		}
	}
	return result;	
}

function changeOtherToDec(number) {
	var result = 0;
	var integer;
	var decimal;
	var numSys;
	
	if (currentNumSystem === 'binary') {
		numSys = 2;
	}
	else if (currentNumSystem === 'octal') {
		numSys = 8;
	}
	else {
		numSys = 16;
	}
	
	if (number.toString().indexOf('.') > -1) {
		number = number.toString();
		integer = number.substr(0, number.indexOf('.'));
		decimal = number.substr(number.indexOf('.') + 1);
	}
	else {
		integer = number;
	}
	
	for (var i = 0; i < integer.length; i++) {
		if (hexaLetters.indexOf(integer[i]) > -1) {
			result += (hexaLetters.indexOf(integer[i]) + 10) * Math.pow(numSys, integer.substr(i).length - 1);
		}
		else {
			result += integer[i] * Math.pow(numSys, integer.substr(i).length - 1);
		}
	}
	
	if (decimal) {
	
		for (var i = 0; i < decimal.length; i++) {
			if (hexaLetters.indexOf(decimal[i]) > -1) {
				result += (hexaLetters.indexOf(decimal[i]) + 10) * Math.pow(numSys, (i + 1) * -1);
			}
			else {
				result += decimal[i] * Math.pow(numSys, (i + 1) * -1);
			}
		}
	} 
	return result;
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
changeDisabledKeyColor();
