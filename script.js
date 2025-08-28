class EmailGenerator {
  constructor() {
    this.form = document.getElementById('emailForm');
    this.prefixInput = document.getElementById('prefix');
    this.notesInput = document.getElementById('notes');
    this.suffixInput = document.getElementById('suffix');
    this.resultContainer = document.getElementById('resultContainer');
    this.generatedEmailDiv = document.getElementById('generatedEmail');
    this.generateBtn = document.getElementById('generateBtn');
    this.copyBtn = document.getElementById('copyBtn');
    this.feedback = document.getElementById('feedback');
    this.history = document.getElementById('history');
    this.currentEmail = '';
    this.historyStorage = JSON.parse(localStorage.getItem('emailGenerator_history')) || [];
    this.historyArray = this.historyStorage || [];
    this.lastSuffix = '';

    this.initEventListeners();
    this.loadSavedValues();
    this.loadHistory();
  }

  initEventListeners() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    this.copyBtn.addEventListener('click', () => this.copyToClipboard());
    this.prefixInput.addEventListener('input', () => this.saveValues());
  }

  handleSubmit(e) {
    e.preventDefault();
    this.generateEmail();
  }

  generateTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `<span class="year">${year}</span><span class="month">${month}</span><span class="day">${day}</span><span class="hours">${hours}</span><span class="minutes">${minutes}</span><span class="seconds">${seconds}</span>`
  }

  generateEmail() {
    const prefix = this.prefixInput.value.replace(/[^a-zA-Z0-9.]/g, '').toLowerCase();
    let suffix = this.suffixInput.value.replace(/[^a-zA-Z0-9]/g, '');

    if (!prefix) {
      this.showFeedback('Please fill in the field', flase)
      return;
    }

    const timestamp = this.generateTimestamp();
    if (!suffix) {
      this.currentEmail = `${prefix}+${timestamp}@americastestkitchen.com`
    } else {
      suffix = `<span class="customSuffix">${suffix}</span>`;
      this.currentEmail = `${prefix}+${suffix}@americastestkitchen.com`
    }

    // Make sure we're not repeating
    const currentSuffix = suffix || timestamp;
    if (currentSuffix !== this.lastSuffix) {
      this.lastSuffix = currentSuffix;
      this.displayEmail();
      this.showFeedback('Email generated successfully', true);
      this.saveValues();
      const newEmail = document.getElementById('generatedEmail').innerHTML;
      const newNotes = this.notesInput.value.trim();
      this.historyArray.unshift({memEmail: newEmail, memNotes: newNotes});
      this.saveNewEmail();
      this.showGenerateSuccess();
    }
  }

  displayEmail() {
    this.generatedEmailDiv.innerHTML = this.currentEmail;
    this.resultContainer.classList.remove('hidden');
    this.copyBtn.style.display = 'block';
    this.generatedEmailDiv.style.display = 'block';
  }

  async copyToClipboard() {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(this.generatedEmailDiv.textContent);
      } else {
        this.fallbackCopy();
      }

      this.showCopySuccess();
      this.showFeedback('Copied to clipboard!', true);
    } catch (err) {
      console.error('Failed to copy:', err);
      this.fallbackCopy();
    }
  }

  fallackCopy() {
    const textArea = document.createElement('textarea');
    textArea.value = this.currentEamil;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea)
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      this.showCopySuccess();
      this.showFeedback('Copied to clipboard!', true);
    } catch (err) {
      this.showFeedback('Copy failed - please select and copy manually', false);
    }

    document.body.removeChild(textArea);
  }

  showGenerateSuccess() {
    this.generateBtn.textContent = 'Generated!'
    this.generateBtn.classList.add('generated');

    setTimeout(() => {
      this.generateBtn.textContent = 'Generate email';
      this.generateBtn.classList.remove('generated');
    }, 2000);
  }

  showCopySuccess() {
    this.copyBtn.textContent = 'Copied!'
    this.copyBtn.classList.add('copied');

    setTimeout(() => {
      this.copyBtn.textContent = 'Copy to clipboard';
      this.copyBtn.classList.remove('copied');
    }, 2000);
  }

  showFeedback(message, isSuccess) {
    this.feedback.textContent = message;
    this.feedback.className = `feedback ${isSuccess ? 'success' : ''} show`;

    setTimeout(() => {
      this.feedback.classList.remove('show');
    }, 3000);
  }

  saveValues() {
    try {
      localStorage.setItem('emailGenerator_prefix', this.prefixInput.value);
    } catch (err) {
    }
  }

  loadSavedValues() {
    try {
      const savedPrefix = localStorage.getItem('emailGenerator_prefix');
      if (savedPrefix) this.prefixInput.value = savedPrefix;
    } catch (err) {
    }
  }

  saveNewEmail() {
    localStorage.setItem('emailGenerator_history', JSON.stringify(this.historyArray.slice(0, 1000)));
    this.loadHistory();
  }

  loadHistory() {
    this.history.innerHTML = this.historyStorage.map(function(elem, index){
      return `<div class="item"><button class="deleteItem" onclick="emailGenerator.deleteEmail(${index})">X</button><div class="inline email-item">${elem.memEmail}</div><div class="inline comments"> ${elem.memNotes}</div></div>`;
    }).join('');
  }

  deleteEmail(index) {
    if (confirm('Are you sure you want to delete?')) {
      this.historyArray.splice(index, 1);
      this.saveNewEmail();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.emailGenerator = new EmailGenerator();
});
