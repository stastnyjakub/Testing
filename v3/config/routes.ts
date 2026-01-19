const v3BasePath = '/api/v3';
export const routes = {
  v3: {
    job: {
      attachmentCompression: `${v3BasePath}/job/attachment-compression`,
      invoicePayments: `${v3BasePath}/job/invoice-payments`,
    },
    customerUser: {
      invitation: {
        send: `${v3BasePath}/customer/customer-user/invitation/send`,
      },
    },
  },
};
