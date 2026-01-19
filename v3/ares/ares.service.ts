import axios from 'axios';

import { HttpException } from '../errors';

export const getAresData = async (ico: string) => {
  try {
    const response = await axios({
      method: 'GET',
      url: `https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${ico}`,
    });
    const data = response.data;
    const resData = {
      ico: data.ico,
      dic: data.dic,
      name: data.obchodniJmeno,
      address: {
        street: data.sidlo.nazevUlice,
        city: data.sidlo.nazevObce,
        houseNumber: `${data.sidlo.cisloDomovni}${data.sidlo.cisloOrientacni ? '/' + data.sidlo.cisloOrientacni : ''}`,
        zip: data.sidlo.psc,
        country: data.sidlo.kodStatu,
      },
    };
    return resData;
  } catch (error) {
    throw new HttpException(400, 'ares.notFound');
  }
};
