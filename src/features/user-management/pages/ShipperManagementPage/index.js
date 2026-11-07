import React from "react";

import {
  USER_MANAGEMENT_TYPES,
} from "../../constants";

import UserManagementPage from "../UserManagementPage";


function ShipperManagementPage() {
  return (
    <UserManagementPage
      type={
        USER_MANAGEMENT_TYPES.SHIPPER
      }
      showKitchens
    />
  );
}


export default ShipperManagementPage;