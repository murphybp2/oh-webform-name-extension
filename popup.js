/**
 * Orlando Health Form Name Reader - popup.js
 * Version: 1.3.0
 * Last Modified: May 11, 2026
 *
 * Changelog:
 * v1.3.0 - Form Name and Form ID are now checked independently; partial results
 *          are shown with a warning banner when one field is missing
 * v1.2.3 - Left-aligned error messages; email address is now a clickable mailto link
 * v1.2.2 - Improved error messages: distinguishes no form vs form missing hidden fields
 * v1.2.1 - Fixed false MISSING_FIELDS error on SharePoint pages with embedded iFrame
 * v1.2.0 - Added support for forms embedded via iFrame
 * v1.1.3 - Added detection for TFAForms pages missing required fields
 * v1.1.2 - Simplified DOM loading with better error handling
 * v1.1.1 - Fixed DOM loading issue (elements not initializing)
 * v1.1.0 - Implemented 1Password-style click-to-copy interaction
 * v1.0.1 - Added separate copy buttons for name and ID
 * v1.0.0 - Initial improvements (encoding fixes, error handling)
 */

// Constants
const SELECTORS = {
  FORM_NAME: 'input[title="Form Name"]',
  FORM_ID: 'input[title="Form ID"]',
  FORM_ID_LEGACY: '#tfa_dbFormId'
};

const SUPPORT_EMAIL = 'R-SalesforceCRMAdministrator@orlandohealth.com';
const SUPPORT_MAILTO = `<a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>`;

const MESSAGES = {
  LOADING: 'Reading...',
  NO_FORM: '🌐 No Orlando Health form found on this page',
  NO_FORM_DATA: '⚠️ Form fields are empty',
  PERMISSION_ERROR: '🔒 Permission Error',
  WRONG_PAGE: '🌐 Not an Orlando Health Form Page',
  UNKNOWN_ERROR: '❌ Unexpected Error',
  COPY_LABEL: 'Copy',
  COPIED_LABEL: 'Copied!',
  MISSING_VALUE: 'Not found on this form',
  MISSING_FIELDS: `⚠️ Form found, but Form Name and Form ID fields are missing. Please contact ${SUPPORT_MAILTO}`
};

/**
 * Executes script on the current tab to extract form information
 */
async function getFormInfoFromPage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab?.id) {
      return { 
        ok: false, 
        error: 'NO_TAB',
        message: 'Could not access current tab' 
      };
    }

    const frameResults = await chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      func: () => {
        // Check if this is a TFAForms context (direct page or iFrame).
        // Only check the frame's own URL — not innerHTML — so the SharePoint
        // parent frame doesn't false-trigger when it embeds the form via iFrame.
        const isTFAFormsContext = window.location.href.includes('tfaforms.net');

        const nameInput = document.querySelector('input[title="Form Name"]');
        const idInput =
          document.querySelector('input[title="Form ID"]') ||
          document.querySelector('#tfa_dbFormId');

        // Detect whether a TFAForms form is present in this frame at all,
        // even if the hidden Name/ID fields are missing.
        const hasForm =
          isTFAFormsContext ||
          !!document.querySelector('.wForm, form[action*="tfaforms.net"]');

        // Both fields missing — either a non-form frame, or a form frame
        // that's missing both hidden inputs.
        if (!nameInput && !idInput) {
          if (hasForm) {
            return { ok: false, error: 'MISSING_FIELDS' };
          }
          return null; // Not a TFAForms frame — skip silently
        }

        // null = field's input element is absent from the DOM
        // ""   = input present but empty
        const formName = nameInput ? (nameInput.value ?? "").trim() : null;
        const formId   = idInput   ? (idInput.value   ?? "").trim() : null;

        return { ok: true, formName, formId };
      }
    });

    // Prefer a frame that has both fields populated
    const bothFrame = frameResults.find(r =>
      r.result?.ok === true &&
      r.result.formName !== null &&
      r.result.formId !== null
    );
    if (bothFrame) return bothFrame.result;

    // Otherwise accept a frame with at least one field present
    const partialFrame = frameResults.find(r => r.result?.ok === true);
    if (partialFrame) return partialFrame.result;

    // Otherwise surface the first meaningful error (e.g. MISSING_FIELDS)
    const errorFrame = frameResults.find(r => r.result !== null);
    return errorFrame?.result ?? { ok: false, error: 'NO_FIELDS' };

  } catch (error) {
    // Handle specific Chrome extension errors
    if (error.message?.includes('Cannot access')) {
      return {
        ok: false,
        error: 'PERMISSION',
        message: 'Cannot access this page. Try refreshing or check permissions.'
      };
    }

    return {
      ok: false,
      error: 'UNKNOWN',
      message: error.message || 'An unexpected error occurred'
    };
  }
}

/**
 * Displays error state with appropriate message
 */
function showError(errorType, customMessage = null) {
  const statusEl = document.getElementById("status");
  const formDataEl = document.getElementById("form-data");

  if (!statusEl || !formDataEl) return;

  statusEl.style.display = '';
  statusEl.classList.remove("loading", "warning");
  statusEl.classList.add("error");
  formDataEl.classList.remove("visible");

  let message = customMessage;

  if (!message) {
    switch (errorType) {
      case 'MISSING_FIELDS':
        message = MESSAGES.MISSING_FIELDS;
        break;
      case 'NO_FIELDS':
        message = MESSAGES.NO_FORM;
        break;
      case 'EMPTY_FIELDS':
        message = MESSAGES.NO_FORM_DATA;
        break;
      case 'PERMISSION':
        message = MESSAGES.PERMISSION_ERROR;
        break;
      case 'NO_TAB':
        message = MESSAGES.WRONG_PAGE;
        break;
      default:
        message = MESSAGES.UNKNOWN_ERROR;
    }
  }

  statusEl.innerHTML = message;
}

/**
 * Renders a single field row. `value` may be:
 *   - a non-empty string: shown as a copyable value
 *   - "": the input exists on the page but is empty
 *   - null: the input is absent from the page
 * Returns a label describing the problem ('Form Name' / 'Form ID') if the
 * field is unusable, or null if the value is fine.
 */
function renderField(rowEl, valueEl, value, label) {
  if (value) {
    valueEl.textContent = value;
    rowEl.classList.remove('missing');
    rowEl.dataset.value = value;
    return null;
  }

  valueEl.textContent = MESSAGES.MISSING_VALUE;
  rowEl.classList.add('missing');
  rowEl.dataset.value = '';
  return label;
}

/**
 * Displays form information. Either field may be null (missing input) or ""
 * (empty input); in either case we render the row in a "missing" state and
 * surface a warning banner that names which field(s) were unusable.
 */
function showSuccess(formName, formId) {
  const statusEl = document.getElementById("status");
  const formDataEl = document.getElementById("form-data");
  const formNameValueEl = document.getElementById("form-name-value");
  const formIdValueEl = document.getElementById("form-id-value");
  const nameFieldEl = document.getElementById("name-field");
  const idFieldEl = document.getElementById("id-field");

  if (!statusEl || !formDataEl || !formNameValueEl || !formIdValueEl || !nameFieldEl || !idFieldEl) {
    console.error('Missing DOM elements in showSuccess');
    return;
  }

  const missing = [
    renderField(nameFieldEl, formNameValueEl, formName, 'Form Name'),
    renderField(idFieldEl, formIdValueEl, formId, 'Form ID')
  ].filter(Boolean);

  if (missing.length === 0) {
    statusEl.style.display = 'none';
  } else {
    statusEl.style.display = '';
    statusEl.classList.remove("loading", "error");
    statusEl.classList.add("warning");
    statusEl.innerHTML =
      `⚠️ ${missing.join(' and ')} not found on this form. ` +
      `Please contact ${SUPPORT_MAILTO}`;
  }

  formDataEl.classList.add("visible");
}

/**
 * Copies text to clipboard and shows feedback
 */
async function copyToClipboard(fieldElement, text) {
  const indicator = fieldElement.querySelector('.copy-indicator');
  
  if (!indicator) return;
  
  try {
    await navigator.clipboard.writeText(text);
    
    // Show success feedback
    fieldElement.classList.add("copied");
    indicator.textContent = MESSAGES.COPIED_LABEL;
    
    // Reset after 1.5 seconds
    setTimeout(() => {
      fieldElement.classList.remove("copied");
      indicator.textContent = MESSAGES.COPY_LABEL;
    }, 1500);
    
  } catch (error) {
    // Show error feedback
    indicator.textContent = '⚠️ Failed';
    indicator.style.color = '#dc2626';
    
    // Reset after 2 seconds
    setTimeout(() => {
      indicator.textContent = MESSAGES.COPY_LABEL;
      indicator.style.color = '';
    }, 2000);
  }
}

/**
 * Setup click handlers for fields
 */
function setupClickHandlers() {
  const nameFieldEl = document.getElementById("name-field");
  const idFieldEl = document.getElementById("id-field");
  
  if (!nameFieldEl || !idFieldEl) {
    console.error('Cannot setup click handlers - elements not found');
    return;
  }
  
  nameFieldEl.addEventListener("click", () => {
    const value = nameFieldEl.dataset.value;
    if (value) {
      copyToClipboard(nameFieldEl, value);
    }
  });

  idFieldEl.addEventListener("click", () => {
    const value = idFieldEl.dataset.value;
    if (value) {
      copyToClipboard(idFieldEl, value);
    }
  });
}

/**
 * Initialize extension popup
 */
async function init() {
  console.log('Init started');
  
  const statusEl = document.getElementById("status");
  
  if (!statusEl) {
    console.error('Status element not found!');
    return;
  }
  
  statusEl.classList.add("loading");
  statusEl.textContent = MESSAGES.LOADING;
  
  // Setup click handlers
  setupClickHandlers();

  try {
    const result = await getFormInfoFromPage();
    console.log('Result:', result);

    if (result.ok) {
      console.log('Showing success with:', result.formName, result.formId);
      showSuccess(result.formName, result.formId);
    } else {
      console.log('Showing error:', result.error, result.message);
      showError(result.error, result.message);
    }
  } catch (error) {
    console.error('Init error:', error);
    showError('UNKNOWN', error.message);
  }
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // DOM is already ready
  init();
}