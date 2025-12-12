const API_URL = '/api';

console.log('🚀 Frontend running');
console.log('📡 Connecting to backend at', API_URL);

let characters = [];
let vehicles = [];

// Load characters and vehicles on page load
async function loadData() {
    try {
        const [charsResponse, vehiclesResponse] = await Promise.all([
            fetch(`${API_URL}/characters`),
            fetch(`${API_URL}/vehicles`)
        ]);

        characters = await charsResponse.json();
        vehicles = await vehiclesResponse.json();

        updateItemSelect();
    } catch (error) {
        showError('Failed to load data from server. Please make sure the backend is running.');
    }
}

// Update item select based on type
function updateItemSelect() {
    const type = document.getElementById('type').value;
    const itemSelect = document.getElementById('item');
    const items = type === 'character' ? characters : vehicles;

    itemSelect.innerHTML = '<option value="">-- Select a ' + type + ' --</option>';
    
    // Sort items alphabetically by name
    const sortedItems = [...items].sort((a, b) => a.name.localeCompare(b.name));
    
    sortedItems.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = `${item.name}${item.world ? ' (' + item.world + ')' : ''}`;
        itemSelect.appendChild(option);
    });
}

// Handle form submission
async function handleSubmit(event) {
    event.preventDefault();

    const uid = document.getElementById('uid').value.trim().replace(/\s+/g, '');
    const characterId = document.getElementById('item').value;
    const type = document.getElementById('type').value;

    if (!uid || !characterId) {
        showError('Please fill in all fields');
        return;
    }

    // Hide previous results and errors
    document.getElementById('result').classList.add('hidden');
    document.getElementById('error').classList.add('hidden');

    try {
        const response = await fetch(`${API_URL}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ uid, characterId, type })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate tag data');
        }

        const data = await response.json();
        displayResult(data);
    } catch (error) {
        showError(error.message);
    }
}

// Display the generated tag data
function displayResult(data) {
    document.getElementById('itemName').textContent = data.name;
    
    // Try to load and display image
    const itemImage = document.getElementById('itemImage');
    const characterBlocks = document.getElementById('characterBlocks');
    const vehicleBlocks = document.getElementById('vehicleBlocks');
    
    // Extract ID from the request (we need to get it from the form)
    const itemId = document.getElementById('item').value;
    itemImage.src = `images/${itemId}.png`;
    itemImage.alt = data.name;
    
    // Show image if it loads, hide if it fails
    itemImage.onload = () => {
        itemImage.classList.add('visible');
    };
    itemImage.onerror = () => {
        itemImage.classList.remove('visible');
    };
    
    if (data.type === 'character') {
        // Characters: Pages 36, 37, 43
        document.getElementById('char1').textContent = data.charPart1;
        document.getElementById('char2').textContent = data.charPart2;
        document.getElementById('char3').textContent = data.charPart3;
        document.getElementById('char4').textContent = data.charPart4;
        document.getElementById('pwd1').textContent = data.pwdPart1;
        document.getElementById('pwd2').textContent = data.pwdPart2;
        characterBlocks.classList.remove('hidden');
        vehicleBlocks.classList.add('hidden');
    } else {
        // Vehicles: Page 36 (code), 38 (flag), 43 (password)
        const code = data.vehicleCode || '';
        document.getElementById('veh-code1').textContent = code.substring(0, 4);
        document.getElementById('veh-code2').textContent = code.substring(4, 8);
        document.getElementById('veh-flag1').textContent = data.vehicleFlag.substring(0, 4);
        document.getElementById('veh-flag2').textContent = data.vehicleFlag.substring(4, 8);
        document.getElementById('veh-pwd1').textContent = data.pwdPart1;
        document.getElementById('veh-pwd2').textContent = data.pwdPart2;
        characterBlocks.classList.add('hidden');
        vehicleBlocks.classList.remove('hidden');
    }

    document.getElementById('result').classList.remove('hidden');
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadData();

    document.getElementById('type').addEventListener('change', updateItemSelect);
    document.getElementById('tagForm').addEventListener('submit', handleSubmit);
    
    // Format and validate UID input
    const uidInput = document.getElementById('uid');
    uidInput.addEventListener('input', (e) => {
        // Remove spaces and non-hex characters, convert to uppercase
        let value = e.target.value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
        
        // Limit to 14 characters (12 hex + potential spaces)
        if (value.length > 14) {
            value = value.substring(0, 14);
        }
        
        // Format with spaces every 4 characters
        let formatted = value.match(/.{1,4}/g)?.join(' ') || value;
        e.target.value = formatted;
        
        // Validate length (should be exactly 14 hex characters)
        const hexOnly = value.replace(/\s+/g, '');
        if (hexOnly.length === 12) {
            uidInput.style.borderColor = 'var(--success-color)';
            uidInput.style.boxShadow = '0 0 0 2px rgba(76, 175, 80, 0.2)';
        } else if (hexOnly.length > 0) {
            uidInput.style.borderColor = 'var(--error-color)';
            uidInput.style.boxShadow = '0 0 0 2px rgba(244, 67, 54, 0.2)';
        } else {
            uidInput.style.borderColor = '';
            uidInput.style.boxShadow = '';
        }
    });
    
    uidInput.addEventListener('blur', () => {
        const hexOnly = uidInput.value.replace(/\s+/g, '');
        if (hexOnly.length > 0 && hexOnly.length !== 14) {
            uidInput.style.borderColor = 'var(--error-color)';
        }
    });
});
