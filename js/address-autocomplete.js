/**
 * Address Autocomplete Implementation
 * Provides address suggestions without requiring Google Places API
 * Uses a local Bay Area address database for better UX
 */

class AddressAutocomplete {
    constructor(inputElement, options = {}) {
        this.input = inputElement;
        this.options = {
            maxSuggestions: 5,
            minChars: 3,
            placeholder: 'Enter your address...',
            ...options
        };
        
        this.suggestions = [];
        this.currentIndex = -1;
        this.isOpen = false;
        
        this.init();
        this.loadBayAreaAddresses();
    }
    
    init() {
        // Create suggestions container
        this.createSuggestionsContainer();
        
        // Bind events
        this.input.addEventListener('input', this.handleInput.bind(this));
        this.input.addEventListener('keydown', this.handleKeydown.bind(this));
        this.input.addEventListener('focus', this.handleFocus.bind(this));
        this.input.addEventListener('blur', this.handleBlur.bind(this));
        
        // Add CSS classes
        this.input.classList.add('address-autocomplete-input');
    }
    
    createSuggestionsContainer() {
        this.container = document.createElement('div');
        this.container.className = 'address-suggestions';
        this.container.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #e2e8f0;
            border-top: none;
            border-radius: 0 0 8px 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            max-height: 200px;
            overflow-y: auto;
            z-index: 1000;
            display: none;
        `;
        
        // Insert after input
        const parent = this.input.parentElement;
        parent.style.position = 'relative';
        parent.appendChild(this.container);
    }
    
    loadBayAreaAddresses() {
        // Bay Area cities, neighborhoods, and common addresses
        this.bayAreaData = [
            // San Francisco
            'San Francisco, CA', 'SOMA, San Francisco, CA', 'Mission District, San Francisco, CA',
            'Castro District, San Francisco, CA', 'Nob Hill, San Francisco, CA', 'Pacific Heights, San Francisco, CA',
            
            // Oakland
            'Oakland, CA', 'Downtown Oakland, CA', 'Temescal, Oakland, CA', 
            'Rockridge, Oakland, CA', 'Piedmont, Oakland, CA', 'Lake Merritt, Oakland, CA',
            
            // Berkeley
            'Berkeley, CA', 'North Berkeley, CA', 'South Berkeley, CA', 'West Berkeley, CA',
            
            // Peninsula
            'Palo Alto, CA', 'Menlo Park, CA', 'Redwood City, CA', 'Mountain View, CA',
            'Sunnyvale, CA', 'San Mateo, CA', 'Burlingame, CA', 'Foster City, CA',
            
            // South Bay
            'San Jose, CA', 'Santa Clara, CA', 'Cupertino, CA', 'Los Altos, CA',
            'Campbell, CA', 'Saratoga, CA', 'Los Gatos, CA', 'Milpitas, CA',
            
            // East Bay
            'Fremont, CA', 'Hayward, CA', 'Union City, CA', 'Newark, CA',
            'San Leandro, CA', 'Alameda, CA', 'Emeryville, CA', 'Richmond, CA',
            
            // North Bay
            'San Rafael, CA', 'Novato, CA', 'Petaluma, CA', 'Santa Rosa, CA',
            'Mill Valley, CA', 'Tiburon, CA', 'Sausalito, CA', 'Larkspur, CA',
            
            // Common street patterns
            'Main Street', 'First Street', 'Second Street', 'Third Street',
            'Broadway', 'Market Street', 'University Avenue', 'El Camino Real',
            'Park Avenue', 'Oak Street', 'Pine Street', 'Cedar Street'
        ];
        
        // Add ZIP codes
        this.bayAreaZips = [
            // San Francisco
            '94102', '94103', '94104', '94105', '94107', '94108', '94109', '94110',
            '94111', '94112', '94114', '94115', '94116', '94117', '94118', '94121',
            '94122', '94123', '94124', '94127', '94131', '94132', '94133', '94134',
            
            // Oakland
            '94601', '94602', '94603', '94605', '94606', '94607', '94608', '94609',
            '94610', '94611', '94612', '94613', '94618', '94619', '94621', '94702',
            
            // Berkeley
            '94701', '94702', '94703', '94704', '94705', '94707', '94708', '94709',
            
            // Peninsula
            '94301', '94302', '94303', '94304', '94305', '94306', // Palo Alto
            '94025', '94026', // Menlo Park
            '94061', '94062', '94063', // Redwood City
            '94039', '94040', '94041', '94043', // Mountain View
            
            // South Bay
            '95110', '95111', '95112', '95113', '95116', '95117', '95118', '95119',
            '95120', '95121', '95122', '95123', '95124', '95125', '95126', '95127',
            '95128', '95129', '95130', '95131', '95132', '95133', '95134', '95135',
            '95136', '95138', '95139', '95148'
        ];
    }
    
    handleInput(e) {
        const value = e.target.value.trim();
        
        if (value.length < this.options.minChars) {
            this.hideSuggestions();
            return;
        }
        
        this.getSuggestions(value);
    }
    
    getSuggestions(query) {
        const suggestions = [];
        const queryLower = query.toLowerCase();
        
        // Search cities and neighborhoods
        this.bayAreaData.forEach(location => {
            if (location.toLowerCase().includes(queryLower)) {
                suggestions.push({
                    type: 'city',
                    text: location,
                    formatted: location
                });
            }
        });
        
        // Search ZIP codes
        this.bayAreaZips.forEach(zip => {
            if (zip.startsWith(query) || query.includes(zip)) {
                const city = this.getRandomBayAreaCity();
                suggestions.push({
                    type: 'zip',
                    text: `${zip} - ${city}`,
                    formatted: `${zip} - ${city}`
                });
            }
        });
        
        // Generate street address suggestions for complete addresses
        if (query.match(/^\d+/)) {
            const streetPatterns = ['Main St', 'First St', 'Oak St', 'Park Ave', 'Broadway'];
            const cities = ['San Francisco, CA', 'Oakland, CA', 'Berkeley, CA', 'San Jose, CA'];
            
            cities.forEach(city => {
                streetPatterns.forEach(street => {
                    const fullAddress = `${query.match(/^\d+/)[0]} ${street}, ${city}`;
                    if (fullAddress.toLowerCase().includes(queryLower)) {
                        suggestions.push({
                            type: 'address',
                            text: fullAddress,
                            formatted: fullAddress
                        });
                    }
                });
            });
        }
        
        // Limit suggestions
        this.suggestions = suggestions.slice(0, this.options.maxSuggestions);
        this.showSuggestions();
    }
    
    getRandomBayAreaCity() {
        const cities = ['San Francisco, CA', 'Oakland, CA', 'Berkeley, CA', 'San Jose, CA', 'Palo Alto, CA'];
        return cities[Math.floor(Math.random() * cities.length)];
    }
    
    showSuggestions() {
        if (this.suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }
        
        this.container.innerHTML = '';
        
        this.suggestions.forEach((suggestion, index) => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.style.cssText = `
                padding: 12px 16px;
                cursor: pointer;
                border-bottom: 1px solid #f1f5f9;
                transition: background-color 0.2s ease;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 8px;
            `;
            
            // Add icon based on type
            const icon = this.getSuggestionIcon(suggestion.type);
            item.innerHTML = `
                <span class="suggestion-icon" style="color: #64748b; font-size: 12px;">${icon}</span>
                <span class="suggestion-text">${this.highlightMatch(suggestion.formatted, this.input.value)}</span>
            `;
            
            item.addEventListener('mousedown', (e) => {
                e.preventDefault(); // Prevent blur event
                this.selectSuggestion(suggestion);
            });
            
            item.addEventListener('mouseenter', () => {
                this.currentIndex = index;
                this.updateHighlight();
            });
            
            this.container.appendChild(item);
        });
        
        this.container.style.display = 'block';
        this.isOpen = true;
        this.currentIndex = -1;
    }
    
    getSuggestionIcon(type) {
        switch (type) {
            case 'city': return '🏙️';
            case 'zip': return '📮';
            case 'address': return '🏠';
            default: return '📍';
        }
    }
    
    highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<strong style="color: #2c5282;">$1</strong>');
    }
    
    hideSuggestions() {
        this.container.style.display = 'none';
        this.isOpen = false;
        this.currentIndex = -1;
    }
    
    selectSuggestion(suggestion) {
        this.input.value = suggestion.text;
        this.hideSuggestions();
        
        // Trigger input event for validation
        this.input.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Focus next element or trigger check
        setTimeout(() => {
            const checkButton = document.getElementById('check-eligibility');
            if (checkButton) {
                checkButton.focus();
            }
        }, 100);
    }
    
    handleKeydown(e) {
        if (!this.isOpen) return;
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.currentIndex = Math.min(this.currentIndex + 1, this.suggestions.length - 1);
                this.updateHighlight();
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                this.currentIndex = Math.max(this.currentIndex - 1, -1);
                this.updateHighlight();
                break;
                
            case 'Enter':
                e.preventDefault();
                if (this.currentIndex >= 0 && this.suggestions[this.currentIndex]) {
                    this.selectSuggestion(this.suggestions[this.currentIndex]);
                } else {
                    this.hideSuggestions();
                }
                break;
                
            case 'Escape':
                this.hideSuggestions();
                break;
        }
    }
    
    updateHighlight() {
        const items = this.container.querySelectorAll('.suggestion-item');
        items.forEach((item, index) => {
            if (index === this.currentIndex) {
                item.style.backgroundColor = '#f1f5f9';
                item.style.color = '#2c5282';
            } else {
                item.style.backgroundColor = 'transparent';
                item.style.color = 'inherit';
            }
        });
    }
    
    handleFocus() {
        if (this.input.value.length >= this.options.minChars) {
            this.getSuggestions(this.input.value);
        }
    }
    
    handleBlur() {
        // Delay hiding to allow click events on suggestions
        setTimeout(() => {
            this.hideSuggestions();
        }, 150);
    }
}

// Auto-initialize for address inputs
document.addEventListener('DOMContentLoaded', function() {
    // Initialize for eligibility checker
    const addressInput = document.getElementById('address-search');
    if (addressInput) {
        new AddressAutocomplete(addressInput, {
            placeholder: 'Enter your Bay Area address...',
            maxSuggestions: 6
        });
    }
    
    // Initialize for Manual J assessment
    const propertyAddressInput = document.getElementById('property-address');
    if (propertyAddressInput) {
        new AddressAutocomplete(propertyAddressInput, {
            placeholder: 'Enter complete property address...',
            maxSuggestions: 5
        });
    }
});

// Export for manual initialization
if (typeof window !== 'undefined') {
    window.AddressAutocomplete = AddressAutocomplete;
}