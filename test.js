
        function syncCompanyName() {
            let companyInput = document.getElementById('companyNameInput');
            let personInput = document.getElementById('personNameInput');
            let targetNotice = document.getElementById('companyNoticeTarget');
            let coverCompany = document.getElementById('coverCompanyName');
            
            let companyVal = companyInput ? companyInput.value.trim() : "";
            let personVal = personInput ? personInput.value.trim() : "";
            
            let displayVal = companyVal ? companyVal : personVal;
            
            if (targetNotice) {
                let cleanedVal = toTitleCase(displayVal);
                targetNotice.innerText = cleanedVal || "Client / Company";
                if (coverCompany) coverCompany.innerText = cleanedVal || "Client / Company";
            }
        }

        function toTitleCase(str) {
            if (!str) return str;
            const acronyms = ['SLA', 'NOC', 'ILL', 'ILP', 'BGP', 'SMTP', 'VPN', 'VPNS', 'IP', 'IPV4', 'AIIDC', 'CATLA', 'GST', 'UPS', 'CAF', 'DD', 'PVT', 'LTD', 'CO'];
            let titleCased = str.replace(/\w\S*/g, function(txt) {
                let upper = txt.toUpperCase();
                let cleanUpper = upper.replace(/[^A-Z0-9]/g, '');
                if (acronyms.includes(cleanUpper)) {
                    return txt.toUpperCase();
                }
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
            return titleCased.replace(/\([^)]+\)/g, function(match) {
                return match.toUpperCase();
            });
        }

        function adjustTextareaHeight(el) {
            el.style.height = 'auto';
            el.style.height = (el.scrollHeight + 2) + 'px';
        }

        function updateManagerDetails() {
            let select = document.getElementById('managerSelect');
            let val = select.value;
            let parts = val.split('|');
            if (parts.length === 3) {
                document.getElementById('managerPhone').value = parts[1];
                document.getElementById('managerEmail').value = parts[2];
            }
        }

        function formatIndianCurrency(num) {
            if (isNaN(num)) return "0.00";
            let parts = num.toFixed(2).split('.');
            let lastThree = parts[0].substring(parts[0].length - 3);
            let otherNumbers = parts[0].substring(0, parts[0].length - 3);
            if (otherNumbers != '') {
                lastThree = ',' + lastThree;
            }
            let formattedInt = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
            return formattedInt + '.' + parts[1];
        }

        function parseNumber(str) {
            if (!str) return 0;
            let clean = str.replace(/[^0-9.]/g, '');
            let parsed = parseFloat(clean);
            return isNaN(parsed) ? 0 : parsed;
        }

        function updateRowCalculation(row) {
            let speedInput = row.querySelector('.plan-speed');
            let rateInput = row.querySelector('.auto-rate');
            let totalInput = row.querySelector('.auto-amount');

            let speedNum = parseNumber(speedInput.value);
            if (speedNum > 0) {
                speedInput.value = speedNum + ' Mbps Plan';
            }

            let rateNum = parseNumber(rateInput.value);
            if (rateNum > 0) {
                rateInput.value = '₹ ' + formatIndianCurrency(rateNum) + ' / Mbps';
            }

            if (speedNum > 0 && rateNum > 0) {
                let annualTotal = speedNum * rateNum * 12;
                totalInput.value = '₹ ' + formatIndianCurrency(annualTotal) + ' + GST';
            }
        }

        function handlePrint() {
            window.print();
            var currentSeq = parseInt(localStorage.getItem('catlaSequence')) || 100;
            currentSeq += 1;
            localStorage.setItem('catlaSequence', currentSeq);
            var yyyy = new Date().getFullYear();
            document.getElementById('refNoInput').value = 'CATLA/' + yyyy + '/' + currentSeq;
        }

        function toggleDarkMode() {
            document.body.classList.toggle('dark-theme');
            localStorage.setItem('catlaDarkMode', document.body.classList.contains('dark-theme'));
        }

        window.addEventListener('DOMContentLoaded', function() {
            if (localStorage.getItem('catlaDarkMode') === 'true') {
                document.body.classList.add('dark-theme');
            }

            syncCompanyName();
            updateManagerDetails();
            
            let today = new Date();
            let dd = String(today.getDate()).padStart(2, '0');
            let mm = String(today.getMonth() + 1).padStart(2, '0');
            let yyyy = today.getFullYear();
            document.getElementById('currentDateInput').value = dd + '/' + mm + '/' + yyyy;
            
            let storedYear = localStorage.getItem('catlaYear');
            let currentSeq = localStorage.getItem('catlaSequence');
            
            if (!storedYear || parseInt(storedYear) < yyyy) {
                storedYear = yyyy;
                currentSeq = 100;
                localStorage.setItem('catlaYear', storedYear);
                localStorage.setItem('catlaSequence', currentSeq);
            }
            
            if (!currentSeq) {
                currentSeq = 100;
                localStorage.setItem('catlaSequence', currentSeq);
            }
            
            document.getElementById('refNoInput').value = 'CATLA/' + storedYear + '/' + currentSeq;

            document.querySelectorAll('textarea.auto-expand').forEach(ta => {
                adjustTextareaHeight(ta);
            });
        });

        document.querySelectorAll('textarea.auto-expand').forEach(ta => {
            ta.addEventListener('input', function() {
                adjustTextareaHeight(this);
            });
        });

        // Setup global text inputs (TitleCase on blur/enter)
        document.querySelectorAll('input[type="text"], textarea').forEach(input => {
            if (!input.classList.contains('plan-speed') &&
                !input.classList.contains('auto-rate') && 
                !input.classList.contains('auto-ratio') &&
                !input.classList.contains('auto-amount') && 
                !input.classList.contains('auto-one-time') &&
                input.id !== 'managerEmail' && 
                input.id !== 'managerPhone') {
                
                input.addEventListener('blur', function() {
                    this.value = toTitleCase(this.value);
                    if (this.tagName.toLowerCase() === 'textarea') {
                        adjustTextareaHeight(this);
                    }
                    syncCompanyName();
                });

                input.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.value = toTitleCase(this.value);
                        if (this.tagName.toLowerCase() === 'textarea') {
                            adjustTextareaHeight(this);
                        }
                        syncCompanyName();
                        this.blur();
                    }
                });
            }
        });

        // Pricing Inputs Setup
        function setupPricingInput(selector, formatFn) {
            document.querySelectorAll(selector).forEach(function(inp) {
                inp.addEventListener('focus', function() {
                    this.dataset.oldValue = this.value;
                    this.value = '';
                });
                
                var processInput = function(el) {
                    var val = el.value.trim();
                    if (val === '') {
                        el.value = el.dataset.oldValue || '';
                    } else {
                        el.value = formatFn(val);
                    }
                    var row = el.closest('.pricing-row');
                    if (row) {
                        updateRowCalculation(row);
                    }
                };
                
                inp.addEventListener('blur', function() {
                    processInput(this);
                });
                
                inp.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        processInput(this);
                        this.blur();
                    }
                });
            });
        }

        setupPricingInput('.plan-speed', function(val) {
            var num = parseNumber(val);
            return num > 0 ? num + ' Mbps Plan' : val;
        });

        setupPricingInput('.auto-rate', function(val) {
            var num = parseNumber(val);
            return num > 0 ? '₹ ' + formatIndianCurrency(num) + ' / Mbps' : val;
        });

        setupPricingInput('.auto-ratio', function(val) {
            var clean = val.replace(/\s*Dedicated$/i, '').trim();
            if (clean.length >= 2 && clean.indexOf(':') === -1) {
                clean = clean.substring(0, 1) + ':' + clean.substring(1);
            }
            return clean + ' Dedicated';
        });

        setupPricingInput('.auto-amount', function(val) {
            var num = parseNumber(val);
            return num > 0 ? '₹ ' + formatIndianCurrency(num) + ' + GST' : val;
        });

        setupPricingInput('.auto-one-time', function(val) {
            var num = parseNumber(val);
            return num > 0 ? '₹ ' + formatIndianCurrency(num) + '/-' : val;
        });

    