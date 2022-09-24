import axios from 'axios';

export const logout = async (id) => {
  try {
    const response = await axios({
      method: 'GET',
      url: `/App/Users/${id}/Logout`,
    });
    if (response.data.status === 'Success') {
      window.location.assign(`/App`);
    }
  } catch (error) {
    console.log(error);
  }
};
