import { Dispatcher, Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

import * as carrierService from '@/carrier/carrier.service';
import prisma from '@/db/client';
import { Entity, NotFoundException } from '@/errors';
import { TMail } from '@/mail/mail.interface';
import { sendMail } from '@/mail/mail.service';
import { AsyncReturnType, Lang } from '@/types';
import * as userService from '@/user/user.service';
import { getUserSelect } from '@/user/user.utils';
import { generateGeneralEmailBody } from '@/utils';

import { countryCodeToLanguageCode } from '../carrier/carrier.interface';

import { EmailBody } from './dispatcher.interface';

export const getOnboardingToken = async (token: string) => {
  const onboardingToken = await prisma.onboardingtoken.findFirst({
    where: {
      token: token,
    },
  });
  return onboardingToken;
};

export const solveOnboardingToken = async (token: string) => {
  return prisma.onboardingtoken.updateMany({
    where: {
      token: token,
    },
    data: {
      solved: true,
    },
  });
};

export type TGetDispatcherArgs = {
  dispatcherId?: number;
  userId?: number;
};
type TDispatcherWithUser = Dispatcher & {
  user: NonNullable<AsyncReturnType<typeof userService.getUser>>;
};
export function getDispatcher(args: { userId: number }): Promise<TDispatcherWithUser | null>;
export function getDispatcher(args: { dispatcherId: number }): Promise<TDispatcherWithUser | null>;
export function getDispatcher({ dispatcherId, userId }: TGetDispatcherArgs) {
  const dispatcher = prisma.dispatcher.findFirst({
    where: { dispatcher_id: dispatcherId, user_id: userId },
    include: { user: { select: getUserSelect() } },
  });

  return dispatcher;
}

export const getDispatchersByIds = async (dispatcherIds: number[]) => {
  const dispatchers = await prisma.dispatcher.findMany({
    where: {
      dispatcher_id: {
        in: dispatcherIds,
      },
    },
    include: {
      user: { select: getUserSelect() },
    },
  });
  return dispatchers;
};

// export const getDispatcherById = async (dispatcher_id: number) => {
//   const dispatcher = await prisma.dispatcher.findFirst({
//     where: { dispatcher_id },
//     include: {
//       dispatchervehicle: { include: { dispatchervehiclefeature: true } },
//       place: true,
//       onboardingtokens: true,
//       language: true,
//     },
//   });
//   if (!dispatcher) throw new NotFoundException(Entity.DISPATCHER);

//   const dispatcherWithState = dispatcher as typeof dispatcher & { onboardingState?: DispatcherOnboardingState };

//   if (dispatcherWithState.password) {
//     dispatcherWithState.onboardingState = DispatcherOnboardingState.REGISTERED;
//     delete dispatcherWithState.password;
//     return dispatcherWithState;
//   }

//   if (!dispatcherWithState.onboardingtokens[0]) {
//     dispatcherWithState.onboardingState = DispatcherOnboardingState.UNREGISTERED;
//     delete dispatcherWithState.onboardingtokens;
//     return dispatcherWithState;
//   }

//   dispatcherWithState.onboardingtokens.some((token) => token.solved === true)
//     ? (dispatcherWithState.onboardingState = DispatcherOnboardingState.REGISTERED)
//     : (dispatcherWithState.onboardingState = DispatcherOnboardingState.PENDING);

//   delete dispatcherWithState.onboardingtokens;
//   return dispatcherWithState;
// };

export const updateDispatcher = (updateObj: Prisma.DispatcherUpdateArgs) => {
  return prisma.dispatcher.update(updateObj);
};

export const convertPasswordToHash = async (password: string) => {
  return await bcrypt.hash(password, bcrypt.genSaltSync(10));
};

// export const createDispatcher = async (body: DispatcherCreateBody) => {
//   const { dispatcherVehicles, places } = body;
//   const createdDispatcher = await prisma.$transaction(async (transaction) => {
//     const placesToCreate = {
//       place: {
//         createMany: {
//           data: places?.toCreate,
//         },
//       },
//     };

//     const createdDispatcher = await transaction.dispatcher.create({
//       data: {
//         carrier_id: body.carrier_id,
//         email: body.email,
//         password: body.password && (await convertPasswordToHash(body.password)),
//         firstName: body.firstName,
//         lastName: body.lastName,
//         phone: body.phone,
//         notificationEmail: body.notificationEmail,
//         notificationWhatsapp: body.notificationWhatsapp,
//         language_id: body.language_id,
//         ...(places?.toCreate?.length > 0 && placesToCreate),
//       },
//       select: prismaExclude('Dispatcher', ['password']),
//     });

//     if (dispatcherVehicles?.toCreate?.length > 0) {
//       await Promise.all(
//         dispatcherVehicles.toCreate.map((vehicle) => {
//           const featuresToCreate = {
//             dispatchervehiclefeature: {
//               createMany: {
//                 data: vehicle.dispatcherVehicleFeatures?.toCreate?.map((feature) => ({
//                   vehicleFeature_id: feature.vehicleFeature_id,
//                 })),
//               },
//             },
//           };
//           return transaction.dispatchervehicle.create({
//             data: {
//               carrier_id: body.carrier_id,
//               dispatcher_id: createdDispatcher.dispatcher_id,
//               vehicleType_id: vehicle.vehicleType_id,
//               maxHeight: vehicle.maxHeight,
//               maxLength: vehicle.maxLength,
//               maxWeight: vehicle.maxWeight,
//               maxWidth: vehicle.maxWidth,
//               ...(vehicle.dispatcherVehicleFeatures?.toCreate?.length > 0 && featuresToCreate),
//             },
//           });
//         }),
//       );
//     }

//     return createdDispatcher;
//   });
//   return createdDispatcher;
// };

// export const patchDispatcher = async (body: PatchDispatcherArguments) => {
//   const { dispatcherVehicles, places } = body;

//   const updatedDispatcher = await prisma.$transaction(async (transaction) => {
//     const dispatcher = await transaction.dispatcher.findUnique({
//       where: { dispatcher_id: body.dispatcher_id },
//     });

//     if (body.password) {
//       body.password = await convertPasswordToHash(body.password);
//     }

//     const updatedDispatcher = await transaction.dispatcher.update({
//       where: { dispatcher_id: body.dispatcher_id },
//       data: {
//         ...{ ...body, dispatcherVehicles: undefined, places: undefined },
//       },
//       select: prismaExclude('Dispatcher', ['password']),
//     });

//     // DispatcherVehicles
//     if (dispatcherVehicles?.toCreate?.length > 0) {
//       await Promise.all(
//         dispatcherVehicles.toCreate.map((vehicle) => {
//           const featuresToCreate = {
//             dispatchervehiclefeature: {
//               createMany: {
//                 data: vehicle.dispatcherVehicleFeatures?.toCreate?.map((feature) => ({
//                   vehicleFeature_id: feature.vehicleFeature_id,
//                 })),
//               },
//             },
//           };
//           return transaction.dispatchervehicle.create({
//             data: {
//               carrier_id: dispatcher.carrier_id,
//               dispatcher_id: body.dispatcher_id,
//               vehicleType_id: vehicle.vehicleType_id,
//               maxHeight: vehicle.maxHeight,
//               maxLength: vehicle.maxLength,
//               maxWeight: vehicle.maxWeight,
//               maxWidth: vehicle.maxWidth,
//               ...(vehicle.dispatcherVehicleFeatures?.toCreate?.length > 0 && featuresToCreate),
//             },
//           });
//         }),
//       );
//     }

//     if (dispatcherVehicles?.toUpdate?.length > 0) {
//       await Promise.all(
//         dispatcherVehicles.toUpdate.map(async (vehicle) => {
//           vehicle.dispatcherVehicleFeatures?.toCreate?.length > 0 &&
//             (await transaction.dispatchervehiclefeature.createMany({
//               data: vehicle.dispatcherVehicleFeatures?.toCreate?.map((feature) => ({
//                 dispatcherVehicle_id: vehicle.dispatcherVehicle_id,
//                 vehicleFeature_id: feature.vehicleFeature_id,
//               })),
//             }));

//           vehicle.dispatcherVehicleFeatures?.toUpdate?.length > 0 &&
//             (await Promise.all(
//               vehicle.dispatcherVehicleFeatures.toUpdate.map((feature) => {
//                 return transaction.dispatchervehiclefeature.update({
//                   where: { dispatcherVehicleFeature_id: feature.dispatcherVehicleFeature_id },
//                   data: {
//                     vehicleFeature_id: feature.vehicleFeature_id,
//                   },
//                 });
//               }),
//             ));

//           vehicle.dispatcherVehicleFeatures?.toDelete?.length > 0 &&
//             (await Promise.all(
//               vehicle.dispatcherVehicleFeatures.toDelete.map((feature) => {
//                 return transaction.dispatchervehiclefeature.delete({
//                   where: { dispatcherVehicleFeature_id: feature.dispatcherVehicleFeature_id },
//                 });
//               }),
//             ));

//           return transaction.dispatchervehicle.update({
//             where: { dispatcherVehicle_id: vehicle.dispatcherVehicle_id },
//             data: {
//               ...{
//                 ...vehicle,
//                 dispatcherVehicle_id: undefined,
//                 dispatcherVehicleFeatures: undefined,
//               },
//             },
//           });
//         }),
//       );
//     }

//     if (dispatcherVehicles?.toDelete?.length > 0) {
//       await Promise.all(
//         dispatcherVehicles.toDelete.map((vehicle) => {
//           return transaction.dispatchervehicle.delete({
//             where: { dispatcherVehicle_id: vehicle.dispatcherVehicle_id },
//           });
//         }),
//       );
//     }

//     // Places
//     if (places?.toCreate?.length > 0) {
//       await Promise.all(
//         places.toCreate.map((place) => {
//           return transaction.place.create({
//             data: {
//               ...place,
//               carrier_id: dispatcher.carrier_id,
//               dispatcher_id: body.dispatcher_id,
//             },
//           });
//         }),
//       );
//     }
//     if (places?.toUpdate?.length > 0) {
//       await Promise.all(
//         places.toUpdate.map((place) => {
//           return transaction.place.update({
//             where: { place_id: place.place_id },
//             data: {
//               ...place,
//             },
//           });
//         }),
//       );
//     }
//     if (places?.toDelete?.length > 0) {
//       await Promise.all(
//         places.toDelete.map((place) => {
//           return transaction.place.delete({
//             where: { place_id: place.place_id },
//           });
//         }),
//       );
//     }

//     return updatedDispatcher;
//   });

//   return updatedDispatcher;
// };

export const checkOnboardingToken = async (token: string) => {
  const exists = await prisma.onboardingtoken.findFirst({
    where: {
      token,
      solved: false,
    },
  });
  return !!exists;
};

export const getDispatcherLang = async (dispatcherId: number) => {
  const dispatcher = await getDispatcher({ dispatcherId });
  if (!dispatcher) throw new NotFoundException(Entity.DISPATCHER);

  let langCode = dispatcher.user.contactInfo?.language.languageCode;
  if (!langCode) {
    const carrier = await carrierService.getCarrier(dispatcher.carrier_id);
    if (!carrier) throw new NotFoundException(Entity.CARRIER);
    langCode = carrier.countryCode
      ? countryCodeToLanguageCode[carrier.countryCode as keyof typeof countryCodeToLanguageCode]
      : 'cs';
  }
  return langCode as Lang;
};

export const buildAndSendEmail = async (data: EmailBody & { lang: Lang }, adminId: number) => {
  const dispatcher = await getDispatcher({ dispatcherId: data.dispatcherId });
  const sender = await userService.getQaplineUserInfoForEmail(adminId);
  if (!sender) throw new NotFoundException(Entity.USER);
  if (!dispatcher) throw new NotFoundException(Entity.DISPATCHER);

  const emailBody = await generateGeneralEmailBody({
    sender,
    lang: data.lang,
    message: data.body,
    title: data.subject,
  });

  const mail: TMail = {
    sender,
    to: [dispatcher.user.email],
    attachments: [],
    body: emailBody,
    subject: data.subject,
  };
  return await sendMail(mail);
};

export * from './deleteDispatcher/deleteDispatcher.service';
export * from './listDispatchers/listDispatchers.service';
