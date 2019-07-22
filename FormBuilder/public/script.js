function load() {
    document.getElementById('addTextForm').style.display = 'none';
}
function addText()
{
    document.getElementById('addTextForm').style.display = 'inline';
}
function addTextForm() {
    var question = document.getElementById('question').value;
    var newTextBox = document.createElement('div');
    newTextBox.innerHTML = question + "<br><input type='text'>";
    document.getElementById("form").appendChild(newTextBox);
}