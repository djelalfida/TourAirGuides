/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const signup = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm
      }
    });

    const resMail = await axios({
      method: 'POST',
      url: '/api/v1/users/verifyMail/',
      data: {
        email
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Your account has been successfully created');

      window.setTimeout(() => {
        location.assign('/login');
      }, 400);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
