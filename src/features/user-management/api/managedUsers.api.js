import {
  registerAccount,
  updateUserProfile,
} from "../../../shared/api/account.api";

export const createManagedUser = async (payload) => registerAccount(payload);

export const updateManagedUser = async (phoneNumber, payload) =>
  updateUserProfile(phoneNumber, payload);
