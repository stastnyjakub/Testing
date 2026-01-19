export const getExcludeDeletedDispatchers = () => ({
  where: {
    dispatcher: {
      deleted: false,
      carrier: {
        deleted: false,
      },
    },
  },
});

// export const authorizeDispatcherForEnquiryGet = async (auth: TokenPayloadDispatcher, enquiry_id: number) => {
//   const isContacted = await prisma.enquiry.findFirst({
//     where: {
//       enquiry_id,
//       contactedDispatchers: {
//         some: {
//           dispatcher_id: auth.dispatcher_id,
//         },
//       },
//     },
//   });
//   return !!isContacted;
// };
