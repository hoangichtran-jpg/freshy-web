import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import PropTypes from "prop-types";

import { Button, DatePicker, Form, Radio } from "antd";

import AppModal from "../../../../shared/components/AppModal";

import {
  FileExcelOutlined,
  ShopOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";

import AppSelect from "../../../../shared/components/AppSelect";

import "./ExportOrdersModal.scss";



const {
  RangePicker,
} = DatePicker;


function ExportOrdersModal({
  open,
  kitchenName,
  units,
  loadingUnits,
  exporting,
  onClose,
  onExport,
}) {
  const [
    form,
  ] = Form.useForm();


  const [
    type,
    setType,
  ] = useState(
    "date",
  );


  const unitOptions =
    useMemo(
      () => [
        {
          value:
            "ALL",

          label:
            "Tất cả đơn vị",

          exportOption:
            "all",
        },

        ...units.map(
          (unit) => ({
            value:
              unit,

            label:
              unit,

            exportOption:
              "unit",
          }),
        ),
      ],
      [
        units,
      ],
    );


  useEffect(() => {
    if (!open) {
      return;
    }


    setType(
      "date",
    );


    form.resetFields();


    form.setFieldsValue({
      exportType:
        "date",

      date:
        dayjs(),

      unit:
        "ALL",
    });
  }, [
    form,
    open,
  ]);


  const handleTypeChange =
    (event) => {
      const nextType =
        event.target.value;


      setType(
        nextType,
      );


      if (
        nextType ===
        "date"
      ) {
        form.setFieldsValue({
          rangeTime:
            undefined,

          date:
            dayjs(),
        });


        return;
      }


      form.setFieldsValue({
        date:
          undefined,
      });
    };


  const handleSubmit =
    async () => {
      try {
        const values =
          await form.validateFields();


        const selectedUnit =
          unitOptions.find(
            (option) =>
              option.value ===
              values.unit,
          );


        const payload = {
          unit:
            values.unit,

          exportOption:
            selectedUnit?.exportOption,

          type,
        };


        if (
          type ===
          "date"
        ) {
          payload.startDate =
            values.date.format(
              "YYYY-MM-DD",
            );

          payload.endDate =
            payload.startDate;
        } else {
          const [
            start,
            end,
          ] =
            values.rangeTime;


          payload.startDate =
            start.format(
              "YYYY-MM-DD",
            );

          payload.endDate =
            end.format(
              "YYYY-MM-DD",
            );
        }


        await onExport(
          payload,
        );
      } catch (error) {
        if (
          error?.errorFields
        ) {
          return;
        }
      }
    };


  const handleClose =
    () => {
      if (
        exporting
      ) {
        return;
      }


      onClose();
    };


  return (
    <AppModal

      open={
        open
      }

      width={
        620
      }

      title="Xuất báo cáo Excel"

      className="order-summary-export-modal"

      closable={
        !exporting
      }

      keyboard={
        !exporting
      }

      maskClosable={
        !exporting
      }

      onCancel={
        handleClose
      }

      footer={
        <div className="order-summary-export-modal__footer">
          <Button
            className="order-summary-export-modal__cancel"

            disabled={
              exporting
            }

            onClick={
              handleClose
            }
          >
            Hủy
          </Button>


          <Button
            icon={
              <FileExcelOutlined />
            }

            className="order-summary-export-modal__submit"

            loading={
              exporting
            }

            disabled={
              loadingUnits ||
              exporting
            }

            onClick={
              handleSubmit
            }
          >
            Xuất Excel
          </Button>
        </div>
      }
    >
      <div className="order-summary-export-modal__body">
        <div className="order-summary-export-modal__context">
          <div className="order-summary-export-modal__context-icon">
            <ShopOutlined />
          </div>


          <div>
            <div className="order-summary-export-modal__context-label">
              Dữ liệu sẽ được xuất cho
            </div>


            <div className="order-summary-export-modal__context-value">
              {kitchenName ||
                "Bếp đang chọn"}
            </div>
          </div>
        </div>


        <Form
          form={
            form
          }

          layout="vertical"

          className="order-summary-export-modal__form"

          initialValues={{
            exportType:
              "date",

            unit:
              "ALL",
          }}
        >
          <Form.Item
            label="Khoảng thời gian"
            name="exportType"
          >
            <Radio.Group
              disabled={
                exporting
              }

              className="order-summary-export-modal__type"

              onChange={
                handleTypeChange
              }
            >
              <Radio value="date">
                Theo ngày
              </Radio>


              <Radio value="range-date">
                Theo khoảng ngày
              </Radio>
            </Radio.Group>
          </Form.Item>


          {type ===
          "date" ? (
            <Form.Item
              name="date"

              label="Ngày xuất dữ liệu"

              rules={[
                {
                  type:
                    "object",

                  required:
                    true,

                  message:
                    "Vui lòng chọn ngày!",
                },
              ]}
            >
              <DatePicker
                disabled={
                  exporting
                }

                className="order-summary-export-modal__picker"

                format="DD/MM/YYYY"
              />
            </Form.Item>
          ) : (
            <Form.Item
              name="rangeTime"

              label="Khoảng ngày"

              rules={[
                {
                  type:
                    "array",

                  required:
                    true,

                  message:
                    "Vui lòng chọn khoảng thời gian!",
                },
              ]}
            >
              <RangePicker
                disabled={
                  exporting
                }

                className="order-summary-export-modal__picker"

                format="DD/MM/YYYY"
              />
            </Form.Item>
          )}


          <Form.Item
            name="unit"

            label="Phạm vi đơn vị"

            rules={[
              {
                required:
                  true,

                message:
                  "Vui lòng chọn đơn vị!",
              },
            ]}
          >
            <AppSelect
              showSearch

              disabled={
                exporting
              }

              loading={
                loadingUnits
              }

              className="order-summary-export-modal__unit"

              placeholder="Chọn đơn vị"

              options={
                unitOptions
              }

              optionFilterProp="label"

              filterOption={(
                input,
                option,
              ) =>
                option.label
                  .toLowerCase()
                  .includes(
                    input.toLowerCase(),
                  )
              }
            />
          </Form.Item>
        </Form>
      </div>
    </AppModal>
  );
}


ExportOrdersModal.propTypes = {
  open:
    PropTypes.bool.isRequired,

  kitchenName:
    PropTypes.string,

  units:
    PropTypes.arrayOf(
      PropTypes.string,
    ),

  loadingUnits:
    PropTypes.bool,

  exporting:
    PropTypes.bool,

  onClose:
    PropTypes.func.isRequired,

  onExport:
    PropTypes.func.isRequired,
};


ExportOrdersModal.defaultProps = {
  kitchenName:
    "",

  units:
    [],

  loadingUnits:
    false,

  exporting:
    false,
};


export default ExportOrdersModal;
