import React from "react";

import {
  REGISTRATION_TYPES,
} from "../../constants/registrationTypes";

import RegistrationRequestsPage from "../RegistrationRequestsPage";


function AgencyRegistrationPage() {
  return (
    <RegistrationRequestsPage
      type={
        REGISTRATION_TYPES.AGENCY
      }
    />
  );
}


export default AgencyRegistrationPage;