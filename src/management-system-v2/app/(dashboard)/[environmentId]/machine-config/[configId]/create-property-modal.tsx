'use client';

import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  App,
  Collapse,
  CollapseProps,
  Dropdown,
  Typography,
  Space,
  MenuProps,
  Select,
} from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { UserError } from '@/lib/user-error';
import { Localization, languageItemsSelect } from '@/lib/data/locale';

export type CreatePropertyModalReturnType = {
  key?: string;
  displayName: string;
  language: Localization;
  unit: string;
  value: string;
};

type CreatePropertyModalProps<T extends CreatePropertyModalReturnType> = {
  open: boolean;
  title: string;
  okText?: string;
  onCancel: () => void;
  onSubmit: (values: T[]) => Promise<{ error?: UserError } | void>;
  initialData?: T[];
  showKey?: boolean;
};

const CreatePropertyModal = <T extends CreatePropertyModalReturnType>({
  open,
  title,
  okText,
  onCancel,
  onSubmit,
  initialData,
}: CreatePropertyModalProps<T>) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const { message } = App.useApp();

  useEffect(() => {
    if (initialData) {
      // form.resetFields is not working, because initialData has not been
      // updated in the internal form store, eventhough the prop has.
      form.setFieldsValue(initialData);
    }
  }, [form, initialData]);

  const items: CollapseProps['items'] =
    (initialData?.length ?? 0) > 1
      ? initialData?.map((data, index) => ({
          label: data.displayName,
          children: <PropertyInputs index={index} />,
        }))
      : undefined;

  const onOk = async () => {
    try {
      // form.validateFields() only contains field values (that have been
      // rendered), so we have to merge with initalData. If you only open
      // the third accordion item, the object would look like this:
      // { 2: { definitionName: 'test', description: 'test' } }
      const values = Object.entries(await form.validateFields()) as any[];
      const mergedValues = (initialData ?? [{}]).map((value, index) => ({
        ...value,
        ...values.find(([key]) => key === index.toString())?.[1],
      }));

      // Let the parent of this modal handle the submission.
      setSubmitting(true);
      try {
        const res = await onSubmit(mergedValues);
        if (res?.error) {
          // UserError was thrown by the server
          message.open({ type: 'error', content: res.error.message });
        }
      } catch (e) {
        // Unkown server error or was not sent from server (e.g. network error)
        message.open({
          type: 'error',
          content: 'Something went wrong while submitting the data',
        });
      }
      setSubmitting(false);
    } catch (info) {
      // Validate Failed
    }
  };

  return (
    <Modal
      title={title}
      open={open}
      width={600}
      centered
      onCancel={() => {
        onCancel();
      }}
      destroyOnClose
      okButtonProps={{ loading: submitting }}
      okText={okText}
      wrapProps={{ onDoubleClick: (e: MouseEvent) => e.stopPropagation() }}
      onOk={onOk}
    >
      <Form
        form={form}
        layout="vertical"
        name="create_property_form"
        initialValues={initialData}
        autoComplete="off"
        // This resets the fields when the modal is opened again. (apparently
        // doesn't work in production, that's why we use the useEffect above)
        preserve={false}
      >
        {!initialData || initialData.length === 1 ? (
          <PropertyInputs index={0} />
        ) : (
          <Collapse style={{ maxHeight: '60vh', overflowY: 'scroll' }} accordion items={items} />
        )}
      </Form>
    </Modal>
  );
};

type CreatePropertyInputsProps = {
  index: number;
};

const PropertyInputs = ({ index }: CreatePropertyInputsProps, showKey: boolean) => {
  return (
    <>
      {showKey && (
        <Form.Item
          name={[index, 'key']}
          label="Property Key"
          rules={[{ required: true, message: 'Please fill out the Property Key' }]}
        >
          <Input />
        </Form.Item>
      )}
      <Form.Item
        name={[index, 'displayName']}
        label="Property Display Name"
        rules={[{ required: true, message: 'Please fill out the Property Display Name' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name={[index, 'value']}
        label="Property Value"
        rules={[{ required: false, message: 'Please fill out the Property Value' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name={[index, 'unit']}
        label="Property Unit"
        rules={[{ required: false, message: 'Please fill out the Property Unit' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name={[index, 'language']}
        label="Property Language"
        rules={[{ required: false, message: 'Please fill out the Property Language' }]}
      >
        <Select
          showSearch
          placeholder="Search to Select"
          optionFilterProp="label"
          filterSort={(optionA, optionB) =>
            (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
          }
          options={languageItemsSelect}
        />
      </Form.Item>
    </>
  );
};

export default CreatePropertyModal;
