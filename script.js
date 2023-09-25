// DOM Elements

const allOptions = document.querySelectorAll('.option')
const allBackModalOptions = [
  ...document.querySelectorAll('.back-modal .option'),
]
const allInputFields = document.querySelectorAll('input#pledge')
const allPledgeEls = document.querySelectorAll('.back-modal .option-pledge')
const allErrors = document.querySelectorAll('.error')

const main = document.querySelector('.main')
const primaryNav = document.querySelector('.primary-nav__list')
const mobileNavToggle = document.querySelector('.mobile-nav-toggle')

const backModal = document.querySelector('.back-modal')
const openBackModalBtn = document.querySelector('.open-back-modal')
const closeBackModalBtn = document.querySelector('.close-back-modal')
const projectOptionsList = document.querySelector('.project .options')
const bookmarkButton = document.querySelector('.btn--bookmark')
const progressBar = document.querySelector('.progress-bar')
const currBackedEl = document.querySelector('.current-backed')
const targetBackedEl = document.querySelector('.target-backed')
const numBackedEl = document.querySelector('.num-backed')
const submittedModal = document.querySelector('.submitted-modal')
const closeSubmittedModalBtn = document.querySelector('.close-submitted-modal')

const store = {
  products: [
    { name: 'bamboo-stand', stock: 101, minPledge: 25 },
    { name: 'black-edition-stand', stock: 64, minPledge: 75 },
    { name: 'mahogany-special-edition', stock: 2, minPledge: 200 },
  ],
  stats: {
    backTarget: 100000,
    backCurr: 89914,
    NumBackers: 5007,
  },
}

// RenderUI

function renderUI() {
  // Stats
  currBackedEl.innerText = formatCurrency(store.stats.backCurr)
  targetBackedEl.innerText = formatCurrency(store.stats.backTarget)
  numBackedEl.innerText = formatCurrency(store.stats.NumBackers)

  // Progress bar
  progressBar.setAttribute('value', store.stats.backCurr)

  // Options
  allOptions.forEach((option) => {
    const key = option.dataset.option
    if (key !== 'no-reward') {
      const stockEl = option.querySelector('.option-stock .number')
      const pledgeEl = option.querySelector('.option-pledge .value')

      const [product] = store.products.filter((p) => p.name === key)

      stockEl.innerText = product.stock
      pledgeEl.innerText = formatCurrency(product.minPledge)

      if (product.stock === 0) {
        option.setAttribute('aria-disabled', 'true')

        if (option.querySelector('a.btn') !== null) {
          option.querySelector('a.btn').innerText = 'Out of stock'
        }
      }
    }
  })
}

renderUI()

// Primary Navigation

mobileNavToggle.addEventListener('click', () => {
  const isOpen = primaryNav.dataset.open === 'true' ? true : false

  if (isOpen) {
    closeNav()
  } else {
    openNav()
  }
})

document.addEventListener('click', (e) => {
  if (e.target.matches('.overlay')) closeNav()
})

function openNav() {
  primaryNav.dataset.open = 'true'
  mobileNavToggle.setAttribute('aria-expanded', 'true')
  main.classList.add('overlay')
}

function closeNav() {
  primaryNav.dataset.open = 'false'
  mobileNavToggle.setAttribute('aria-expanded', 'false')
  main.classList.remove('overlay')
}

// Back Modal

openBackModalBtn.addEventListener('click', () => {
  backModal.showModal()
  backModal.blur()
})
closeBackModalBtn.addEventListener('click', () => {
  backModal.close()
})
backModal.addEventListener('click', (e) => {
  closeOnOverlay(e, backModal)
})

// Prevent Closing of Modal on Enter

allInputFields.forEach((el) =>
  el.addEventListener('keypress', (e) => {
    if (e.keyCode === 13) {
      e.preventDefault()
    }
  })
)

// Selecting Product

backModal.addEventListener('change', (e) => {
  if (!e.target.matches('.select-btn')) return

  const selected = e.target.closest('.option')
  selectProduct(selected)
})

// Option Links

projectOptionsList.addEventListener('click', (e) => {
  if (!e.target.matches('.btn')) return

  const target = e.target.closest('.option').dataset.option
  const [targetEl] = allBackModalOptions.filter(
    (el) => el.dataset.option === target
  )

  selectProduct(targetEl)
  backModal.showModal()
  backModal.blur()
  targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
})

// Submitting a Pledge

backModal.addEventListener('submit', (e) => {
  if (!e.target.matches('.option-form')) return

  e.preventDefault()

  allErrors.forEach((err) => {
    err.classList.add('hidden')
  })
  allInputFields.forEach((el) => {
    el.setAttribute('aria-invalid', 'false')
  })
  allPledgeEls.forEach((el) => {
    el.classList.remove('mark-red')
  })

  const input = e.target.querySelector('#pledge')
  const option = input.closest('.option').getAttribute('data-option')

  const isValid = validateInput(input)

  if (isValid) {
    store.stats.backCurr += parseFloat(input.value)
    store.stats.NumBackers++

    if (option !== 'no-reward') {
      const [product] = store.products.filter((p) => p.name === option)
      product.stock--
    }

    input.value = ''

    allBackModalOptions.forEach((el) => {
      el.setAttribute('aria-selected', 'false')
      el.querySelector('.expandable-wrapper').classList.remove('open')
    })

    backModal.close()
    submittedModal.showModal()
    renderUI()
  }
})

// Closing Submit Modal

closeSubmittedModalBtn.addEventListener('click', () => {
  submittedModal.close()
})

submittedModal.addEventListener('click', (e) => {
  closeOnOverlay(e, submittedModal)
})

// Bookmarking

bookmarkButton.addEventListener('click', () => {
  if (bookmarkButton.getAttribute('data-bookmarked') === 'false') {
    bookmarkButton.setAttribute('data-bookmarked', 'true')
    bookmarkButton.querySelector('span').innerText = 'bookmarked'
  } else {
    bookmarkButton.setAttribute('data-bookmarked', 'false')
    bookmarkButton.querySelector('span').innerText = 'bookmark'
  }
})

// Helper functions

function selectProduct(product) {
  allBackModalOptions.forEach((el) => {
    el.setAttribute('aria-selected', 'false')
    el.querySelector('.expandable-wrapper').classList.remove('open')
  })

  product.setAttribute('aria-selected', 'true')
  product.querySelector('.expandable-wrapper').classList.add('open')
  product.scrollIntoView({ behavior: 'smooth', block: 'center' })
  product.querySelector('#pledge').focus()
}

function validateInput(input) {
  const value = input.value
  const minPledge = input.getAttribute('min')
  const pattern = /^\d+\.?\d{0,2}$/
  const errorEl = input.nextElementSibling

  if (!pattern.test(value)) {
    input.setAttribute('aria-invalid', 'true')
    errorEl.innerText = 'Please enter a valid pledge'
    errorEl.classList.remove('hidden')
    return false
  } else if (parseFloat(value) < minPledge) {
    const pledgeEl = input.closest('.option').querySelector('.option-pledge')
    pledgeEl.classList.add('mark-red')
    input.setAttribute('aria-invalid', 'true')
    errorEl.innerText = 'Entered pledge is too low'
    errorEl.classList.remove('hidden')
    return false
  } else return true
}

function closeOnOverlay(e, modal) {
  const modalDimensions = modal.getBoundingClientRect()
  if (
    e.clientX < modalDimensions.left ||
    e.clientX > modalDimensions.right ||
    e.clientY < modalDimensions.top ||
    e.clientY > modalDimensions.bottom
  ) {
    modal.close()
  }
}

function formatCurrency(num) {
  const formattedNum = new Intl.NumberFormat(navigator.language).format(num)
  return `$${formattedNum}`
}
