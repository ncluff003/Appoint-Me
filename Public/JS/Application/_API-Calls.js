import axios from 'axios';
import qs from 'qs';

const fallbackURL = `https://www.placesapi.dev/api/v1`; // - Places API host

export const getCountryInformation = async (endpoint, user) => {
  try {
    const response = await axios({
      method: `POST`,
      // url: `https://www.placesapi.dev/api/v1/${endpoint}`,
      url: `/App/API/Data`,
      data: qs.stringify({
        endpoint: endpoint,
        user: user,
      }),
    });
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const getWorldInformation = async () => {
  try {
    const response = await axios({
      method: `GET`,
      url: `https://restcountries.com/v3.1/all`,
    });
    return response;
  } catch (error) {
    console.log(error);
  }
};

// export const getCountryInformation = async () => {
//   // languages[0] + alpha2Code -- These two concatonated should be the `locale` needed for the Intl API.
//   const worldInfo = await getWorldInformation();
//   console.log(worldInfo);
//   let language = navigator.language;
//   let myCountry = [];
//   myCountry = worldInfo.data.filter((country) => {
//     return `${country.languages[0].iso639_1}-${country.alpha2Code}` === language;
//   });
//   return myCountry[0];
// };
