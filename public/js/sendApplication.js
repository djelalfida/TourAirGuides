/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const sendApplication = async (name, birthdate, address, zip, city, aboutGuide) => {
  try {

    const res = await axios({
      method: 'POST',
      url: '/api/v1/guide',
      data: {
         name,
         birthdate,
         address,
         zip,
         city,
         aboutGuide
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Your application has been successfully sent!');
      window.setTimeout(() => {
        location.assign('/sentApplications');
      }, 1800);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
    console.log(values)
  }
};
