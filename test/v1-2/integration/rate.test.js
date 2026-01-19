const request = require('supertest');
const pool = require('../../../v1-2/startup/db');
const { saveUser } = require('../../../v1-2/model/user-model');
const {
  parseCNBresponse,
  fetRatesFromCnb,
  getCZKrates,
} = require('../../../v1-2/model/rate-model');

const endpointName = 'rate';
let server;
let token;

let userId;

beforeAll(async () => {
  server = require('../../../v1-2/app');

  const userData = {
    number: 0,
    email: 'miroslav.sirina@koala42.com',
    password: 'lezlevel',
    emailPassword: 'asdad',
    jobTitle: 'developer',
    mobilePhone: 777932681,
    name: 'Miroslav',
    surname: 'Šiřina',
    username: 'miroslav.sirina',
  };

  user = await saveUser(userData);
  userId = user.user_id;

  let res = await request(server).post(`/api/login/`).send({
    email: userData.email,
    password: 'lezlevel',
  });
  token = res.body.authToken;

  await pool.query(`INSERT INTO "rate" ("rate_id", "date", "rates", "base", "success", "timestamp") VALUES
(1,	'2020-04-30 07:25:10.464',	'{"AED": 668.2776460383595, "AFN": 87.206228, "ALL": 123.648835, "AMD": 530.836088, "ANG": 1.955663, "AOA": 502.327654, "ARS": 65.220828, "AUD": 1.623887, "AWG": 2.006016, "AZN": 1.891639, "BAM": 1.952455, "BBD": 2.249911, "BDT": 94.383127, "BGN": 1.95575, "BHD": 0.420241, "BIF": 2078.455861, "BMD": 1.114454, "BND": 1.516726, "BOB": 7.705994, "BRL": 4.61183, "BSD": 1.114374, "BTC": 0.000135, "BTN": 78.917565, "BWP": 12.112733, "BYN": 2.271274, "BYR": 21843.289479, "BZD": 2.246117, "CAD": 1.460151, "CDF": 1849.992628, "CHF": 1.099542, "CLF": 0.029318, "CLP": 808.856056, "CNY": 7.883665, "COP": 3831.491287, "CRC": 647.830151, "CUC": 1.114454, "CUP": 29.533019, "CVE": 110.609624, "CZK": 25.584068, "DJF": 198.060804, "DKK": 7.471107, "DOP": 59.122119, "DZD": 133.08247, "EGP": 18.041557, "ERN": 16.717056, "ETB": 33.10217, "EUR": 1, "FJD": 2.45826, "FKP": 0.905917, "GBP": 0.858642, "GEL": 3.304351, "GGP": 0.858616, "GHS": 6.107272, "GIP": 0.905917, "GMD": 56.558536, "GNF": 10286.405835, "GTQ": 8.652897, "GYD": 232.577963, "HKD": 8.741027, "HNL": 27.560799, "HRK": 7.438023, "HTG": 106.862108, "HUF": 329.828092, "IDR": 15678.689696, "ILS": 3.945945, "IMP": 0.858616, "INR": 78.985225, "IQD": 1326.199718, "IRR": 46924.066845, "ISK": 139.484685, "JEP": 0.858616, "JMD": 151.785797, "JOD": 0.790192, "JPY": 120.984521, "KES": 115.624612, "KGS": 77.776628, "KHR": 4535.825502, "KMF": 492.755507, "KPW": 1003.087812, "KRW": 1306.607583, "KWD": 0.338025, "KYD": 0.928616, "KZT": 434.449008, "LAK": 9835.052569, "LBP": 1685.053782, "LKR": 202.591361, "LRD": 235.59842, "LSL": 16.490717, "LTL": 3.290692, "LVL": 0.674122, "LYD": 1.576921, "MAD": 10.69736, "MDL": 19.34476, "MGA": 4041.008391, "MKD": 61.476369, "MMK": 1707.762424, "MNT": 2994.721226, "MOP": 9.002121, "MRO": 397.860301, "MUR": 40.394329, "MVR": 17.16168, "MWK": 816.337599, "MXN": 21.32985, "MYR": 4.665657, "MZN": 69.514075, "NAD": 16.491412, "NGN": 402.877407, "NIO": 37.612963, "NOK": 10.170053, "NPR": 126.2677, "NZD": 1.744989, "OMR": 0.429075, "PAB": 1.114274, "PEN": 3.720603, "PGK": 3.772443, "PHP": 56.898984, "PKR": 173.798844, "PLN": 4.279111, "PYG": 7201.641937, "QAR": 4.057711, "RON": 4.757718, "RSD": 117.630384, "RUB": 71.051654, "RWF": 1033.655663, "SAR": 4.180013, "SBD": 9.205497, "SCR": 15.2735, "SDG": 50.270202, "SEK": 10.718614, "SGD": 1.516997, "SHP": 1.472078, "SLL": 10615.170453, "SOS": 646.383238, "SRD": 8.311565, "STD": 24028.498846, "SVC": 9.750146, "SYP": 573.943626, "SZL": 16.4974, "THB": 33.719005, "TJS": 10.797835, "TMT": 3.900587, "TND": 3.141653, "TOP": 2.580407, "TRY": 6.519999, "TTD": 7.547253, "TWD": 34.023712, "TZS": 2559.009549, "UAH": 27.742644, "UGX": 4111.892145, "USD": 1.114454, "UYU": 41.616741, "UZS": 10531.585765, "VEF": 11.130605, "VND": 25861.108484, "VUV": 130.487088, "WST": 2.981303, "XAF": 654.845592, "XAG": 0.062908, "XAU": 0.000749, "XCD": 3.011866, "XDR": 0.808031, "XOF": 657.527674, "XPF": 119.583881, "YER": 279.00327, "ZAR": 16.460257, "ZMK": 10031.419374, "ZMW": 14.742615, "ZWL": 358.854043}',	'EUR',	'1',	123);`);
});

afterAll(async () => {
  query = `DELETE FROM "users" WHERE "user_id" = '${userId}'`;
  try {
    res = await pool.query(query);
  } catch (error) {
    console.warn('Error executing query', query, error.stack);
  }

  await pool.query(
    `TRUNCATE "rate" CASCADE; SELECT setval('rate_rate_id_seq', 1, true);`,
  );

  await pool.end();
});

describe('/api/rate', () => {
  describe(`/api/${endpointName}`, () => {
    const date = new Date('2022-05-04T10:10:00');

    describe('Get CNB rates', () => {
      it('Should get CNB rates from CNB', async () => {
        const res = await getCZKrates(date.getTime());

        expect(res.source).toBe('api');
        expect(res.rates.IDR).toBe(0.0016140000000000002);
      });

      it('Should get CNB rates from db', async () => {
        const res = await getCZKrates(date.getTime());

        expect(res.source).toBe('db');
        expect(res.rates.IDR).toBe(0.0016140000000000002);
      });

      // it('Should return the right datestring with time zone', async () => {
      //   // 1646780400000, melo byt 9. 3.
      //   const res = await getCZKrates(1646780400000);

      //   console.warn(res.date);

      //   // expect(res.date).toBeOneOf([
      //   //   new Date('2022-09-03T00:00:00.000Z'),
      //   //   new Date('2022-09-03T02:00:00.000Z'),
      //   // ]);
      // });
    });

    describe('PUT /', () => {
      it('should update rate and return it', async () => {
        let aedExchangeRate = Math.random() * 1000;

        let data = {
          date: new Date(),
          base: 'EUR',
          timestamp: '123',
          success: true,
          rates: {
            AED: aedExchangeRate,
            AFN: 87.206228,
            ALL: 123.648835,
            AMD: 530.836088,
            ANG: 1.955663,
            AOA: 502.327654,
            ARS: 65.220828,
            AUD: 1.623887,
            AWG: 2.006016,
            AZN: 1.891639,
            BAM: 1.952455,
            BBD: 2.249911,
            BDT: 94.383127,
            BGN: 1.95575,
            BHD: 0.420241,
            BIF: 2078.455861,
            BMD: 1.114454,
            BND: 1.516726,
            BOB: 7.705994,
            BRL: 4.61183,
            BSD: 1.114374,
            BTC: 0.000135,
            BTN: 78.917565,
            BWP: 12.112733,
            BYN: 2.271274,
            BYR: 21843.289479,
            BZD: 2.246117,
            CAD: 1.460151,
            CDF: 1849.992628,
            CHF: 1.099542,
            CLF: 0.029318,
            CLP: 808.856056,
            CNY: 7.883665,
            COP: 3831.491287,
            CRC: 647.830151,
            CUC: 1.114454,
            CUP: 29.533019,
            CVE: 110.609624,
            CZK: 25.584068,
            DJF: 198.060804,
            DKK: 7.471107,
            DOP: 59.122119,
            DZD: 133.08247,
            EGP: 18.041557,
            ERN: 16.717056,
            ETB: 33.10217,
            EUR: 1,
            FJD: 2.45826,
            FKP: 0.905917,
            GBP: 0.858642,
            GEL: 3.304351,
            GGP: 0.858616,
            GHS: 6.107272,
            GIP: 0.905917,
            GMD: 56.558536,
            GNF: 10286.405835,
            GTQ: 8.652897,
            GYD: 232.577963,
            HKD: 8.741027,
            HNL: 27.560799,
            HRK: 7.438023,
            HTG: 106.862108,
            HUF: 329.828092,
            IDR: 15678.689696,
            ILS: 3.945945,
            IMP: 0.858616,
            INR: 78.985225,
            IQD: 1326.199718,
            IRR: 46924.066845,
            ISK: 139.484685,
            JEP: 0.858616,
            JMD: 151.785797,
            JOD: 0.790192,
            JPY: 120.984521,
            KES: 115.624612,
            KGS: 77.776628,
            KHR: 4535.825502,
            KMF: 492.755507,
            KPW: 1003.087812,
            KRW: 1306.607583,
            KWD: 0.338025,
            KYD: 0.928616,
            KZT: 434.449008,
            LAK: 9835.052569,
            LBP: 1685.053782,
            LKR: 202.591361,
            LRD: 235.59842,
            LSL: 16.490717,
            LTL: 3.290692,
            LVL: 0.674122,
            LYD: 1.576921,
            MAD: 10.69736,
            MDL: 19.34476,
            MGA: 4041.008391,
            MKD: 61.476369,
            MMK: 1707.762424,
            MNT: 2994.721226,
            MOP: 9.002121,
            MRO: 397.860301,
            MUR: 40.394329,
            MVR: 17.16168,
            MWK: 816.337599,
            MXN: 21.32985,
            MYR: 4.665657,
            MZN: 69.514075,
            NAD: 16.491412,
            NGN: 402.877407,
            NIO: 37.612963,
            NOK: 10.170053,
            NPR: 126.2677,
            NZD: 1.744989,
            OMR: 0.429075,
            PAB: 1.114274,
            PEN: 3.720603,
            PGK: 3.772443,
            PHP: 56.898984,
            PKR: 173.798844,
            PLN: 4.279111,
            PYG: 7201.641937,
            QAR: 4.057711,
            RON: 4.757718,
            RSD: 117.630384,
            RUB: 71.051654,
            RWF: 1033.655663,
            SAR: 4.180013,
            SBD: 9.205497,
            SCR: 15.2735,
            SDG: 50.270202,
            SEK: 10.718614,
            SGD: 1.516997,
            SHP: 1.472078,
            SLL: 10615.170453,
            SOS: 646.383238,
            SRD: 8.311565,
            STD: 24028.498846,
            SVC: 9.750146,
            SYP: 573.943626,
            SZL: 16.4974,
            THB: 33.719005,
            TJS: 10.797835,
            TMT: 3.900587,
            TND: 3.141653,
            TOP: 2.580407,
            TRY: 6.519999,
            TTD: 7.547253,
            TWD: 34.023712,
            TZS: 2559.009549,
            UAH: 27.742644,
            UGX: 4111.892145,
            USD: 1.114454,
            UYU: 41.616741,
            UZS: 10531.585765,
            VEF: 11.130605,
            VND: 25861.108484,
            VUV: 130.487088,
            WST: 2.981303,
            XAF: 654.845592,
            XAG: 0.062908,
            XAU: 0.000749,
            XCD: 3.011866,
            XDR: 0.808031,
            XOF: 657.527674,
            XPF: 119.583881,
            YER: 279.00327,
            ZAR: 16.460257,
            ZMK: 10031.419374,
            ZMW: 14.742615,
            ZWL: 358.854043,
          },
        };

        let res = await request(server)
          .put(`/api/rate/`)
          .send(data)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body.rates.AED).toBe(aedExchangeRate);

        expect(res.body).toHaveProperty('timestamp', data.timestamp);

        data.success = undefined;
        res = await request(server)
          .put(`/api/rate/`)
          .send()
          .set('x-auth-token', token);

        expect(res.status).toBe(400);
      });
    });
  });
});
