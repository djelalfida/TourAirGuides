/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const disableMe = async () => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: '/api/v1/users/deleteMe',
      data: null
    });

    const log = await axios({
      method: 'GET',
      url: '/api/v1/users/logout'
    });

    showAlert('success', 'Account deleted successfully!');
    window.setTimeout(() => {
      location.assign('/?alert=delete');
    }, 400);
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
