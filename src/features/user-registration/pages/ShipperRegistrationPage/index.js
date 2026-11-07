import React from "react";

import {
  REGISTRATION_TYPES,
} from "../../constants/registrationTypes";

import RegistrationRequestsPage from "../RegistrationRequestsPage";


function ShipperRegistrationPage() {
  return (
    <RegistrationRequestsPage
      type={
        REGISTRATION_TYPES.SHIPPER
      }
    />
  );
}


export default ShipperRegistrationPage;