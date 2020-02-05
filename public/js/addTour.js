/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const addTour = async (
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
) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/tours',
      data: {
        name,
        duration,
        price,
        maxGroupSize,
        summary,
        description,
        startDates: startDate,
        difficulty,
        locations,
        startLocation,
        images,
        imageCover
      }
    });

    if (res.data.status === 'success') {
      showAlert(
        'success',
        'The tour has been successfully added to the database'
      );
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
