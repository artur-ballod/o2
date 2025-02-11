class PhoneMask {
  constructor(input) {
    this.input = input;
    this.input.addEventListener('input', this.onInput.bind(this));
  }

  onInput() {
    let value = this.input.value;
    value = value.replace(/[^\d+]/g, '');

    if (!value.startsWith('+7')) {
      value = '+7' + value.replace('+', '');
    }

    const numericPart = value.substring(2).replace(/\D/g, '');
    const maxLength = 10;
    const limitedNumericPart = numericPart.slice(0, maxLength);

    let formatted = '+7 ';
    if (limitedNumericPart.length > 0) {
      formatted += limitedNumericPart.substring(0, 3) + ' ';
    }
    if (limitedNumericPart.length >= 4) {
      formatted += limitedNumericPart.substring(3, 6) + ' ';
    }
    if (limitedNumericPart.length >= 7) {
      formatted += limitedNumericPart.substring(6, 8) + ' ';
    }
    if (limitedNumericPart.length >= 9) {
      formatted += limitedNumericPart.substring(8, 10);
    }

    this.input.value = formatted.trim();
  }
}

class RatingHandler {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.ratingInput = this.container.querySelector('input[type="hidden"]');
    this.stars = this.container.querySelectorAll('.rating__star');
    this.currentRating = 0;
    this.container.addEventListener('click', this.handleClick.bind(this));
  }

  handleClick(event) {
    const star = event.target.closest('.rating__star');
    if (star) {
      const value = star.getAttribute('data-value');
      this.setRating(value);
    }
  }

  setRating(value) {
    this.currentRating = value;
    this.ratingInput.value = this.currentRating;
    this.updateStars();
  }

  updateStars() {
    this.stars.forEach(star => {
      if (parseInt(star.getAttribute('data-value')) <= parseInt(this.currentRating)) {
        star.classList.add('active');
      } else {
        star.classList.remove('active');
      }
    });
  }

  getRating() {
    return this.currentRating;
  }
}

class mainApp {
  constructor(options) {
    this.aside = document.getElementById(options.asideId);
    this.form = document.getElementById(options.formId);
    this.fileWrap = document.getElementById(options.fileWrap);
    this.fileInput = document.getElementById(options.fileInputId);
    this.previewContainer = document.getElementById(options.previewContainerId);
    this.labelTextSpan = document.getElementById(options.labelSelectorText);
    this.labelText = document.getElementById(options.labelSelector);
    this.maxSize = options.maxSize || 10 * 1024 * 1024;
    this.allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png'];
    this.defaultLabelText = this.labelTextSpan.textContent;
    this.emailInput = document.getElementById('main-email');
    this.phoneInput = document.getElementById('phone');
    this.nameInput = document.getElementById('name');
    this.commentInput = document.getElementById('comment');
    this.successMessageContainer = document.getElementById('successMessage');
    new PhoneMask(this.phoneInput);
    this.ratingHandler = new RatingHandler('rating');
    this.emailError = document.querySelector('#emailError');
    this.phoneError = document.querySelector('#phoneError');
    this.nameError = document.querySelector('#nameError');
    this.commentError = document.querySelector('#commentError');

    if (this.fileInput) {
      this.fileInput.addEventListener('change', this.handleFileChange.bind(this));
    }
    if (this.form) {
      this.form.addEventListener('submit', this.handleFormSubmit.bind(this));

      if (this.emailInput) {
        this.emailInput.addEventListener('input', this.validateEmail.bind(this));
      }
      if (this.phoneInput) {
        this.phoneInput.addEventListener('input', this.validatePhone.bind(this));
      }
      if (this.nameInput) {
        this.nameInput.addEventListener('input', this.validateName.bind(this));
      }
      if (this.commentInput) {
        this.commentInput.addEventListener('input', this.validateComment.bind(this));
      }
    }
  }

  handleFileChange(event) {
    const files = event.target.files;
    if (files.length === 0) {
      this.resetLabel();
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.size > this.maxSize) {
        this.showErrorFile(`Размер файла превышает ${this.maxSize / (1024 * 1024)} МБ`);
        continue;
      }

      if (!this.allowedTypes.includes(file.type)) {
        this.showErrorFile('Недопустимый формат файла');
        continue;
      }

      const reader = new FileReader();
      reader.onload = this.createPreview.bind(this, file);
      reader.readAsDataURL(file);
    }
  }

  createPreview(file, event) {
    const imgSrc = event.target.result;
    const previewItem = document.createElement('div');
    previewItem.className = 'input__preview-item';

    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = 'Preview';

    const removeBtn = document.createElement('button');
    removeBtn.className = 'input__preview-btn';
    removeBtn.innerHTML = `
      <svg class="delete-icon" aria-hidden="true">
        <use xlink:href="static/images/sprite/symbol/sprite.svg#delete"></use>
      </svg>
    `;
    removeBtn.setAttribute('aria-label', 'Удалить изображение');
    removeBtn.addEventListener('click', () => this.removeImage(previewItem));

    previewItem.appendChild(img);
    previewItem.appendChild(removeBtn);
    this.previewContainer.appendChild(previewItem);
    this.checkUploadedClass();
  }

  removeImage(element) {
    this.previewContainer.removeChild(element);
    this.checkUploadedClass();
  }

  showErrorFile(message) {
    if (this.labelTextSpan && typeof this.labelTextSpan.textContent !== 'undefined') {
      this.labelTextSpan.textContent = message;
      if (this.fileWrap) {
        this.fileWrap.classList.add('error');
      }
    } else {
      console.error('labelTextSpan or labelText is not a valid DOM element or is undefined.');
    }
  }

  resetLabel() {
    this.labelTextSpan.textContent = this.defaultLabelText;
    this.fileWrap.classList.remove('error');
    this.labelText.classList.remove('uploaded');
  }

  addUploadedClass() {
    this.labelText.classList.add('uploaded');
  }

  checkUploadedClass() {
    if (this.previewContainer.children.length > 0) {
      this.addUploadedClass();
    } else {
      this.resetLabel();
    }
  }

  handleFormSubmit(event) {
    event.preventDefault();

    let isValid = true;
    
    this.validateEmail();
    this.validatePhone();
    this.validateName();
    this.validateComment();

    if (this.emailInput.classList.contains('invalid') ||
        this.phoneInput.classList.contains('invalid') ||
        this.nameInput.classList.contains('invalid') ||
        this.commentInput.classList.contains('invalid')) {
      isValid = false;
    }

    if (!isValid) {
      alert('Пожалуйста, исправьте ошибки в форме');
      return;
    }

    this.showThankYouMessage();
  }

  validateEmail() {
    const email = this.emailInput.value.trim();
    const emailRegex = /^[^ ]+@[^ ]+\.[a-z]{1,3}$/;
    if (email === '') {
      this.removeInvalidClass(this.emailInput);
      this.hideError(this.emailError);
    } else if (!emailRegex.test(email)) {
      this.addInvalidClass(this.emailInput);
      this.showError(this.emailError, 'Пожалуйста, введите корректный email (например, example@domain.com)');
    } else {
      this.removeInvalidClass(this.emailInput);
      this.hideError(this.emailError);
    }
  }

  validatePhone() {
    let phone = this.phoneInput.value.replace(/[^\d+]/g, '');
    const phoneRegex = /^\+7\d{10}$/;

    if (phone === '') {
      this.removeInvalidClass(this.phoneInput);
      this.hideError(this.phoneError);
    } else if (phoneRegex.test(phone) || (phone.startsWith('+7') && phone.length === 12)) {
      this.removeInvalidClass(this.phoneInput);
      this.hideError(this.phoneError);
    } else {
      this.addInvalidClass(this.phoneInput);
      this.showError(this.phoneError, 'Пожалуйста, введите корректный номер телефона (например, +71234567890)');
    }
  }

  validateName() {
    const name = this.nameInput.value.trim();
    if (name === '') {
      this.addInvalidClass(this.nameInput);
      this.showError(this.nameError, 'Обязательное поле');
      isValid = false;
    } else {
      this.removeInvalidClass(this.nameInput);
      this.hideError(this.nameError);
    }
  }

  validateComment() {
    const comment = this.commentInput.value.trim();
    if (comment === '') {
      this.addInvalidClass(this.commentInput);
      this.showError(this.commentError, 'Обязательное поле');
      isValid = false;
    } else {
      this.removeInvalidClass(this.commentInput);
      this.hideError(this.commentError);
    }
  }

  addInvalidClass(element) {
    element.classList.add('invalid');
  }

  removeInvalidClass(element) {
    element.classList.remove('invalid');
  }

  showThankYouMessage() {
    this.form.style.display = 'none';
    this.aside.classList.add('form--submitted');

    const thankYouMessage = document.createElement('div');
    thankYouMessage.classList.add('form__success');
    thankYouMessage.innerHTML = `
      <h3>Спасибо за ваш отзыв!</h3>
      <p>Ваш отзыв будет опубликован сразу после того, как его проверят наши сотрудники.</p>
    `;
    this.form.parentElement.appendChild(thankYouMessage);
  }

  showError(element, message) {
    if (element) {
      element.textContent = message;
      element.classList.add('active');
    }
  }

  hideError(element) {
    if (element) {
      element.textContent = '';
      element.classList.remove('active');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    const uploader = new mainApp({
      formId: 'feedbackForm',
      asideId: 'aside',
      fileWrap: 'formFileContainer',
      fileInputId: 'images',
      previewContainerId: 'imagesList',
      labelSelector: 'fileLabel',
      labelSelectorText: 'fileLabelText',
      maxSize: 10 * 1024 * 1024,
      allowedTypes: ['image/jpeg', 'image/png'],
      containerId: 'rating'
    });
  } catch (error) {
    console.error(error.message);
  }
});