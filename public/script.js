function createTable() {
  fetch('/createTable')
    .then(res => res.text())
    .then(data => displayResult(data));
}

function addItem() {
  Swal.fire({
    title: 'Add Item',
    input: 'text',
    inputLabel: 'Item name',
    inputPlaceholder: 'Enter name...',
    showCancelButton: true
  }).then(result => {
    if (result.isConfirmed && result.value) {
      fetch('/addItem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: result.value })
      })
        .then(res => res.text())
        .then(data => displayResult(data));
    }
  });
}

function getItems() {
  fetch('/getItems')
    .then(res => res.json())
    .then(data => {
      if (!data.length) return displayResult("No items found.");
      const result = data.map(item =>
        `🔹 ID: ${item.id} | Name: ${item.name}`
      ).join("\n");
      displayResult(result);
    });
}

function updateItem() {
  Swal.fire({
    title: 'Update Item',
    html:
      '<input id="id" class="swal2-input" placeholder="Item ID">' +
      '<input id="name" class="swal2-input" placeholder="New name">',
    focusConfirm: false,
    showCancelButton: true,
    preConfirm: () => {
      const id = document.getElementById('id').value;
      const name = document.getElementById('name').value;
      return { id, name };
    }
  }).then(result => {
    if (result.isConfirmed) {
      fetch(`/updateItem/${result.value.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: result.value.name })
      })
        .then(res => res.text())
        .then(data => displayResult(data));
    }
  });
}

function deleteItem() {
  Swal.fire({
    title: 'Delete Item',
    input: 'number',
    inputLabel: 'Enter item ID to delete:',
    showCancelButton: true
  }).then(result => {
    if (result.isConfirmed && result.value) {
      fetch(`/deleteItem/${result.value}`, {
        method: 'DELETE'
      })
        .then(res => res.text())
        .then(data => displayResult(data));
    }
  });
}

function clearItems() {
  Swal.fire({
    title: 'Are you sure?',
    text: "This will delete ALL items!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Yes, delete all!'
  }).then(result => {
    if (result.isConfirmed) {
      fetch('/clearItems', {
        method: 'DELETE'
      })
        .then(res => res.text())
        .then(data => displayResult(data));
    }
  });
}

function displayResult(content) {
  document.getElementById('result').innerText = content;
}

