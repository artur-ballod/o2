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

class ImageUploader {
  constructor(options) {
    this.aside = document.getElementById(options.asideId);
    this.form = document.getElementById(options.formId);
    this.fileInput = document.getElementById(options.fileInputId);
    this.previewContainer = document.getElementById(options.previewContainerId);
    this.labelTextSpan = document.querySelector(options.labelTextSelector);
    this.label = document.querySelector(options.labelSelector);
    this.maxSize = options.maxSize || 10 * 1024 * 1024;
    this.allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png'];
    this.defaultLabelText = this.labelTextSpan.textContent;
    this.emailInput = document.getElementById('main-email');
    this.phoneInput = document.getElementById('phone');
    this.successMessageContainer = document.getElementById('successMessage');
    new PhoneMask(this.phoneInput);

    if (this.fileInput) {
      this.fileInput.addEventListener('change', this.handleFileChange.bind(this));
    }
    if (this.form) {
      this.form.addEventListener('submit', this.handleFormSubmit.bind(this));
    }
  }

  handleFileChange(event) {
    const files = event.target.files;
    this.previewContainer.innerHTML = '';
    this.resetLabel();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > this.maxSize) {
        this.showError(`Размер файла превышает ${this.maxSize / (1024 * 1024)} мегабайт`);
        continue;
      }
      if (!this.allowedTypes.includes(file.type)) {
        this.showError('Недопустимый формат файла');
        continue;
      }

      const reader = new FileReader();
      reader.onload = this.createPreview.bind(this, file);
      reader.readAsDataURL(file);
    }

    if (files.length > 0) {
      this.addUploadedClass();
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
  }

  removeImage(element) {
    this.previewContainer.removeChild(element);
    this.checkUploadedClass();
  }

  showError(message) {
    this.labelTextSpan.textContent = message;
    this.labelTextSpan.classList.add('error');
  }

  resetLabel() {
    this.labelTextSpan.textContent = this.defaultLabelText;
    this.labelTextSpan.classList.remove('error');
  }

  addUploadedClass() {
    this.label.classList.add('uploaded');
  }

  checkUploadedClass() {
    if (this.previewContainer.children.length === 0) {
      this.label.classList.remove('uploaded');
    }
  }

  handleFormSubmit(event) {
    event.preventDefault();

    const email = this.emailInput.value.trim();
    const emailRegex = /^[^s@]+@[^s@]+.[^s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Пожалуйста, введите корректный email');
      return;
    }
    
    this.showThankYouMessage();
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
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    const uploader = new ImageUploader({
      formId: 'feedbackForm',
      asideId: 'aside',
      fileInputId: 'images',
      previewContainerId: 'imagesList',
      labelTextSelector: '.label-text',
      labelSelector: '.label--file',
      maxSize: 10 * 1024 * 1024,
      allowedTypes: ['image/jpeg', 'image/png']
    });
  } catch (error) {
    console.error(error.message);
  }
});