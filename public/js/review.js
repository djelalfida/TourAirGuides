/* eslint-disable */
import axios from 'axios';
import {
  showAlert
} from './alerts';

export const sendReview = async (review, rating, tour, user, booking) => {
  try {

    const res = await axios({
      method: 'POST',
      url: '/api/v1/reviews',
      data: {
        review,
        rating,
        tour,
        user,
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Your review has been posted!');


      const patchReview = await axios({
        method: 'PATCH',
        url: '/api/v1/bookings/postedReview',
        data: {
          id: booking,
          review: true
        }
      });


      window.setTimeout(() => {
        location.assign('/reviews');
      }, 1800);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
    console.log(values)
  }
};