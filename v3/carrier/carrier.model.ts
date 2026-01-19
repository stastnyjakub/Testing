import * as Joi from '@hapi/joi';

export const validateOnboardingEmailBody = (body: object) => {
  const dispatcherSchema = Joi.object({
    name: Joi.string().required(),
    surname: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().email().required(),
  });
  const schema = Joi.object({
    to: Joi.array()
      .items(
        Joi.object({
          email: Joi.string().email().required(),
          lang: Joi.string().required(),
          dispatcher_id: Joi.number(),
        }),
      )
      .required(),
    dispatcher: dispatcherSchema.required(),
    carrier_id: Joi.number().required(),
  });
  return schema.validate(body);
};

export const validateEnquiryEmailBody = (body: object) => {
  const dispatcherSchema = Joi.object({
    name: Joi.string().required(),
    surname: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().email().required(),
  });
  const schema = Joi.object({
    commissionId: Joi.number().required(),
    parameters: Joi.object({
      minLength: Joi.number().required().min(0),
      minHeight: Joi.number().required().min(0),
      minWeight: Joi.number().required().min(0),
      minWidth: Joi.number().required().min(0),
      requiredFeatures: Joi.array().items(Joi.number()).required(),
      requiredFeaturesSome: Joi.array().items(Joi.number()).required(),
      vehicleTypes: Joi.array().items(Joi.number()).required(),
    }).required(),
    to: Joi.array()
      .items(
        Joi.object({
          dispatcherId: Joi.number().required(),
        }),
      )
      .required(),
    dispatcher: dispatcherSchema.required(),
    body: Joi.object({
      cs: Joi.string().required(),
      en: Joi.string().required(),
      de: Joi.string().required(),
    }).required(),
    subject: Joi.string().required(),
  });
  return schema.validate(body);
};

export const validateRequestBodyUpdate = (carrier: object) => {
  const schema = Joi.object({
    addedBy: Joi.string().allow(null, '').email().optional(),
    city: Joi.string().allow(null, ''),
    company: Joi.string().allow(null, '').required().messages({
      'any.required': `Je nutné vyplnit název firmy.`,
    }),
    companyRegistrationNumber: Joi.number().allow(null),
    country: Joi.string().allow(null, ''),
    countryCode: Joi.string().allow(null, '').min(2).max(2),
    editedBy: Joi.string().allow(null, ''),
    note: Joi.string().allow(null, ''),
    email: Joi.string().allow(null, ''),
    firstName: Joi.string().allow(null, ''),
    lastName: Joi.string().allow(null, ''),
    phone: Joi.string().allow(null, ''),
    place: Joi.object(),
    postalCode: Joi.string().allow(null, ''),
    qid: Joi.number().allow(null),
    number: Joi.number().allow(null),
    street: Joi.string().allow(null, ''),
    taxId: Joi.string().allow(null, ''),
    ts_edited: Joi.number(),
    ts_added: Joi.number(),
    deleted: Joi.boolean(),
    dispatchers: Joi.object({
      toCreate: Joi.array()
        .items(
          Joi.object({
            email: Joi.string().allow(null, ''),
            emailSent: Joi.number().allow(null),
            firstName: Joi.string().allow(null, ''),
            lastName: Joi.string().allow(null, ''),
            phone: Joi.string().allow(null, ''),
            lastRequest_id: Joi.number().min(1).max(2147483647),
            lastRequestTimeSent: Joi.number().allow(null),
            selected: Joi.boolean(),
            language_id: Joi.number().min(1).max(2147483647).allow(null),
            dispatcherVehicles: Joi.object({
              toCreate: Joi.array()
                .items(
                  Joi.object({
                    vehicleType_id: Joi.number().min(1).max(4),
                    maxHeight: Joi.number().allow(null),
                    maxLength: Joi.number().allow(null),
                    maxWeight: Joi.number().allow(null),
                    maxWidth: Joi.number().allow(null),
                    dispatcherVehicleFeatures: Joi.object({
                      toCreate: Joi.array()
                        .items(
                          Joi.object({
                            vehicleFeature_id: Joi.number().min(1).max(16).required(),
                          }),
                        )
                        .min(1),
                    }),
                  }),
                )
                .min(1),
              toConnect: Joi.array().items(
                Joi.object({
                  dispatcherVehicle_id: Joi.number().min(1).max(2147483647).required(),
                }),
              ),
            }),
            places: Joi.object({
              toCreate: Joi.array()
                .items(
                  Joi.object({
                    city: Joi.string().allow(null, ''),
                    country: Joi.string().allow(null, ''),
                    countryCode: Joi.string().allow(null, '').min(2).max(2),
                    directionLoading: Joi.boolean(),
                    directionDischarge: Joi.boolean(),
                    latitude: Joi.number().allow(null),
                    longitude: Joi.number().allow(null),
                    note: Joi.string().allow(null, ''),
                    postalCode: Joi.string().allow(null, ''),
                  }),
                )
                .min(1),
              toConnect: Joi.array().items(
                Joi.object({
                  place_id: Joi.number().min(1).max(2147483647).required(),
                }),
              ),
            }),
          }),
        )
        .min(1),
      toUpdate: Joi.array()
        .items(
          Joi.object({
            dispatcher_id: Joi.number().min(1).max(2147483647).required(),
            email: Joi.string().allow(null, ''),
            emailSent: Joi.number().allow(null),
            firstName: Joi.string().allow(null, ''),
            lastName: Joi.string().allow(null, ''),
            phone: Joi.string().allow(null, ''),
            lastRequest_id: Joi.number().min(1).max(2147483647),
            lastRequestTimeSent: Joi.number().allow(null),
            selected: Joi.boolean(),
            language_id: Joi.number().min(1).max(2147483647).allow(null),
          }),
        )
        .min(1),
      toDelete: Joi.array()
        .items(
          Joi.object({
            dispatcher_id: Joi.number().min(1).max(2147483647).required(),
          }),
        )
        .min(1),
    }),
    dispatcherVehicles: Joi.object({
      toCreate: Joi.array()
        .items(
          Joi.object({
            dispatcher_id: Joi.number().min(1).max(2147483647).allow(null),
            vehicleType_id: Joi.number().min(1).max(4),
            maxHeight: Joi.number().allow(null),
            maxLength: Joi.number().allow(null),
            maxWeight: Joi.number().allow(null),
            maxWidth: Joi.number().allow(null),
            dispatcherVehicleFeatures: Joi.object({
              toCreate: Joi.array()
                .items(
                  Joi.object({
                    vehicleFeature_id: Joi.number().min(1).max(16).required(),
                  }),
                )
                .min(1),
            }),
          }),
        )
        .min(1),
      toUpdate: Joi.array()
        .items(
          Joi.object({
            dispatcherVehicle_id: Joi.number().min(1).max(2147483647).required(),
            dispatcher_id: Joi.number().min(1).max(2147483647).allow(null),
            vehicleType_id: Joi.number().min(1).max(4),
            maxHeight: Joi.number().allow(null),
            maxLength: Joi.number().allow(null),
            maxWeight: Joi.number().allow(null),
            maxWidth: Joi.number().allow(null),
            dispatcherVehicleFeatures: Joi.object({
              toCreate: Joi.array()
                .items(
                  Joi.object({
                    vehicleFeature_id: Joi.number().min(1).max(16).required(),
                  }),
                )
                .min(1),

              toUpdate: Joi.array()
                .items(
                  Joi.object({
                    dispatcherVehicleFeature_id: Joi.number().required(),
                    vehicleFeature_id: Joi.number().min(1).max(16).required(),
                  }),
                )
                .min(1),
              toDelete: Joi.array()
                .items(
                  Joi.object({
                    dispatcherVehicleFeature_id: Joi.number().required(),
                  }),
                )
                .min(1),
            }),
          }),
        )
        .min(1),
      toDelete: Joi.array()
        .items(
          Joi.object({
            dispatcherVehicle_id: Joi.number().min(1).max(2147483647).required(),
          }),
        )
        .min(1),
    }),
    places: Joi.object({
      toCreate: Joi.array()
        .items(
          Joi.object({
            city: Joi.string().allow(null, ''),
            dispatcher_id: Joi.number().min(1).max(2147483647).allow(null),
            country: Joi.string().allow(null, ''),
            countryCode: Joi.string().allow(null, '').min(2).max(2),
            directionLoading: Joi.boolean(),
            directionDischarge: Joi.boolean(),
            latitude: Joi.number().allow(null),
            longitude: Joi.number().allow(null),
            note: Joi.string().allow(null, ''),
            postalCode: Joi.string().allow(null, ''),
          }),
        )
        .min(1),
      toUpdate: Joi.array()
        .items(
          Joi.object({
            place_id: Joi.number().min(1).max(2147483647).required(),
            dispatcher_id: Joi.number().min(1).max(2147483647).allow(null),
            city: Joi.string().allow(null, ''),
            country: Joi.string().allow(null, ''),
            countryCode: Joi.string().allow(null, '').min(2).max(2),
            directionLoading: Joi.boolean(),
            directionDischarge: Joi.boolean(),
            latitude: Joi.number().allow(null),
            longitude: Joi.number().allow(null),
            note: Joi.string().allow(null, ''),
            postalCode: Joi.string().allow(null, ''),
          }),
        )
        .min(1),
      toDelete: Joi.array()
        .items(
          Joi.object({
            place_id: Joi.number().min(1).max(2147483647).required(),
          }),
        )
        .min(1),
    }),
  });
  return schema.validate(carrier);
};

export const validateRequestBodyCreate = (carrier: object) => {
  const schema = Joi.object({
    addedBy: Joi.string().allow(null, '').email().optional(),
    city: Joi.string().allow(null, ''),
    company: Joi.string().allow(null, '').required().messages({
      'any.required': `Je nutné vyplnit název firmy.`,
    }),
    companyRegistrationNumber: Joi.number().allow(null),
    country: Joi.string().allow(null, ''),
    countryCode: Joi.string().allow(null, '').min(2).max(2),
    editedBy: Joi.string().allow(null, ''),
    note: Joi.string().allow(null, ''),
    email: Joi.string().allow(null, ''),
    firstName: Joi.string().allow(null, ''),
    lastName: Joi.string().allow(null, ''),
    phone: Joi.string().allow(null, ''),
    place: Joi.object(),
    postalCode: Joi.string().allow(null, ''),
    qid: Joi.number().allow(null),
    number: Joi.number().allow(null),
    street: Joi.string().allow(null, ''),
    taxId: Joi.string().allow(null, ''),
    ts_edited: Joi.number(),
    ts_added: Joi.number(),
    deleted: Joi.boolean(),
    dispatchers: Joi.object({
      toCreate: Joi.array()
        .items(
          Joi.object({
            email: Joi.string().allow(null, ''),
            emailSent: Joi.number().allow(null),
            firstName: Joi.string().allow(null, ''),
            lastName: Joi.string().allow(null, ''),
            phone: Joi.string().allow(null, ''),
            lastRequest_id: Joi.number().min(1).max(2147483647),
            lastRequestTimeSent: Joi.number().allow(null),
            selected: Joi.boolean(),
            language_id: Joi.number().min(1).max(2147483647).allow(null),
            dispatcherVehicles: Joi.object({
              toCreate: Joi.array()
                .items(
                  Joi.object({
                    vehicleType_id: Joi.number().min(1).max(4),
                    maxHeight: Joi.number().allow(null),
                    maxLength: Joi.number().allow(null),
                    maxWeight: Joi.number().allow(null),
                    maxWidth: Joi.number().allow(null),
                    dispatcherVehicleFeatures: Joi.object({
                      toCreate: Joi.array()
                        .items(
                          Joi.object({
                            vehicleFeature_id: Joi.number().min(1).max(16).required(),
                          }),
                        )
                        .min(1),
                    }),
                  }),
                )
                .min(1),
            }),
            places: Joi.object({
              toCreate: Joi.array()
                .items(
                  Joi.object({
                    city: Joi.string().allow(null, ''),
                    country: Joi.string().allow(null, ''),
                    countryCode: Joi.string().allow(null, '').min(2).max(2),
                    directionLoading: Joi.boolean(),
                    directionDischarge: Joi.boolean(),
                    latitude: Joi.number().allow(null),
                    longitude: Joi.number().allow(null),
                    note: Joi.string().allow(null, ''),
                    postalCode: Joi.string().allow(null, ''),
                  }),
                )
                .min(1),
            }),
          }),
        )
        .min(1),
    }),
    dispatcherVehicles: Joi.object({
      toCreate: Joi.array()
        .items(
          Joi.object({
            vehicleType_id: Joi.number().min(1).max(4),
            maxHeight: Joi.number().allow(null),
            maxLength: Joi.number().allow(null),
            maxWeight: Joi.number().allow(null),
            maxWidth: Joi.number().allow(null),
            dispatcherVehicleFeatures: Joi.object({
              toCreate: Joi.array()
                .items(
                  Joi.object({
                    vehicleFeature_id: Joi.number().min(1).max(16).required(),
                  }),
                )
                .min(1),
            }),
          }),
        )
        .min(1),
    }),
    places: Joi.object({
      toCreate: Joi.array()
        .items(
          Joi.object({
            dispatcher_id: Joi.number().min(1).max(2147483647).allow(null),
            city: Joi.string().allow(null, ''),
            country: Joi.string().allow(null, ''),
            countryCode: Joi.string().allow(null, '').min(2).max(2),
            directionLoading: Joi.boolean(),
            directionDischarge: Joi.boolean(),
            latitude: Joi.number().allow(null),
            longitude: Joi.number().allow(null),
            note: Joi.string().allow(null, ''),
            postalCode: Joi.string().allow(null, ''),
          }),
        )
        .min(1),
    }),
  });
  return schema.validate(carrier);
};

export const validateParameters = (params: object) => {
  const schema = Joi.object({
    carrier_id: Joi.number().min(1).max(2147483647),
    offset: Joi.number(),
    dispatchersStates: Joi.string(),
    limit: Joi.number(),
    items: Joi.string(),
    search: Joi.string(),
    sort: Joi.string().regex(/^.*:(desc|asc)$/i),
    omit: Joi.string().regex(/^\d+(?:,\d+)*$/),
    selected: Joi.string().regex(/^\d+(?:,\d+)*$/),
    number: Joi.number(),
    city: Joi.string().allow(null, ''),
    company: Joi.string().allow(null, ''),
    street: Joi.string().allow(null, ''),
    postalCode: Joi.alternatives().try(Joi.string().allow(null, '')),
    country: Joi.string().allow(null, ''),
    countryCode: Joi.string().allow(null, '').min(2).max(2),
    phone: Joi.string().allow(null, ''),
    email: Joi.string().allow(null, ''),
    note: Joi.string().allow(null, ''),
    ts_added_gt: Joi.number(),
    ts_added_lt: Joi.number(),
    ts_added_gte: Joi.number(),
    ts_added_lte: Joi.number(),
    number_gte: Joi.number(),
    number_lte: Joi.number(),
    ts_edited_gt: Joi.number(),
    ts_edited_lt: Joi.number(),
    ts_edited_gte: Joi.number(),
    ts_edited_lte: Joi.number(),
  });
  return schema.validate(params);
};
