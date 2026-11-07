export {
  createAddress,
  deactivateAddressById,
  getAllAddressByManagerPhone,
  updateAddress,
} from "./addresses.api";

export {
  assignAgencyAddress,
  changeAgencyAddressInfo,
} from "./agencyAddresses.api";

export {
  assignAddressToPos,
  deactivatePosAddressAssignment,
  getPosAddresses,
  updatePosAddressShippingFee,
} from "./posAddresses.api";
