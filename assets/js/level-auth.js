const academicVault = {
  'computer-science': {
    '100': { password: 'csc100', url: 'https://drive.google.com/REPLACE_CSC_100' },
    '200': { password: 'csc200', url: 'https://drive.google.com/REPLACE_CSC_200' },
    '300': { password: 'csc300', url: 'https://drive.google.com/REPLACE_CSC_300' },
    '400': { password: 'csc400', url: 'https://drive.google.com/REPLACE_CSC_400' }
  },
  'mathematics': {
    '100': { url: null }, '200': { url: null }, '300': { url: null }, '400': { url: null }
  },
  'economics': {
    '100': { url: null }, '200': { url: null }, '300': { url: null }, '400': { url: null }
  },
  'law': {
    '100': { url: null }, '200': { url: null }, '300': { url: null }, '400': { url: null }
  },
  'microbiology': {
    '100': { url: null }, '200': { url: null }, '300': { url: null }, '400': { url: null }
  },
  'accounting': {
    '100': { url: null }, '200': { url: null }, '300': { url: null }, '400': { url: null }
  },
  'mass-communication': {
    '100': { url: null }, '200': { url: null }, '300': { url: null }, '400': { url: null }
  },
  'political-science': {
    '100': { url: null }, '200': { url: null }, '300': { url: null }, '400': { url: null }
  },
  'business-administration': {
    '100': { url: null }, '200': { url: null }, '300': { url: null }, '400': { url: null }
  }
};

let currentDept = null;
let currentLevel = null;

document.addEventListener('DOMContentLoaded', () => {
  const passwordModal = document.getElementById('pw-modal');
  const noResourceModal = document.getElementById('no-resource-modal');
  const passwordInput = document.getElementById('pw-input');
  const passwordError = document.getElementById('pw-error');
  const modalTitle = document.getElementById('modal-title');

  const openModal = (modal) => {
    modal.style.display = 'flex';
  };

  const closeModal = (modal) => {
    modal.style.display = 'none';
  };

  document.querySelectorAll('.level-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const dept = button.dataset.dept;
      const level = button.dataset.level;
      const resource = academicVault[dept]?.[level];

      if (!resource || resource.url === null) {
        openModal(noResourceModal);
        return;
      }

      currentDept = dept;
      currentLevel = level;
      modalTitle.textContent = `${button.dataset.name} - ${level}L`;
      passwordInput.value = '';
      passwordError.hidden = true;
      openModal(passwordModal);
      passwordInput.focus();
    });
  });

  const unlock = () => {
    const resource = academicVault[currentDept]?.[currentLevel];
    if (!resource) return;

    if (passwordInput.value === resource.password) {
      const url = resource.url;
      closeModal(passwordModal);
      passwordInput.value = '';
      passwordError.hidden = true;
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    passwordError.textContent = 'Incorrect password. Please try again.';
    passwordError.hidden = false;
    passwordInput.focus();
  };

  document.getElementById('pw-submit').addEventListener('click', unlock);
  document.getElementById('pw-cancel').addEventListener('click', () => {
    closeModal(passwordModal);
    passwordInput.value = '';
    passwordError.hidden = true;
  });
  document.getElementById('no-resource-close').addEventListener('click', () => closeModal(noResourceModal));
  passwordInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') unlock();
  });
});
