const request = require('supertest');
const server = require('../../../v1-2/app');
const {
  createMockUser,
  loginMockUser,
  deleteMockUser,
} = require('../utility/user');
const {
  createMockCustomer,
  deleteMockCustomer,
  createMockCustomerConstact,
  deleteMockCustomerConstact,
} = require('../utility/customer');
const { createMockCarrier, deleteMockCarrier } = require('../utility/carrier');
const {
  createMockDispatcher,
  deleteMockDispatcher,
} = require('../utility/dispatcher');
const {
  createMockCommission,
  deleteMockCommission,
  updateMockCommission,
} = require('../utility/commission');
const {
  getInvoice,
  createMockInvoice,
  deleteMockInvoice,
} = require('../utility/invoice');
const { getNewInvoiceNumber } = require('../../../v1-2/model/v2/invoice-model');

const {
  createMockCommissionDischarge,
  deleteMockCommissionDischarge,
} = require('../utility/discharge');

let carrier,
  dispatcher,
  customer,
  commission,
  commissionEU,
  commissionThirdCountry,
  invoice,
  invoiceEU,
  invoiceThirdCountry,
  putObject,
  commissionDischarges = [],
  customerContacts = [],
  paginationCommissions = [],
  paginationInvoices = [];

beforeAll(async () => {
  user = await createMockUser();
  userId = user.user_id;
  token = await loginMockUser();

  customer = await createMockCustomer({
    number: 0,
    ts_added: 1604481541011,
    addedBy: 'miroslav.sirina@koala42.com',
    company: 'Mockary',
    note: 'This is note',
    place: {
      city: 'Malenovice',
      street: 'Tečovice 364',
      country: 'Česká republika',
      latitude: 49.2166667,
      longitude: 17.6,
      postalCode: '763 02',
      countryCode: 'CZ',
    },
    defaultDueDate: 12,
  });

  customerWithoutContact = await createMockCustomer({
    number: 0,
    ts_added: 1604481541011,
    addedBy: 'miroslav.sirina@koala42.com',
    company: 'Mockary',
    note: 'This is note',
    place: {
      city: 'Malenovice',
      street: 'Tečovice 364',
      country: 'Česká republika',
      latitude: 49.2166667,
      longitude: 17.6,
      postalCode: '763 02',
      countryCode: 'CZ',
    },
  });

  customerContacts.push(
    await createMockCustomerConstact(customer.customer_id, {
      email: `${Math.floor(Math.random() * 10)}@koala42.cz`,
      firstName: 'Miroslav',
      lastName: 'Šiřina',
      phone: '123465',
    }),
  );
  customerContacts.push(
    await createMockCustomerConstact(customer.customer_id, {
      email: `${Math.floor(Math.random() * 10)}@koala42.cz`,
      firstName: 'Miroslav',
      lastName: 'Šiřina',
      phone: '123465',
    }),
  );
  customerContacts.push(
    await createMockCustomerConstact(customer.customer_id, {
      email: `${Math.floor(Math.random() * 10)}@koala42.cz`,
      firstName: 'Miroslav',
      lastName: 'Šiřina',
      phone: '123465',
    }),
  );

  carrier = await createMockCarrier({
    ts_added: 1604317296594,
    addedBy: 'miroslav.sirina@koala42.com',
    company: 'kendama.cz',
    companyRegistrationNumber: 86916041,
    taxId: 'CZ801031411',
    place: {
      street: 'A. Randýskové 2410',
      city: 'Zlín',
      country: 'Česká republika',
      countryCode: 'CZ',
      postalCode: '76001',
      latitude: 49.2333333,
      longitude: 17.6666667,
    },
  });

  dispatcher = await createMockDispatcher(carrier, [
    {
      firstName: 'Miroslav',
      lastName: 'Šiřina',
      email: 'mirek@kendama.cz',
      phone: '777932681',
      language_id: 41,
    },
  ]);

  dispatcher.dispatcher_id = dispatcher[0].dispatcher_id;

  commission = await createMockCommission(customer, carrier, dispatcher, {
    qid: 'PECZ-4513-20',
    state: 1,
    relation: 'PECZ',
    customerContact_id: null,
    tsAdded: 1604483386562,
    addedBy: 'miroslav.sirina@koala42.com',
    tsEdited: 1604483386562,
    editedBy: 'miroslav.sirina@koala42.com',
    tsEnteredCarrier: 1604483365414,
    enteredCarrierByNumber: 13,
    enteredCarrierBy: 'Miroslav Šiřina',
    week: 45,
    year: 2020,
    carrierOrderSent: true,
    loadingConfirmationSent: true,
    dischargeConfirmationSent: true,
    orderConfirmationSent: true,
    carriersTable: [],
    loadingRadius: 50,
    dischargeRadius: 50,
    vat: 1,
    currencyCarrier: 'CZK',
    priceCustomer: 1000,
    currencyCustomer: 'CZK',
    notification: false,
    orderDate: 1604483386562,
    orderNumber: '4587',
  });

  commissionEU = await createMockCommission(customer, carrier, dispatcher, {
    qid: 'PECZ-4513-20',
    state: 1,
    relation: 'PEDK',
    customerContact_id: null,
    tsAdded: 1604483386562,
    addedBy: 'miroslav.sirina@koala42.com',
    tsEdited: 1604483386562,
    editedBy: 'miroslav.sirina@koala42.com',
    tsEnteredCarrier: 1604483365414,
    enteredCarrierByNumber: 13,
    enteredCarrierBy: 'Miroslav Šiřina',
    week: 45,
    year: 2020,
    carrierOrderSent: true,
    loadingConfirmationSent: true,
    dischargeConfirmationSent: true,
    orderConfirmationSent: true,
    carriersTable: [],
    loadingRadius: 50,
    dischargeRadius: 50,
    vat: 1,
    currencyCarrier: 'CZK',
    priceCustomer: 1000,
    currencyCustomer: 'EUR',
    notification: false,
  });

  commissionThirdCountry = await createMockCommission(
    customer,
    carrier,
    dispatcher,
    {
      qid: 'PECZ-4513-20',
      state: 1,
      relation: 'CZRU',
      customerContact_id: null,
      tsAdded: 1604483386562,
      addedBy: 'miroslav.sirina@koala42.com',
      tsEdited: 1604483386562,
      editedBy: 'miroslav.sirina@koala42.com',
      tsEnteredCarrier: 1604483365414,
      enteredCarrierByNumber: 13,
      enteredCarrierBy: 'Miroslav Šiřina',
      week: 45,
      year: 2020,
      carrierOrderSent: true,
      loadingConfirmationSent: true,
      dischargeConfirmationSent: true,
      orderConfirmationSent: true,
      carriersTable: [],
      loadingRadius: 50,
      dischargeRadius: 50,
      vat: 1,
      currencyCarrier: 'CZK',
      priceCustomer: 1000,
      currencyCustomer: 'CZK',
      notification: false,
    },
  );

  invoice = await createMockInvoice({
    user_id: userId,
  });
  invoiceEU = await createMockInvoice({
    user_id: userId,
  });
  invoiceThirdCountry = await createMockInvoice({
    user_id: userId,
  });
  await updateMockCommission(commission.commission_id, {
    invoice_id: invoice.invoice_id,
  });
  await updateMockCommission(commissionEU.commission_id, {
    invoice_id: invoiceEU.invoice_id,
  });
  await updateMockCommission(commissionThirdCountry.commission_id, {
    invoice_id: invoiceThirdCountry.invoice_id,
  });

  // 23 invoices for pagination
  let body = {
    qid: 'PECZ-4513-20',
    state: 1,
    relation: 'CZRU',
    customerContact_id: null,
    tsAdded: 1604483386562,
    addedBy: 'miroslav.sirina@koala42.com',
    tsEdited: 1604483386562,
    editedBy: 'miroslav.sirina@koala42.com',
    tsEnteredCarrier: 1604483365414,
    enteredCarrierByNumber: 13,
    enteredCarrierBy: 'Miroslav Šiřina',
    week: 45,
    year: 2020,
    carrierOrderSent: true,
    loadingConfirmationSent: true,
    dischargeConfirmationSent: true,
    orderConfirmationSent: true,
    carriersTable: [],
    loadingRadius: 50,
    dischargeRadius: 50,
    vat: 1,
    currencyCarrier: 'CZK',
    priceCustomer: 1000,
    currencyCustomer: 'CZK',
    notification: false,
  };

  for await (const i of new Array(4).keys()) {
    commissionDischarges.push(
      await createMockCommissionDischarge({
        commission_id: commission.commission_id,
        number: i,
        date: i + 1,
      }),
    );
  }

  for await (const i of new Array(23).keys()) {
    body.qid = String(i);
    let com = await createMockCommission(customer, carrier, dispatcher, body);
    paginationCommissions.push(com);
    let inv = await createMockInvoice({ user_id: userId });
    paginationInvoices.push(inv);
    await updateMockCommission(com.commission_id, {
      invoice_id: inv.invoice_id,
    });
  }
}, 30000);

afterAll(async () => {
  for await (const cd of commissionDischarges) {
    await deleteMockCommissionDischarge(cd);
  }

  for await (const commission of paginationCommissions) {
    await deleteMockCommission(commission);
  }
  for await (const invoice of paginationInvoices) {
    await deleteMockInvoice(invoice);
  }
  await deleteMockCommission(commission);
  await deleteMockCommission(commissionEU);
  await deleteMockCommission(commissionThirdCountry);
  await deleteMockInvoice(invoice);
  await deleteMockInvoice(invoiceEU);
  await deleteMockInvoice(invoiceThirdCountry);
  await deleteMockDispatcher(dispatcher);
  await deleteMockCarrier(carrier);
  for await (const cc of customerContacts) {
    await deleteMockCustomerConstact(cc);
  }
  await deleteMockCustomer(customer);
  await deleteMockCustomer(customerWithoutContact);
  await deleteMockUser(user);
}, 30000);
//
describe('XML invoice export', () => {
  it('Should return error', async () => {
    let res = await request(server)
      .post(`/api/invoice/export`)
      .send('Bad request')
      .set('x-auth-token', token);

    expect(res.body).toHaveProperty('message');
    expect(res.status).toBe(400);
  });

  it('Should return domestic XML invoice', async () => {
    let res = await request(server)
      .post(`/api/invoice/export`)
      .send([
        invoice.invoice_id,
        invoiceEU.invoice_id,
        invoiceThirdCountry.invoice_id,
      ])
      .set('x-auth-token', token);

    if (res.error) console.warn(res.error);

    expect(res.status).toBe(200);
  });

  it('Should return error', async () => {
    let res = await request(server)
      .post(`/api/invoice/export`)
      .send([invoice.invoice_id])
      .set('x-auth-token', token);

    expect(res.body).toHaveProperty('message');
    expect(res.status).toBe(400);
  });
});

describe('V2 invoicing', () => {
  describe('Getting invoice detail', () => {
    it('Should get invoice detail', async () => {
      let res = await request(server)
        .get(`/api/v2/invoice/${invoice.invoice_id}`)
        .set('x-auth-token', token);

      if (res.error) console.warn(res.error);

      let {
        body: { data: invoices },
      } = await request(server)
        .get(`/api/v2/invoice?invoice_id=${invoice.invoice_id}`)
        .set('x-auth-token', token);
      expect(res.status).toBe(200);
      expect(res.body.text).not.toBe(null);
      // expect(res.body.invoice_id).toBe(invoices[0].invoice_id);
      expect(res.body.invoiceNumber).not.toBe(null);

      // expect due date within 4 seconds
      expect(Number(res.body.dueDate)).toBeLessThan(
        Date.now() + customer.defaultDueDate * 24 * 60 * 60 * 1000 + 2000,
      );

      // expect(Number(res.body.dueDate)).toBeGreaterThan(
      //   Date.now() + customer.defaultDueDate * 24 * 60 * 60 * 1000 - 2000,
      // );

      // point date
      expect(Number(res.body.pointDate)).toBe(4);

      expect(res.body.commission).toHaveProperty(
        'orderDate',
        commission.orderDate,
      );
      expect(res.body.commission).toHaveProperty(
        'orderNumber',
        commission.orderNumber,
      );
      expect(res.body.customer).toHaveProperty('customerContact');
      expect(res.body.eurRate).not.toBeDefined();
    });

    it('Should get EUR invoice detail', async () => {
      let res = await request(server)
        .get(`/api/v2/invoice/${invoiceEU.invoice_id}`)
        .set('x-auth-token', token);

      if (res.error) console.warn(res.error);

      expect(res.body.eurRate).toBeDefined();
    });

    it('Should not get invoice detail', async () => {
      res = await request(server)
        .get('/api/v2/invoice/notindb')
        .set('x-auth-token', token);

      expect(res.status).toBe(404);
    });

    it('Invoice without customer. Should return error', async () => {
      await updateMockCommission(commissionEU.commission_id, {
        customer_id: null,
      });

      let res = await request(server)
        .get(`/api/v2/invoice/${invoiceEU.invoice_id}`)
        .set('x-auth-token', token);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Fakturu se nepodařilo vytvořit');
    });
  });

  describe('Updating invoice detail', () => {
    let invoiceNumber;

    it('Should create invoice number if not set', async () => {
      putObject = {
        invoice_id: 1111,
      };

      let res = await request(server)
        .put(`/api/v2/invoice/${invoice.invoice_id}`)
        .send(putObject)
        .set('x-auth-token', token);

      invoiceNumber = res.body.invoiceNumber;

      expect(Number(res.body.invoiceNumber)).toBeGreaterThan(
        Number(new Date().getFullYear().toString()),
      );
    });

    it('Should create invoice number is null', async () => {
      putObject = {
        invoiceNumber: null,
        invoice_id: 1111,
      };

      let res = await request(server)
        .put(`/api/v2/invoice/${invoice.invoice_id}`)
        .send(putObject)
        .set('x-auth-token', token);

      expect(Number(res.body.invoiceNumber)).toEqual(++invoiceNumber);
    });

    it('Should update invoice', async () => {
      putObject = {
        invoice_id: 1111,
        canceled: true, // check
        constantSymbol: '308',
        dueDate: '1623662490193',
        exported: false,
        invoiceNumber: 21000001,
        invoiceSent: false,
        issueDate: '1618478490150',
        language: 'polština', // check
        paid: false,
        paymentMethod: 'příkazem',
        pointDate: '1617141600000',
        reverseCharge: true,
        text: 'Fakturujeme Vám dohodnutou cenu za kedlubnu',
        valueAddedTax: 0,
        commission: {
          commission_id: commission.commission_id,
          currencyCarrier: 'CZK',
          currencyCustomer: 'EUR',
          exchangeRateCarrier: null,
          exchangeRateCustomer: '25.9',
          orderDate: '1617055200000',
          orderNumber: 123, // check
          priceCustomer: '73000', // check
          vat: null,
        },
      };

      let res = await request(server)
        .put(`/api/v2/invoice/${invoice.invoice_id}`)
        .send(putObject)
        .set('x-auth-token', token);

      if (res.error) console.warn(res.error);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty(
        'invoiceNumber',
        String(putObject.invoiceNumber),
      );
      expect(res.body).toHaveProperty('valueAddedTax', 21);
      expect(res.body).toHaveProperty('invoice_id');
      expect(res.body.text).toBe(putObject.text);
      expect(res.body.canceled).toBe(putObject.canceled);
      expect(res.body.language).toBe(putObject.language);

      expect(res.body.commission.orderNumber).toEqual(
        String(putObject.commission.orderNumber),
      );
      expect(res.body.commission.priceCustomer).toBe(
        putObject.commission.priceCustomer,
      );
    });

    it('Should return commission error', async () => {
      putObject.commission.commission_id = 1111;

      let res = await request(server)
        .put(`/api/v2/invoice/${invoice.invoice_id}`)
        .send(putObject)
        .set('x-auth-token', token);
      expect(res.status).toBe(404);
    });
  });

  describe('Getting all invoices', () => {
    it('Should return all invoices from 2020', async () => {
      let res = await request(server)
        .get(`/api/v2/invoice?year=2020`)
        .set('x-auth-token', token);

      if (res.error) console.warn(res.error);

      expect(res.body.data[0]).toHaveProperty('customer_id');
      expect(res.body.data[0]).toHaveProperty('number');
      expect(res.body.data[0]).toHaveProperty('exchangeRateCustomer');
      expect(res.body.data[0]).toHaveProperty('customer_company');
      expect(res.body.data[0]).toHaveProperty('orderNumber');
      expect(res.body.data[0]).toHaveProperty('issueDate');
      expect(res.body.data[0]).toHaveProperty('dueDate');
      expect(res.body.data[0]).toHaveProperty('pointDate');
      expect(res.body.data[0].pointDate).not.toBe(null);
      expect(res.body.data[0]).toHaveProperty('orderDate');
      expect(res.body.data[0]).toHaveProperty('priceCustomer');
      expect(res.body.data[0]).toHaveProperty('constantSymbol');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('len');
      expect(res.body.data.length).toBe(26);

      let res1 = await request(server)
        .get(`/api/v2/invoice?priceCustomer=73000`)
        .set('x-auth-token', token);
      expect((res1.body.data.length = 1));
    });

    it('Should return all with filters', async () => {
      // invoiceSent
      // paid
      // invoiceNumber [up,down]
      // issueDate [up,down]
      // customer_company - fuck
      // orderNumber [up,down]
      // issueDate [up,down]
      // dueDate [up,down]
      // payDate [up,down]
      // oderDate [up,down]
      // priceCustomer [up,down]
      // constantSymbol [up,down]
      //&invoiceSend_eq=1&invoiceNumber_gt=10&issueDate_lt=1619622372&issueDate_gr=1619622372&customer_company=xasd&orderNumber_gt=11&issueDate_lt=15&dueDate_gt=10&oderDate_lt=40&priceCustomer_gt=30&constantSymbol=308_sort=email:ASC_start=10&_limit=10

      let res = await request(server)
        .get(
          `/api/v2/invoice?year=2020&invoiceSent_eq=1&invoiceNumber_gt=10&issueDate_lt=1619622372&issueDate_gt=1619622372&customer_company=xasd&orderDate_gt=11&dueDate_gt=10&orderDate_lt=40&priceCustomer_gt=30&constantSymbol=308&_sort=invoice_id:ASC&_start=10&_limit=10
      `,
        )
        .set('x-auth-token', token);

      //if (res.error) console.warn(res.error);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(0);
    });

    it('Customer company filter', async () => {
      let res = await request(server)
        .get(
          `/api/v2/invoice?_start=0&_limit=25&_sort=invoice_id:DESC&invoiceNumber_lt=44445&customer_company_eq=Mockary&orderNumber_lt=111&pointDate_lt=1622671200000`,
        )
        .set('x-auth-token', token);

      if (res.error) console.warn(res.error);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(0);
    });

    it('Customer company lowercase', async () => {
      let res = await request(server)
        .get(`/api/v2/invoice?_start=0&_limit=25&customer_company_eq=mockary`)
        .set('x-auth-token', token);

      if (res.error) console.warn(res.error);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);

      res = await request(server)
        .get(`/api/v2/invoice?_start=0&_limit=25&customer_company=mockary`)
        .set('x-auth-token', token);

      if (res.error) console.warn(res.error);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('Should return one entry with search', async () => {
      let res = await request(server)
        .get(`/api/v2/invoice?year=2020&_search=kedlubnu`)
        .set('x-auth-token', token);

      if (res.error) console.warn(res.error);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });

    it('Should return response', async () => {
      let res = await request(server)
        .get(
          `/api/v2/invoice?_search=kedlasd2354asde234234asdadasd234eadasdasadasd324 ubnu`,
        )
        .set('x-auth-token', token);

      if (res.error) console.warn(res.error);
      expect(res.status).toBe(200);
    });

    it('Should return response', async () => {
      let res = await request(server)
        .get(
          `/api/v2/invoice?_start=0&_limit=40&_sort=number:DESC&_search=abc&number_null=false`,
        )
        .set('x-auth-token', token);

      if (res.error) console.warn(res.error);
      expect(res.status).toBe(200);
    });

    it('Should return rows with NULL', async () => {
      let res = await request(server)
        .get('/api/v2/invoice?exchangeRateCustomer_null=true')
        .set('x-auth-token', token);

      if (res.error) console.warn(res.error);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      res.body.data.forEach((e) => expect(e.exchangeRateCustomer).toBe(null));
    });

    it('Should return rows with NOT NULL', async () => {
      let res = await request(server)
        .get('/api/v2/invoice?exchangeRateCustomer_null=false')
        .set('x-auth-token', token);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      res.body.data.forEach((e) =>
        expect(e.exchangeRateCustomer).not.toBe(null),
      );
    });
  });

  describe('Paginations', () => {
    it('Should return last 10 entries', async () => {
      let res = await request(server)
        .get(`/api/v2/invoice?_sort=invoice_id:DESC&_start=0&_limit=10`)
        .set('x-auth-token', token);

      paginationCommissions.reverse();
      expect(res.body.data[0].invoice_id).toBeGreaterThanOrEqual(
        res.body.data[1].invoice_id,
      );
      expect(res.body.data.length).toBe(10);
      expect(res.status).toBe(200);
    });

    it('Should return last 10 entries with 10 offset', async () => {
      let res = await request(server)
        .get(`/api/v2/invoice?_sort=invoice_id:DESC&_start=10&_limit=10`)
        .set('x-auth-token', token);

      expect(res.body.data[0].invoice_id).toBeGreaterThanOrEqual(
        res.body.data[1].invoice_id,
      );
      expect(res.body.data.length).toBe(10);
      expect(res.status).toBe(200);
    });

    it('Should return last 6 entries', async () => {
      let res = await request(server)
        .get(`/api/v2/invoice?_sort=invoice_id:DESC&_start=20&_limit=10`)
        .set('x-auth-token', token);

      expect(res.body.data[0].invoice_id).toBeGreaterThanOrEqual(
        res.body.data[1].invoice_id,
      );
      expect(res.body.data.length).toBe(6);
      expect(res.status).toBe(200);
    });
  });

  describe('Numbering', () => {
    it('should return correct invoice number', async () => {
      const invoiceNumber = await getNewInvoiceNumber(3033);
      expect(invoiceNumber).toEqual('33000001');
    });
  });

  describe('Change invoice text', () => {
    it('Should return english text', async () => {
      let res = await request(server)
        .get(`/api/v2/invoice/text/${invoice.invoice_id}/en`)
        .set('x-auth-token', token);

      if (res.error) console.error(res.error);
      expect(res.status).toBe(200);
      expect(res.body.text).toBe(
        'We are invoicing you the agreed price for transport: null (PE) —> null (CZ). Our position: PECZ-4513-20',
      );
    });

    it('Should return german text', async () => {
      let res = await request(server)
        .get(`/api/v2/invoice/text/${invoice.invoice_id}/de`)
        .set('x-auth-token', token);

      if (res.error) console.error(res.error);
      expect(res.status).toBe(200);
      expect(res.body.text).toBe(
        'Wir senden Ihnen die Rechnung zum vereinbarten Preis für den Transport: null (PE) —> null (CZ). Unsere Position: PECZ-4513-20',
      );
    });

    it('Should return error', async () => {
      let res = await request(server)
        .get(`/api/v2/invoice/text/${invoice.invoice_id}/`)
        .set('x-auth-token', token);

      expect(res.status).toBe(404);
    });

    it('Should return error', async () => {
      let res = await request(server)
        .get(`/api/v2/invoice/text/123456747987/cs`)
        .set('x-auth-token', token);

      expect(res.status).toBe(404);
    });
  });
});
