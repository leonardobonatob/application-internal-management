import dayjs from 'dayjs';
import { Tag } from 'antd';
import React from 'react';

import CrudModule from '@/modules/CrudModule';
import LeadForm from '@/forms/LeadForm';

import configPage from './config';

export default function Lead() {
  const searchConfig = {
    displayLabels: ['firstname', 'company'],
    searchFields: 'firstname,company',
    outputValue: '_id',
  };
  const entityDisplayLabels = ['number', 'company'];

  const readColumns = [
    {
      title: 'DirectoryID',
      dataIndex: 'lastName',
    },
    {
      title: 'Company',
      dataIndex: 'company',
    },
    {
      title: 'AccountID',
      dataIndex: 'firstName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
    },
    {
      title: 'Status',
      dataIndex: 'status',
    },
  ];

  const dataTableColumns = [
    {
      title: 'DirectoryID',
      dataIndex: ['lastName'],
    },
    {
      title: 'Company',
      dataIndex: ['company'],
    },
    {
      title: 'AccountID',
      dataIndex: ['firstName'],
    },
    {
      title: 'Email',
      dataIndex: ['email'],
    },
    {
      title: 'Phone',
      dataIndex: ['phone'],
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => {
        let color =
          status === 'pending'
            ? 'yellow'
            : status === 'error'
            ? 'red'
            : status === 'running'
            ? 'green'
            : status === 'paused'
            ? 'orange'
            : 'red';
        return <Tag color={color}>{status && status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Created At',
      dataIndex: 'created',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
  ];

  const config = {
    ...configPage,
    readColumns,
    dataTableColumns,
    searchConfig,
    entityDisplayLabels,
  };
  return (
    <CrudModule
      createForm={<LeadForm />}
      updateForm={<LeadForm isUpdateForm={true} />}
      config={config}
    />
  );
}
