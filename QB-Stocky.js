// Make deleteProduct globally available
window.deleteProduct = function(id) {
    const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
    if (confirm('Are you sure you want to delete this product?')) {
        const updatedInventory = inventory.filter(item => item.id !== id);
        localStorage.setItem('inventory', JSON.stringify(updatedInventory));
        window.location.reload(); // Refresh to show updated inventory
    }
};

document.addEventListener('DOMContentLoaded', function() {
    let inventory = JSON.parse(localStorage.getItem('inventory') || '[]');

    const addButton = document.getElementById('addProductBtn');
    const modal = document.getElementById('addProductModal');
    const closeButton = document.getElementById('closeModalBtn');
    const form = document.getElementById('addProductForm');

    // Initialize selects
    populateSelects();
    // Initial display update
    updateInventoryDisplay();

    addButton.addEventListener('click', function() {
        // Reset form when opening the modal for adding a new product
        form.reset();
        delete form.dataset.productId;
        modal.classList.add('active');
    });

    closeButton.addEventListener('click', function() {
        modal.classList.remove('active');
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = {
            id: form.dataset.productId ? parseInt(form.dataset.productId) : Date.now(),
            name: document.getElementById('productName').value,
            quantity: parseInt(document.getElementById('quantity').value),
            unit: document.getElementById('unit').value,
            category: document.getElementById('category').value,
            location: document.getElementById('location').value,
            expirationDate: document.getElementById('expirationDate').value,
            notes: document.getElementById('notes').value,
            trackingNumber: form.dataset.productId ? inventory.find(item => item.id === parseInt(form.dataset.productId)).trackingNumber : `TRK-${Date.now().toString().slice(-6)}`
        };

        if (form.dataset.productId) {
            const index = inventory.findIndex(item => item.id === parseInt(form.dataset.productId));
            inventory[index] = formData;
        } else {
            inventory.push(formData);
        }

        localStorage.setItem('inventory', JSON.stringify(inventory));

        updateInventoryDisplay();
        form.reset();
        delete form.dataset.productId;
        modal.classList.remove('active');
    });

    function updateInventoryDisplay() {
        const grid = document.getElementById('inventoryGrid');
        if (!grid) return;

        const productItems = inventory.map(item => `
            <div class="inventory-item ${new Date(item.expirationDate) < new Date() ? 'expired' : ''} 
                                      ${item.quantity <= 5 ? 'low-stock' : ''}">
                <div class="item-header">
                    <div class="item-title">
                        <h3 class="item-name">${item.name}</h3>
                        <p class="tracking-number">ID: ${item.trackingNumber}</p>
                    </div>
                    <div class="item-actions">
                        <span class="badge ${getStatusBadge(item)}">${getStatus(item)}</span>
                        <button class="edit-button" onclick="editProduct(${item.id})">Edit</button>
                        <button class="delete-button" onclick="deleteProduct(${item.id})">Delete</button>
                    </div>
                </div>
                <div class="item-details">
                    <div class="detail-row">
                        <strong>Quantity:</strong> 
                        <span>${item.quantity} ${item.unit}</span>
                    </div>
                    <div class="detail-row">
                        <strong>Category:</strong> 
                        <span>${item.category}</span>
                    </div>
                    <div class="detail-row">
                        <strong>Location:</strong> 
                        <span>${item.location || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <strong>Expiration:</strong> 
                        <span>${new Date(item.expirationDate).toLocaleDateString()}</span>
                    </div>
                    ${item.notes ? `
                        <div class="detail-row">
                            <strong>Notes:</strong> 
                            <span>${item.notes}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');

        grid.innerHTML = productItems || '<p class="no-items">No products in inventory</p>';
        updateStats();
    }

    function updateStats() {
        const now = new Date();
        const stats = {
            total: inventory.length,
            lowStock: inventory.filter(item => item.quantity <= 5).length,
            expired: inventory.filter(item => new Date(item.expirationDate) < now).length,
            inStock: inventory.filter(item => 
                item.quantity > 5 && new Date(item.expirationDate) > now
            ).length
        };

        Object.keys(stats).forEach(key => {
            const element = document.getElementById(`${key}Items`);
            if (element) element.textContent = stats[key];
        });
    }

    function getStatus(item) {
        if (new Date(item.expirationDate) < new Date()) return 'Expired';
        if (item.quantity <= 5) return 'Low Stock';
        return 'In Stock';
    }

    function getStatusBadge(item) {
        if (new Date(item.expirationDate) < new Date()) return 'badge-danger';
        if (item.quantity <= 5) return 'badge-warning';
        return 'badge-success';
    }

    function populateSelects() {
        const units = ['kg', 'g', 'L', 'mL', 'pieces', 'boxes', 'packs', 'bottles', 'cans', 'units'];
        const unitSelect = document.getElementById('unit');

        if (unitSelect) {
            unitSelect.innerHTML = units.map(unit => 
                `<option value="${unit}">${unit}</option>`
            ).join('');
        }
    }

    function editProduct(id) {
        const product = inventory.find(item => item.id === id);
        if (product) {
            document.getElementById('productName').value = product.name;
            document.getElementById('quantity').value = product.quantity;
            document.getElementById('unit').value = product.unit;
            document.getElementById('category').value = product.category;
            document.getElementById('location').value = product.location;
            document.getElementById('expirationDate').value = product.expirationDate;
            document.getElementById('notes').value = product.notes;

            // Store the product ID in a data attribute on the form
            form.dataset.productId = product.id;

            modal.classList.add('active');
        }
    }
});