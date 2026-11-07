import { useEffect, useState } from "react";

import PropTypes from "prop-types";

import {
  Avatar,
  Button,
  DatePicker,
  Divider,
  Drawer,
  Form,
  Image,
  Input,
  Menu,
  Typography,
  Upload,
} from "antd";

import {
  ArrowLeftOutlined,
  LogoutOutlined,
  UploadOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";

import { updateUserProfile } from "../../../../../shared/api/account.api";

import {
  checkFileSize,
  checkMagicNumber,
  fileToBase64,
  formatPhoneNumberWithRegion,
} from "../../../../../helpers";

import ConfirmModal from "../../../../../shared/components/ConfirmModal";

import toast from "../../../../../shared/components/AppToast";

function ProfileDrawer({
  visible,
  userAuth,
  userData,
  previewAvatar,
  onClose,
  onLogout,
  onProfileUpdated,
  onPreviewAvatarChange,
}) {
  const [form] = Form.useForm();

  const [isEditing, setIsEditing] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newAvatar, setNewAvatar] = useState(null);

  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  /*
   * Preview chỉ nằm local khi đang edit.
   * Không thay avatar ngoài Header
   * cho tới khi update thành công.
   */
  const [draftAvatar, setDraftAvatar] = useState(previewAvatar);

  const phoneNumber = userAuth?.userPhone;

  /* ========================================
     Sync avatar
  ======================================== */

  useEffect(() => {
    if (!isEditing) {
      setDraftAvatar(previewAvatar);
    }
  }, [previewAvatar, isEditing]);

  /* ========================================
     Form data
  ======================================== */

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    const birthday = userData?.dob || userData?.birthday;

    form.setFieldsValue({
      firstName: userData?.firstName || "",

      lastName: userData?.lastName || "",

      birthday: birthday ? dayjs(birthday) : null,

      addressDetail: userData?.addressDetail || "",
    });
  }, [form, isEditing, userData]);

  /* ========================================
     Edit state
  ======================================== */

  const handleStartEditing = () => {
    setDraftAvatar(previewAvatar);

    setNewAvatar(null);

    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);

    setNewAvatar(null);

    setDraftAvatar(previewAvatar);

    form.resetFields();
  };

  const handleClose = () => {
    handleCancelEditing();

    onClose();
  };

  /* ========================================
     Avatar
  ======================================== */

  const handleFileChange = async ({ file, onSuccess, onError }) => {
    if (!file) {
      const error = new Error("No file selected.");

      onError?.(error);

      toast.error({
        title: "Không có file",

        description: "Vui lòng chọn một file ảnh.",
      });

      return;
    }

    if (!checkFileSize(file)) {
      const error = new Error("File exceeds the 10MB limit.");

      onError?.(error);

      toast.error({
        title: "File quá lớn",

        description: "Dung lượng file tối đa là 10MB.",
      });

      return;
    }

    try {
      const isValidImage = await checkMagicNumber(file);

      if (!isValidImage) {
        const error = new Error("Invalid image file.");

        onError?.(error);

        toast.error({
          title: "File ảnh không hợp lệ",

          description: "Vui lòng chọn file PNG, JPEG hoặc GIF hợp lệ.",
        });

        return;
      }

      const base64String = await fileToBase64(file);

      /*
       * Dùng chính Base64 làm preview.
       *
       * Không dùng URL.createObjectURL()
       * nên không phải revoke URL.
       */
      setNewAvatar(base64String);

      setDraftAvatar(base64String);

      onSuccess?.("ok");
    } catch (error) {
      console.error("Error processing avatar:", error);

      onError?.(error);

      toast.error({
        title: "Không thể xử lý ảnh",

        description: "Vui lòng thử lại với file khác.",
      });
    }
  };

  /* ========================================
     Update profile
  ======================================== */

  const handleUpdateInfo = async () => {
    if (!phoneNumber) {
      toast.error({
        title: "Không tìm thấy tài khoản",

        description: "Không thể xác định thông tin tài khoản hiện tại.",
      });

      return;
    }

    try {
      const values = await form.validateFields();

      setIsSubmitting(true);

      const updatedData = {
        firstName: values.firstName,

        lastName: values.lastName,

        birthday: values.birthday ? values.birthday.format("YYYY-MM-DD") : null,

        addressDetail: values.addressDetail,
      };

      /*
       * Giữ nguyên contract API cũ.
       *
       * Chỗ "string" này khá đáng ngờ,
       * nhưng chưa đổi để tránh phá backend.
       */
      if (newAvatar) {
        updatedData.imagePath = newAvatar.length < 255 ? newAvatar : "string";
      }

      await updateUserProfile(phoneNumber, updatedData);

      /*
       * getUserInfo đang trả dob,
       * trong khi update API nhận birthday.
       */
      const nextUserData = {
        ...userData,

        firstName: updatedData.firstName,

        lastName: updatedData.lastName,

        dob: updatedData.birthday,

        addressDetail: updatedData.addressDetail,
      };

      onProfileUpdated(nextUserData);

      /*
       * Chỉ commit avatar lên Header
       * sau khi API update thành công.
       */
      if (newAvatar) {
        onPreviewAvatarChange(draftAvatar);
      }

      setNewAvatar(null);

      setIsEditing(false);

      toast.success({
        title: "Cập nhật thành công",

        description: "Thông tin cá nhân đã được cập nhật.",
      });
    } catch (error) {
      /*
       * validateFields reject:
       *
       * AntD tự hiển thị lỗi tại field,
       * không cần toast thêm.
       */
      if (error?.errorFields) {
        return;
      }

      console.error("Failed to update user:", error);

      toast.error({
        title: "Không thể cập nhật thông tin",

        description: "Vui lòng thử lại.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ========================================
     Display
  ======================================== */

  const displayName =
    userData?.lastName ||
    userData?.firstName ||
    userAuth?.userName ||
    "Tài khoản";

  return (
    <>
      <Drawer
        title={isEditing ? "Sửa thông tin" : "Thông tin cá nhân"}
        placement="right"
        onClose={handleClose}
        visible={visible}
        width={340}
        className="app-header-profile"
      >
        {isEditing ? (
          <div className="app-header-profile__edit">
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={handleCancelEditing}
            >
              Quay lại
            </Button>

            <Form form={form} layout="vertical">
              <Form.Item
                label="Avatar"
                className="app-header-profile__avatar-field"
              >
                <Image
                  src={draftAvatar}
                  preview={false}
                  className="app-header-profile__edit-avatar"
                />

                <Upload
                  accept="image/*"
                  showUploadList={false}
                  customRequest={handleFileChange}
                >
                  <Button icon={<UploadOutlined />}>Tải lên Avatar</Button>
                </Upload>
              </Form.Item>

              <Form.Item
                name="firstName"
                label="Tên"
                rules={[
                  {
                    required: true,

                    message: "Tên không được để trống!",
                  },
                ]}
              >
                <Input placeholder="Nhập tên" />
              </Form.Item>

              <Form.Item
                name="lastName"
                label="Họ"
                rules={[
                  {
                    required: true,

                    message: "Họ không được để trống!",
                  },
                ]}
              >
                <Input placeholder="Nhập họ" />
              </Form.Item>

              <Form.Item name="birthday" label="Ngày sinh">
                <DatePicker
                  format="YYYY-MM-DD"
                  style={{
                    width: "100%",
                  }}
                />
              </Form.Item>

              <Form.Item name="addressDetail" label="Chi tiết nơi sống">
                <Input placeholder="Nhập chi tiết nơi sống" />
              </Form.Item>
            </Form>

            <Button
              type="primary"
              block
              loading={isSubmitting}
              onClick={handleUpdateInfo}
            >
              Cập nhật thông tin
            </Button>
          </div>
        ) : (
          <div className="app-header-profile__content">
            <div className="app-header-profile__user">
              <Avatar src={previewAvatar} size={64} />

              <div>
                <Typography.Text strong>{displayName}</Typography.Text>

                <div className="app-header-profile__phone">
                  {formatPhoneNumberWithRegion(userAuth?.userPhone)}
                </div>
              </div>
            </div>

            <Divider />

            <Menu
              selectable={false}
              items={[
                {
                  key: "edit",

                  label: "Chỉnh sửa thông tin",

                  onClick: handleStartEditing,
                },

                {
                  key: "logout",

                  danger: true,

                  icon: <LogoutOutlined />,

                  label: "Đăng xuất",

                  onClick: () => setLogoutConfirmOpen(true),
                },
              ]}
            />
          </div>
        )}
      </Drawer>

      <ConfirmModal
        open={logoutConfirmOpen}
        title="Thông báo"
        description="Bạn muốn đăng xuất?"
        cancelText="Hủy"
        confirmText="Xác nhận"
        onCancel={() => setLogoutConfirmOpen(false)}
        onConfirm={onLogout}
      />
    </>
  );
}

ProfileDrawer.propTypes = {
  visible: PropTypes.bool.isRequired,

  userAuth: PropTypes.object,

  userData: PropTypes.object,

  previewAvatar: PropTypes.string,

  onClose: PropTypes.func.isRequired,

  onLogout: PropTypes.func.isRequired,

  onProfileUpdated: PropTypes.func.isRequired,

  onPreviewAvatarChange: PropTypes.func.isRequired,
};

ProfileDrawer.defaultProps = {
  userAuth: null,

  userData: {},

  previewAvatar: "",
};

export default ProfileDrawer;
