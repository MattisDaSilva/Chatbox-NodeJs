function submitForm(event) {
  event.preventDefault();
  const inputValue = document.getElementById('inputName').value;
  window.location.href = `/chat.html?inputValue=${inputValue}`;
}

