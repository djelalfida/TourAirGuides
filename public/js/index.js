/* eslint-disable */
import '@babel/polyfill';
import {
  displayMap
} from './mapbox';
import {
  login,
  logout
} from './login';
import {
  updateSettings
} from './UpdateSettings';
import {
  bookTour
} from './stripe';
import {
  signup
} from './signup';
import {
  disableMe
} from './delete';
import {
  showAlert
} from './alerts';
import {
  addTour
} from './addTour';
import {
  sendApplication
} from './sendApplication'
import {
  sendReview
} from './review'


// DOM Elements
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const tourDataForm = document.querySelector('.form-tour-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
const invoiceBtn = document.getElementById('btn-invoice');
const signupForm = document.querySelector('.form--signup');
const deleteForm = document.querySelector('.form-user-delete');
const applicationForm = document.querySelector('.form-application-data');
const reviewForm = document.querySelector('.form-review-data');

// DELEGATION
if (mapBox) {
  const locations = JSON.parse(
    document.getElementById('map').dataset.locations
  );
  displayMap(locations);
}
if (loginForm)
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

if (reviewForm) {
  reviewForm.addEventListener('submit', e => {
    e.preventDefault();

    const review = document.getElementById('review').value;
    const user = document.getElementById('userid').value;
    const selectTour = document.getElementById('tours');
    const tour = selectTour.options[selectTour.selectedIndex].value.split(',')[0];
    const booking = selectTour.options[selectTour.selectedIndex].value.split(',')[1];


    const id = document.querySelector('input[name="rating"]:checked').value;
    console.log(id);


    sendReview(review, id, tour, user, booking);
  });
}

if (applicationForm) {
  applicationForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const birthdate = document.getElementById('birth').value;
    const address = document.getElementById('address').value;
    const zip = document.getElementById('zip').value;
    const city = document.getElementById('city').value;
    const aboutGuide = document.getElementById('description').value;

    sendApplication(name, birthdate, address, zip, city, aboutGuide);
  });
}

if (signupForm) {
  signupForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    document.querySelector('#sign-up').textContent = 'Creating...';

    signup(name, email, password, passwordConfirm);
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm) {
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateSettings(form, 'data');
  });
}









if (tourDataForm) {
  tourDataForm.addEventListener('submit', e => {
    e.preventDefault();

    const imageCover = document.getElementById('photo').files[0];

    const name = document.getElementById('name').value;

    const duration = document.getElementById('duration').value;

    const maxGroupSize = document.getElementById('maxGroupSize').value;

    const price = document.getElementById('price').value;

    const summary = document.getElementById('summary').value;

    const description = document.getElementById('description').value;

    // const imageCover = 'tour-1-cover.jpg';

    const startDate = document.getElementById('start-dates').value;

    const difficulty = document.getElementById('difficulty').value;

    const locid = document.getElementById('location-id').value;
    const locdesc = document.getElementById('location-desc').value;
    const coloc = document
      .getElementById('coordinates-location')
      .value.split(',');

    const startLocation = {
      type: 'Point',
      description: 'Miami, USA',
      coordinates: [-80.185942, 25.774772],
      address: '301 Biscayne Blvd, Miami, FL 33132, USA'
    };

    const locations = [{
      type: 'Point',
      id: locid,
      description: locdesc,
      coordinates: coloc,
      day: '1'
    }];

    const images = ['tour-7-1.jpg', 'tour-7-2.jpg', 'tour-7-3.jpg'];

    addTour(
      name,
      duration,
      maxGroupSize,
      price,
      summary,
      description,
      startDate,
      difficulty,
      locations,
      startLocation,
      images,
      imageCover
    );
  });
}

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings({
        passwordCurrent,
        password,
        passwordConfirm
      },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

if (bookBtn)
  bookBtn.addEventListener('click', e => {
    e.target.textContent = 'Processing...';
    const {
      tourId
    } = e.target.dataset;
    bookTour(tourId);
  });


// if (invoiceBtn) {
//   invoiceBtn.addEventListener('click', e => {
//     e.target.textContent = 'Processing...'

//     const
//   })
// }


if (deleteForm) {
  deleteForm.addEventListener('submit', e => {
    e.preventDefault();
    disableMe();
  });
}

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 20);