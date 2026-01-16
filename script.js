const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const revealElements = document.querySelectorAll('[data-reveal]');
if (revealElements.length) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal');
        }
      });
    },
    { threshold: 0.15 }
  );

  revealElements.forEach((el) => revealObserver.observe(el));
}

const backToTop = document.getElementById('back-to-top');
if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('show', window.scrollY > 300);
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const screenshotLinks = document.querySelectorAll('.screenshot-link');

function finOpenLightbox(src, alt) {
  if (!lightbox || !lightboxImage) return;
  lightboxImage.src = src;
  lightboxImage.alt = alt || 'Screenshot preview';
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function finCloseLightbox() {
  if (!lightbox || !lightboxImage) return;
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  lightboxImage.src = '';
  document.body.style.overflow = '';
}

if (screenshotLinks.length) {
  screenshotLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      const img = link.querySelector('img');
      if (!href || !img) return;
      event.preventDefault();
      finOpenLightbox(href, img.getAttribute('alt') || '');
    });
  });
}

if (lightbox) {
  lightbox.querySelectorAll('[data-lightbox-close]').forEach((el) => {
    el.addEventListener('click', finCloseLightbox);
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox.classList.contains('open')) {
      finCloseLightbox();
    }
  });
}

const contactForm = document.getElementById('contact-form');
const toast = document.getElementById('toast');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    const name = formData.get('name');
    const company = formData.get('company');
    const email = formData.get('email');
    const need = formData.get('need');
    const message = formData.get('message');

    const subject = encodeURIComponent('Demo request from ' + name);
    const body = encodeURIComponent(
      `Name: ${name}\nCompany: ${company}\nEmail: ${email}\nNeed: ${need}\n\nMessage:\n${message}`
    );

    window.location.href = `mailto:futureisnow.solutions@gmail.com?subject=${subject}&body=${body}`;

    if (toast) {
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3000);
    }

    contactForm.reset();
  });
}

const hashLinks = document.querySelectorAll('a[href^="#"]');
hashLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href');
    const target = document.querySelector(targetId);
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      history.replaceState(null, '', targetId);
    }
  });
});

const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="index.html#"], .nav-links a[href^="#"]');
if (sections.length && navAnchors.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navAnchors.forEach((anchor) => {
            const href = anchor.getAttribute('href');
            const target = href.includes('#') ? href.split('#')[1] : null;
            anchor.classList.toggle('active', target === id);
          });
        }
      });
    },
    { rootMargin: '-40% 0px -50% 0px' }
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

const checkoutForm = document.getElementById('checkout-form');
const webhookConfigForm = document.getElementById('webhook-config-form');
const setupFeeEl = document.getElementById('setup-fee');
const unitPriceEl = document.getElementById('unit-price');
const planMonthsEl = document.getElementById('plan-months');
const subtotalPriceEl = document.getElementById('subtotal-price');
const discountPriceEl = document.getElementById('discount-price');
const totalPriceEl = document.getElementById('total-price');
const curlOutputEl = document.getElementById('curl-output');
const jsonOutputEl = document.getElementById('json-output');
const calculateTotalBtn = document.getElementById('calculate-total');
const employeeWarningEl = document.getElementById('employee-warning');
const currentLicenseLabelEl = document.getElementById('current-license-label');

function finFormatMoney(amount, currency) {
  const numberAmount = Number(amount);
  if (!Number.isFinite(numberAmount)) return 'Not configured';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(numberAmount);
  } catch {
    return `${numberAmount.toFixed(2)} ${currency}`;
  }
}

function finGetPricingConfig() {
  const root = document.documentElement;
  const setupFee = Number(root.dataset.setupFee || '0');
  const pricePerEmployeeMonth = Number(root.dataset.pricePerEmployeeMonth || '0');
  const annualDiscount = Number(root.dataset.annualDiscount || '0');
  const currency = root.dataset.currency || 'EGP';
  return { setupFee, pricePerEmployeeMonth, annualDiscount, currency };
}

function finBuildPayload({ customerEmail, plan, employeeLimit, customerType, currentLicenseKey }) {
  const validDays = plan === '1_year' ? 365 : 180;
  const payload = {
    customer_email: customerEmail,
    plan,
    valid_days: validDays,
    employee_limit: employeeLimit,
  };

  if (customerType === 'current' && currentLicenseKey) {
    payload.current_license_key = currentLicenseKey;
  }

  return payload;
}

function finUpdateCheckoutSummary() {
  if (!checkoutForm || !unitPriceEl || !totalPriceEl || !setupFeeEl || !planMonthsEl || !subtotalPriceEl || !discountPriceEl) return;

  const { setupFee, pricePerEmployeeMonth, annualDiscount, currency } = finGetPricingConfig();
  const formData = new FormData(checkoutForm);
  const plan = String(formData.get('plan') || '');
  const employeeLimitInput = checkoutForm.querySelector('input[name="employee_limit"]');
  const employeeLimit = Number(formData.get('employee_limit') || '0');
  const minEmployees = employeeLimitInput ? Number(employeeLimitInput.getAttribute('min') || '0') : 0;
  const effectiveEmployees = Number.isFinite(minEmployees) && minEmployees > 0 ? Math.max(employeeLimit, minEmployees) : employeeLimit;
  const months = plan === '1_year' ? 12 : 6;
  const discountRate = plan === '1_year' ? annualDiscount : 0;

  planMonthsEl.textContent = Number.isFinite(months) ? String(months) : '-';

  if (
    !pricePerEmployeeMonth ||
    !Number.isFinite(pricePerEmployeeMonth) ||
    !Number.isFinite(setupFee) ||
    !Number.isFinite(annualDiscount)
  ) {
    setupFeeEl.textContent = 'Not configured';
    unitPriceEl.textContent = 'Not configured';
    subtotalPriceEl.textContent = 'Not configured';
    discountPriceEl.textContent = '-';
    totalPriceEl.textContent = 'Not configured';
    return;
  }

  setupFeeEl.textContent = finFormatMoney(setupFee, currency);
  unitPriceEl.textContent = `${finFormatMoney(pricePerEmployeeMonth, currency)} / employee / month`;
  const subtotal = pricePerEmployeeMonth * effectiveEmployees * months;
  subtotalPriceEl.textContent = finFormatMoney(subtotal, currency);
  const discountAmount = subtotal * discountRate;
  discountPriceEl.textContent = discountRate ? `- ${finFormatMoney(discountAmount, currency)} (${Math.round(discountRate * 100)}%)` : '-';
  const total = setupFee + subtotal - discountAmount;
  totalPriceEl.textContent = finFormatMoney(total, currency);
}

function finUpdateEmployeeWarning() {
  if (!checkoutForm || !employeeWarningEl) return;
  const employeeLimitInput = checkoutForm.querySelector('input[name="employee_limit"]');
  if (!employeeLimitInput) return;

  const employeeLimit = Number(employeeLimitInput.value || '0');
  const minEmployees = Number(employeeLimitInput.getAttribute('min') || '0');
  const showWarning = Number.isFinite(employeeLimit) && Number.isFinite(minEmployees) && minEmployees > 0 && employeeLimit > 0 && employeeLimit < minEmployees;
  employeeWarningEl.hidden = !showWarning;
}

function finShellEscapeSingleQuotes(value) {
  return String(value).replace(/'/g, "'\"'\"'");
}

function finRenderWebhookRequest(payload) {
  if (!webhookConfigForm || !curlOutputEl || !jsonOutputEl) return;

  const configData = new FormData(webhookConfigForm);
  const webhookUrl = String(configData.get('webhook_url') || '').trim();
  const webhookSecret = String(configData.get('webhook_secret') || '');
  const json = JSON.stringify(payload, null, 2);

  jsonOutputEl.textContent = json;

  if (!webhookUrl) {
    curlOutputEl.textContent = 'Add your Production Webhook URL to generate the cURL command.';
    return;
  }

  const curl = [
    `curl -X POST '${finShellEscapeSingleQuotes(webhookUrl)}' \\`,
    `  -H 'Content-Type: application/json' \\`,
    `  -H 'x-fin-webhook-secret: ${finShellEscapeSingleQuotes(webhookSecret)}' \\`,
    `  --data-raw '${finShellEscapeSingleQuotes(json)}'`,
  ].join('\n');

  curlOutputEl.textContent = curl;
}

function finApplyPlanFromQueryParam() {
  if (!checkoutForm) return;
  const params = new URLSearchParams(window.location.search);
  const plan = params.get('plan');
  if (!plan) return;

  const planSelect = checkoutForm.querySelector('select[name="plan"]');
  if (!planSelect) return;

  if (plan === '6_months' || plan === '1_year') {
    planSelect.value = plan;
    finUpdateCheckoutSummary();
  }
}

function finUpdateCustomerTypeUI() {
  if (!checkoutForm || !currentLicenseLabelEl) return;
  const customerTypeSelect = checkoutForm.querySelector('select[name="customer_type"]');
  const customerType = customerTypeSelect ? String(customerTypeSelect.value || 'new') : 'new';
  const currentKeyInput = checkoutForm.querySelector('input[name="current_license_key"]');

  const isCurrent = customerType === 'current';
  currentLicenseLabelEl.hidden = !isCurrent;
  if (currentKeyInput) {
    currentKeyInput.required = isCurrent;
    if (!isCurrent) currentKeyInput.value = '';
  }
}

if (checkoutForm) {
  checkoutForm.addEventListener('input', finUpdateEmployeeWarning);
  checkoutForm.addEventListener('input', finUpdateCustomerTypeUI);
  checkoutForm.addEventListener('change', finUpdateCustomerTypeUI);
  finUpdateEmployeeWarning();
  finUpdateCustomerTypeUI();

  if (calculateTotalBtn) {
    calculateTotalBtn.addEventListener('click', () => {
      finUpdateEmployeeWarning();
      finUpdateCheckoutSummary();
    });
  }

  finUpdateCheckoutSummary();
  finApplyPlanFromQueryParam();
  finUpdateCustomerTypeUI();

  checkoutForm.addEventListener('submit', (event) => {
    event.preventDefault();
    finUpdateEmployeeWarning();
    finUpdateCustomerTypeUI();
    const formData = new FormData(checkoutForm);
    const customerEmail = String(formData.get('customer_email') || '').trim();
    const plan = String(formData.get('plan') || '');
    const employeeLimit = Number(formData.get('employee_limit') || '0');
    const customerType = String(formData.get('customer_type') || 'new');
    const currentLicenseKey = String(formData.get('current_license_key') || '').trim();
    const payload = finBuildPayload({ customerEmail, plan, employeeLimit, customerType, currentLicenseKey });
    finRenderWebhookRequest(payload);
  });
}

if (webhookConfigForm) {
  webhookConfigForm.addEventListener('input', () => {
    if (!checkoutForm) return;
    const formData = new FormData(checkoutForm);
    const customerEmail = String(formData.get('customer_email') || '').trim();
    const plan = String(formData.get('plan') || '');
    const employeeLimit = Number(formData.get('employee_limit') || '0');
    const payload = finBuildPayload({ customerEmail, plan, employeeLimit });
    finRenderWebhookRequest(payload);
  });
}
