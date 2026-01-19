import { Entity, NotFoundException } from '@/errors';
import * as fileService from '@/file/file.service';

import { GOOGLE_CLOUD_STORAGE_BUCKET_PROFILE_PICTURES_PATH } from '../customer.constants';
import { getCustomer } from '../getCustomer/getCustomer.service';

export const getProfilePicturePath = (fileName: string) => {
  return GOOGLE_CLOUD_STORAGE_BUCKET_PROFILE_PICTURES_PATH.replace(':fileName', fileName);
};

export const getProfilePicture = async (customerId: number) => {
  const customer = await getCustomer({ customerId });
  if (!customer) throw new NotFoundException(Entity.CUSTOMER);

  const { profilePicture } = customer;
  if (!profilePicture) return null;

  const file = await fileService.getFile(getProfilePicturePath(profilePicture));
  return { ...file, name: profilePicture };
};

export const deleteProfilePicture = async (customerId: number) => {
  const customer = await getCustomer({ customerId });
  if (!customer) throw new NotFoundException(Entity.CUSTOMER);

  const { profilePicture } = customer;
  if (!profilePicture) return;

  await fileService.deleteFile(getProfilePicturePath(profilePicture));
};

export const deleteProfilePictureByFileName = async (fileName: string) => {
  const filePath = getProfilePicturePath(fileName);
  await fileService.deleteFile(filePath);
};
