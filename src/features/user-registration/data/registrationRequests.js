import {
  REGISTRATION_TYPES,
} from "../constants/registrationTypes";


export const initialAgencyRegistrationRequests = [
  {
    id: "agency-1",

    type:
      REGISTRATION_TYPES.AGENCY,

    name:
      "Trịnh Trần Phương Tuấn",

    phone:
      "0965876625",

    address:
      "177 Trung Kính, Trung Hoà, Cầu Giấy, Hà Nội",
  },

  {
    id: "agency-2",

    type:
      REGISTRATION_TYPES.AGENCY,

    name:
      "Vi Sao Tinh Tú",

    phone:
      "0965876625",

    address:
      "N/A",
  },
];


export const initialShipperRegistrationRequests = [
  {
    id: "shipper-1",

    type:
      REGISTRATION_TYPES.SHIPPER,

    name:
      "Nguyễn Văn A",

    phone:
      "0987654321",

    address:
      "123 Nguyễn Trãi, Thanh Xuân, Hà Nội",
  },

  {
    id: "shipper-2",

    type:
      REGISTRATION_TYPES.SHIPPER,

    name:
      "Lê Văn B",

    phone:
      "0123456789",

    address:
      "456 Trần Duy Hưng, Cầu Giấy, Hà Nội",
  },
];


export const getInitialRegistrationRequests = (
  type,
) => {
  if (
    type ===
    REGISTRATION_TYPES.AGENCY
  ) {
    return initialAgencyRegistrationRequests.map(
      (request) => ({
        ...request,
      }),
    );
  }


  if (
    type ===
    REGISTRATION_TYPES.SHIPPER
  ) {
    return initialShipperRegistrationRequests.map(
      (request) => ({
        ...request,
      }),
    );
  }


  return [];
};