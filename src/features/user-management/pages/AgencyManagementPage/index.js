import React from "react";

import {
  USER_MANAGEMENT_TYPES,
} from "../../constants";

import UserManagementPage from "../UserManagementPage";


function AgencyManagementPage() {
  return (
    <UserManagementPage
      type={
        USER_MANAGEMENT_TYPES.AGENCY
      }
      showKitchens
    />
  );
}


export default AgencyManagementPage;