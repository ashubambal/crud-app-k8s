function createTable() {
    fetch('/createTable')
        .then(res => res.text())
        .then(data => document.getElementById('result').innerText = data);
}

function addItem() {
    const name = prompt('Enter item name:');
    if (!name) return;
    fetch('/addItem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    })
        .then(res => res.text())
        .then(data => document.getElementById('result').innerText = data);
}

function getItems() {
    fetch('/getItems')
        .then(res => res.json())
        .then(data => {
            const resultDiv = document.getElementById('result');
            if (!data.length) {
                resultDiv.innerHTML = "No items found.";
                return;
            }
            resultDiv.innerHTML = data.map(item =>
                `ID: ${item.id} | Name: ${item.name}`
            ).join("\n");
        });
}

function updateItem() {
    const id = prompt('Enter item ID to update:');
    const name = prompt('Enter new item name:');
    if (!id || !name) return;
    fetch(`/updateItem/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    })
        .then(res => res.text())
        .then(data => document.getElementById('result').innerText = data);
}

function deleteItem() {
    const id = prompt('Enter item ID to delete:');
    if (!id) return;
    fetch(`/deleteItem/${id}`, { method: 'DELETE' })
        .then(res => res.text())
        .then(data => document.getElementById('result').innerText = data);
}

