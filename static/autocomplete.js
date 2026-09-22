// Autocomplete functionality for airports and train stations

class Autocomplete {
    constructor(inputId, dropdownId, apiEndpoint, onSelect, countryInputId = null) {
        this.input = document.getElementById(inputId);
        this.dropdown = document.getElementById(dropdownId);
        this.apiEndpoint = apiEndpoint;
        this.onSelect = onSelect;
        this.selectedItem = null;
        this.timeout = null;
        this.countryInput = countryInputId ? document.getElementById(countryInputId) : null;
        this.originalPlaceholder = this.input ? this.input.placeholder : '';
        this.lastSelectedCountry = null;
        
        if (!this.input || !this.dropdown) return;
        
        this.init();
    }
    
    init() {
        // Show dropdown on focus - trigger search immediately
        this.input.addEventListener('focus', () => {
            if (this.input.value.length > 0) {
                clearTimeout(this.timeout);
                this.search(this.input.value);
            }
        });
        
        // Hide dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.input.contains(e.target) && !this.dropdown.contains(e.target)) {
                this.hideDropdown();
            }
        });
        
        // Handle input
        this.input.addEventListener('input', (e) => {
            const query = e.target.value;
            clearTimeout(this.timeout);
            
            // Show/hide clear button
            this.toggleClearButton();
            
            if (query.length < 1) {
                this.hideDropdown();
                this.selectedItem = null;
                // Clear stored data
                if (this.input.dataset.airportData) delete this.input.dataset.airportData;
                if (this.input.dataset.stationData) delete this.input.dataset.stationData;
                return;
            }
            
            // Debounce search - reduced to 150ms for more real-time feel
            this.timeout = setTimeout(() => {
                this.search(query);
            }, 150);
        });
        
        // Add clear button
        this.addClearButton();
        
        // Listen to country input/select changes if country input exists
        if (this.countryInput) {
            const eventType = this.countryInput.tagName === 'SELECT' ? 'change' : 'input';
            this.countryInput.addEventListener(eventType, () => {
                const selectedCountry = this.countryInput.value && this.countryInput.value.trim() ? this.countryInput.value.trim() : null;
                
                // If country changed, clear the input to ensure only airports from new country can be selected
                if (this.lastSelectedCountry !== selectedCountry) {
                    // Check if currently selected item matches the new country
                    if (this.selectedItem && selectedCountry) {
                        const itemCountry = (this.selectedItem.country || '').toLowerCase();
                        const newCountry = selectedCountry.toLowerCase();
                        if (!itemCountry.includes(newCountry) && !newCountry.includes(itemCountry)) {
                            // Selected airport doesn't match new country, clear it
                            this.input.value = '';
                            this.selectedItem = null;
                            // Clear stored data
                            if (this.input.dataset.airportData) delete this.input.dataset.airportData;
                            if (this.input.dataset.stationData) delete this.input.dataset.stationData;
                        }
                    } else if (selectedCountry && !this.selectedItem) {
                        // Country selected but no airport selected yet, clear input
                        this.input.value = '';
                    }
                    
                    this.lastSelectedCountry = selectedCountry;
                    this.hideDropdown();
                    
                    // Update placeholder to indicate country filter
                    if (selectedCountry) {
                        const countryName = this.countryInput.options[this.countryInput.selectedIndex]?.text || selectedCountry;
                        this.input.placeholder = `Select airport in ${countryName}`;
                    } else {
                        this.input.placeholder = this.originalPlaceholder || 'City or Airport';
                    }
                }
                
                // Re-search if there's a query in the main input
                if (this.input.value.length > 0) {
                    clearTimeout(this.timeout);
                    this.timeout = setTimeout(() => {
                        this.search(this.input.value);
                    }, 150);
                }
            });
        }
        
        // Handle keyboard navigation
        this.input.addEventListener('keydown', (e) => {
            const items = this.dropdown.querySelectorAll('.autocomplete-item');
            const active = this.dropdown.querySelector('.autocomplete-item.active');
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (active) {
                    active.classList.remove('active');
                    const next = active.nextElementSibling;
                    if (next) {
                        next.classList.add('active');
                    } else if (items.length > 0) {
                        items[0].classList.add('active');
                    }
                } else if (items.length > 0) {
                    items[0].classList.add('active');
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (active) {
                    active.classList.remove('active');
                    const prev = active.previousElementSibling;
                    if (prev) {
                        prev.classList.add('active');
                    } else if (items.length > 0) {
                        items[items.length - 1].classList.add('active');
                    }
                }
            } else if (e.key === 'Enter' && active) {
                e.preventDefault();
                active.click();
            } else if (e.key === 'Escape') {
                this.hideDropdown();
            }
        });
    }
    
    async search(query) {
        try {
            // Show loading state
            this.showLoading();
            
            let url = `${this.apiEndpoint}?query=${encodeURIComponent(query)}`;
            
            // Add country filter if country select/input has value - this is REQUIRED when country is selected
            if (this.countryInput && this.countryInput.value && this.countryInput.value.trim()) {
                url += `&country=${encodeURIComponent(this.countryInput.value.trim())}`;
            }
            
            const response = await fetch(url);
            const data = await response.json();
            
            // If country is selected, only show results from that country
            const filteredResults = this.countryInput && this.countryInput.value && this.countryInput.value.trim() 
                ? (data.results || []).filter(result => {
                    const resultCountry = (result.country || '').toLowerCase();
                    const selectedCountry = this.countryInput.value.trim().toLowerCase();
                    return resultCountry.includes(selectedCountry) || selectedCountry.includes(resultCountry);
                })
                : (data.results || []);
            
            this.displayResults(filteredResults);
        } catch (error) {
            console.error('Autocomplete error:', error);
            this.showError();
        }
    }
    
    showLoading() {
        this.dropdown.innerHTML = `
            <div class="autocomplete-loading">
                <div class="loading-spinner"></div>
                <div class="loading-text">Searching...</div>
            </div>
        `;
        this.dropdown.style.display = 'block';
        this.dropdown.style.visibility = 'visible';
        this.dropdown.style.opacity = '1';
        this.dropdown.classList.add('autocomplete-dropdown-visible');
    }
    
    showError() {
        this.dropdown.innerHTML = `
            <div class="autocomplete-error">
                <div class="error-icon">⚠️</div>
                <div class="error-text">Error loading results</div>
                <div class="error-hint">Please try again</div>
            </div>
        `;
        this.dropdown.style.display = 'block';
        this.dropdown.style.visibility = 'visible';
        this.dropdown.style.opacity = '1';
        this.dropdown.classList.add('autocomplete-dropdown-visible');
    }
    
    displayResults(results) {
        this.dropdown.innerHTML = '';
        
        if (results.length === 0) {
            // Show "no results" message
            const noResults = document.createElement('div');
            noResults.className = 'autocomplete-no-results';
            noResults.innerHTML = `
                <div class="no-results-icon">🔍</div>
                <div class="no-results-text">No results found</div>
                <div class="no-results-hint">Try a different search term</div>
            `;
            this.dropdown.appendChild(noResults);
            this.dropdown.style.display = 'block';
            this.dropdown.style.visibility = 'visible';
            this.dropdown.style.opacity = '1';
            this.dropdown.classList.add('autocomplete-dropdown-visible');
            return;
        }
        
        // Limit results to 8 for better UX
        const limitedResults = results.slice(0, 8);
        
        limitedResults.forEach((result, index) => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            if (index === 0) item.classList.add('active');
            
            // Determine icon based on type (airport or train station)
            const isAirport = this.apiEndpoint.includes('airport');
            const icon = isAirport ? '✈️' : '🚂';
            const typeLabel = isAirport ? 'Airport' : 'Station';
            
            // Create a more informative display
            const displayText = result.display || result.name || result.code;
            const code = result.code ? result.code : '';
            const city = result.city ? result.city : '';
            const country = result.country ? result.country : '';
            
            item.innerHTML = `
                <div class="autocomplete-item-icon">${icon}</div>
                <div class="autocomplete-item-content">
                    <div class="autocomplete-main">${displayText}</div>
                    <div class="autocomplete-details">
                        ${code ? `<span class="autocomplete-code">${code}</span>` : ''}
                        ${city ? `<span class="autocomplete-city">${city}</span>` : ''}
                        ${country ? `<span class="autocomplete-country">${country}</span>` : ''}
                    </div>
                </div>
                <div class="autocomplete-item-arrow">→</div>
            `;
            
            // Store result data for selection
            item.dataset.result = JSON.stringify(result);
            
            item.addEventListener('click', () => {
                this.selectItem(result);
            });
            
            // Add hover effect
            item.addEventListener('mouseenter', () => {
                this.dropdown.querySelectorAll('.autocomplete-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
            
            this.dropdown.appendChild(item);
        });
        
        this.dropdown.style.display = 'block';
        this.dropdown.style.visibility = 'visible';
        this.dropdown.style.opacity = '1';
        this.dropdown.classList.add('autocomplete-dropdown-visible');
    }
    
    selectItem(item) {
        // Validate that selected item matches the country filter if one is set
        if (this.countryInput && this.countryInput.value && this.countryInput.value.trim()) {
            const selectedCountry = this.countryInput.value.trim().toLowerCase();
            const itemCountry = (item.country || '').toLowerCase();
            const countryName = this.countryInput.options[this.countryInput.selectedIndex]?.text || this.countryInput.value;
            
            // Check if the item's country matches the selected country
            if (!itemCountry.includes(selectedCountry) && !selectedCountry.includes(itemCountry)) {
                // Airport doesn't match selected country - show error and don't select
                alert(`⚠️ Can only select airports in ${countryName}. This airport is not in the selected country.`);
                this.hideDropdown();
                return;
            }
            
            // Check for international flight attempt
            this.checkInternationalFlight(item, countryName);
        }
        
        this.selectedItem = item;
        this.input.value = item.display || item.name || item.code;
        this.hideDropdown();
        
        if (this.onSelect) {
            this.onSelect(item);
        }
    }
    
    checkInternationalFlight(selectedItem, countryName) {
        // Check if this is the "from" or "to" field
        const isFromField = this.input.id === 'from';
        const isToField = this.input.id === 'to';
        
        if (!isFromField && !isToField) return;
        
        // Get the other field's selected airport
        const otherFieldId = isFromField ? 'to' : 'from';
        const otherInput = document.getElementById(otherFieldId);
        
        if (otherInput && otherInput.value.trim()) {
            const otherData = otherInput.dataset.airportData ? JSON.parse(otherInput.dataset.airportData) : null;
            
            if (otherData && otherData.country) {
                const selectedCountry = this.countryInput.value.trim().toLowerCase();
                const selectedItemCountry = (selectedItem.country || '').toLowerCase();
                const otherCountry = (otherData.country || '').toLowerCase();
                
                // Check if both airports are from the selected country
                const selectedMatches = selectedItemCountry.includes(selectedCountry) || selectedCountry.includes(selectedItemCountry);
                const otherMatches = otherCountry.includes(selectedCountry) || selectedCountry.includes(otherCountry);
                
                // Check if user is trying to book international flight (different countries)
                if (selectedItemCountry !== otherCountry && selectedItemCountry && otherCountry) {
                    // International flight attempt detected
                    setTimeout(() => {
                        alert(`⚠️ Can only select airports in ${countryName}. International flights are not allowed when a country filter is selected.`);
                    }, 100);
                } else if (!selectedMatches || !otherMatches) {
                    // One or both airports don't match the selected country
                    setTimeout(() => {
                        alert(`⚠️ Can only select airports in ${countryName}. Both airports must be from the selected country.`);
                    }, 100);
                }
            }
        }
    }
    
    hideDropdown() {
        this.dropdown.style.display = 'none';
        this.dropdown.style.visibility = 'hidden';
        this.dropdown.style.opacity = '0';
        this.dropdown.classList.remove('autocomplete-dropdown-visible');
        this.dropdown.innerHTML = '';
    }
    
    getSelectedValue() {
        return this.selectedItem;
    }
    
    addClearButton() {
        // Check if clear button already exists
        if (this.input.parentElement.querySelector('.autocomplete-clear')) {
            return;
        }
        
        const clearBtn = document.createElement('button');
        clearBtn.type = 'button';
        clearBtn.className = 'autocomplete-clear';
        clearBtn.innerHTML = '✕';
        clearBtn.setAttribute('aria-label', 'Clear input');
        clearBtn.style.display = this.input.value.trim() ? 'flex' : 'none';
        
        clearBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.input.value = '';
            this.selectedItem = null;
            this.hideDropdown();
            this.toggleClearButton();
            this.input.focus();
            
            // Clear stored data
            if (this.input.dataset.airportData) delete this.input.dataset.airportData;
            if (this.input.dataset.stationData) delete this.input.dataset.stationData;
        });
        
        // Insert clear button after input
        if (this.input.parentElement.classList.contains('autocomplete-group')) {
            this.input.parentElement.appendChild(clearBtn);
        } else {
            // Wrap input in autocomplete-group if not already
            const wrapper = document.createElement('div');
            wrapper.className = 'autocomplete-group';
            this.input.parentNode.insertBefore(wrapper, this.input);
            wrapper.appendChild(this.input);
            wrapper.appendChild(clearBtn);
            if (this.dropdown.parentElement === this.input.parentElement) {
                wrapper.appendChild(this.dropdown);
            }
        }
    }
    
    toggleClearButton() {
        const clearBtn = this.input.parentElement.querySelector('.autocomplete-clear');
        if (clearBtn) {
            clearBtn.style.display = this.input.value.trim() ? 'flex' : 'none';
        }
    }
}

// Load countries into dropdown
async function loadCountries() {
    try {
        const response = await fetch('/api/countries');
        const data = await response.json();
        const countrySelect = document.getElementById('country');
        
        if (countrySelect && data.countries) {
            // Clear existing options except "All Countries"
            countrySelect.innerHTML = '<option value="">All Countries</option>';
            
            // Add all countries
            data.countries.forEach(country => {
                const option = document.createElement('option');
                option.value = country;
                option.textContent = country;
                countrySelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading countries:', error);
    }
}

// Initialize autocomplete when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    
    // Load countries for trains and flights pages
    if (path.includes('trains') || path.includes('flights')) {
        loadCountries();
    }
    
    // Initialize autocomplete for trains page
    if (path.includes('trains')) {
        const fromInput = document.getElementById('from');
        const fromDropdown = document.getElementById('fromDropdown');
        const toInput = document.getElementById('to');
        const toDropdown = document.getElementById('toDropdown');
        
        if (fromInput && fromDropdown) {
            new Autocomplete('from', 'fromDropdown', '/api/autocomplete/train-stations', (item) => {
                fromInput.dataset.stationData = JSON.stringify(item);
            }, 'country');
        }
        
        if (toInput && toDropdown) {
            new Autocomplete('to', 'toDropdown', '/api/autocomplete/train-stations', (item) => {
                toInput.dataset.stationData = JSON.stringify(item);
            }, 'country');
        }
    }
    
    // Initialize autocomplete for flights page
    if (path.includes('flights')) {
        const fromInput = document.getElementById('from');
        const fromDropdown = document.getElementById('fromDropdown');
        const toInput = document.getElementById('to');
        const toDropdown = document.getElementById('toDropdown');
        const returnFromInput = document.getElementById('returnFrom');
        const returnFromDropdown = document.getElementById('returnFromDropdown');
        const returnToInput = document.getElementById('returnTo');
        const returnToDropdown = document.getElementById('returnToDropdown');
        
        if (fromInput && fromDropdown) {
            new Autocomplete('from', 'fromDropdown', '/api/autocomplete/airports', (item) => {
                fromInput.dataset.airportData = JSON.stringify(item);
            }, 'country');
        }
        
        if (toInput && toDropdown) {
            new Autocomplete('to', 'toDropdown', '/api/autocomplete/airports', (item) => {
                toInput.dataset.airportData = JSON.stringify(item);
            }, 'country');
        }
        
        // Initialize autocomplete for return flight fields
        if (returnFromInput && returnFromDropdown) {
            new Autocomplete('returnFrom', 'returnFromDropdown', '/api/autocomplete/airports', (item) => {
                returnFromInput.dataset.airportData = JSON.stringify(item);
            }, 'country');
        }
        
        if (returnToInput && returnToDropdown) {
            new Autocomplete('returnTo', 'returnToDropdown', '/api/autocomplete/airports', (item) => {
                returnToInput.dataset.airportData = JSON.stringify(item);
            }, 'country');
        }
    }
});

