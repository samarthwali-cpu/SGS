document.addEventListener('DOMContentLoaded', () => {
  // It might run before html is dynamically injected, so we should attach event listener 
  // when the script is loaded dynamically by app.js.
});

// Since app.js appends this script dynamically, this top-level code runs immediately after contact.html is loaded.
(function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const statusEl = document.getElementById('form-status');
  const submitBtn = form.querySelector('.submit-btn');

  const showError = (input, message) => {
    const group = input.closest('.form-group');
    group.classList.add('has-error');
    const errorSpan = group.querySelector('.error-msg');
    if (errorSpan) errorSpan.textContent = message;
  };

  const clearError = (input) => {
    const group = input.closest('.form-group');
    group.classList.remove('has-error');
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePhone = (phone) => {
    // Basic phone validation allowing digits, spaces, -, (), +
    const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
    return re.test(String(phone));
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;
    
    // Clear previous status
    statusEl.className = 'form-status';
    statusEl.textContent = '';

    // Validate Name
    const nameInput = document.getElementById('contact-name');
    if (!nameInput.value.trim()) {
      showError(nameInput, 'Please enter your name.');
      isValid = false;
    } else {
      clearError(nameInput);
    }

    // Validate Email
    const emailInput = document.getElementById('contact-email');
    if (!emailInput.value.trim()) {
      showError(emailInput, 'Please enter your email address.');
      isValid = false;
    } else if (!validateEmail(emailInput.value)) {
      showError(emailInput, 'Please enter a valid email address.');
      isValid = false;
    } else {
      clearError(emailInput);
    }

    // Validate Phone
    const phoneInput = document.getElementById('contact-phone');
    if (phoneInput.value.trim() !== '') {
      if (!validatePhone(phoneInput.value)) {
        showError(phoneInput, 'Please enter a valid phone number.');
        isValid = false;
      } else {
        clearError(phoneInput);
      }
    } else {
      clearError(phoneInput);
    }

    // Validate Subject
    const subjectInput = document.getElementById('contact-subject');
    if (!subjectInput.value.trim()) {
      showError(subjectInput, 'Please enter a subject.');
      isValid = false;
    } else {
      clearError(subjectInput);
    }

    // Validate Message
    const msgInput = document.getElementById('contact-message');
    if (!msgInput.value.trim()) {
      showError(msgInput, 'Please enter a message.');
      isValid = false;
    } else {
      clearError(msgInput);
    }

    if (isValid) {
      // Simulate API submission
      submitBtn.disabled = true;
      submitBtn.classList.add('is-loading');

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.classList.remove('is-loading');
        
        // Success state
        statusEl.textContent = 'Thank you! Your message has been sent successfully.';
        statusEl.className = 'form-status success';
        
        form.reset();
      }, 1500);
    }
  });

  // Clear error on input
  form.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('input', () => clearError(input));
  });
})();
