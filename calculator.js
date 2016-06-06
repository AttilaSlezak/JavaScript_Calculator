// Get all the keys from document
var keys = document.querySelectorAll('#calculator span');
var operators = ['+', '-', 'x', '÷']
var decimalAdded = false;
var input = document.querySelector('.screen');
var factField = document.getElementById('fact');

// Add onclick event to all the keys and perform operations
for (var i = 0; i < keys.length; i++) {
	keys[i].onclick = function(e) {
		// Get the input and button values
		//var input = document.querySelector('.screen');
		var inputVal = input.innerHTML;
		var btnVal = this.innerHTML;
		
		// Now, just append the key values (btnValue) to the input string and
		//finally use javascript's eval function to get the result
		
		// If clear key is pressed, erase everything
		if (btnVal == 'C') {
			input.innerHTML = '';
			factField.innerHTML = 'You can read interesting facts about numbers in this field.';
			decimalAdded = false;
		}
		
		// If eval key is pressed, calculate and display the result
		else if (btnVal == '=') {
			var equation = inputVal;
			var lastChar = equation[equation.length - 1];
			
			// Replace all instances of x and ÷ with * and / respectively. This
			// can be done easily using regex and the 'g' tag which will replace all
			// instances of the matched characters/substring
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
		
		// Basic functionality of the calculator is complete. But there are
		// some problems like
		// 1. No two operators should be added consecutively
		// 2. The equation shouldn't start from an operator except minus
		// 3. Not more than 1 decimal should be there in a number
		
		// We'll fix these issues using some simple checks
		
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
				// Here '.' matches any characters while $ denotes the end of
				// string, so anything (will be an operator in this case) at the end of string
				// will get replaced by new operator
				input.innerHTML = inputVal.replace(/.$/, btnVal);
			}
			
			decimalAdded = false;
		}
		
		// Now only the decimal problem is left. We can solve it easily using a flag
		// 'decimalAdded' which we'll set once the decimal is added and prevent
		// more decimal to be added once it's set. It will be reset when an operator,
		// eval or clear key is pressed.
		else if (btnVal == '.') {
			if (!decimalAdded) {
				input.innerHTML += btnVal;
				decimalAdded = true;
			}
		}
		
		// If any other key is pressed, just append it
		else {
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