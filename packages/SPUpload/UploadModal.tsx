/*
 * @Author: 六弦(melodyWxy)
 * @Date: 2022-07-04 14:35:49
 * @LastEditors: sfy
 * @LastEditTime: 2023-05-16 11:21:01
 * @FilePath: /lcp-asset/packages/lcp-pro/src/components/SPTableWithModel/effect/component/UploadFile/index.tsx
 * @Description: update here
 */

import React, { FC, useState, useRef, useMemo } from 'react';
import { Modal, Input, Form, Tabs, Table } from 'antd';
import { useSaveFile } from './effect';
import { UploadFileProps } from './type';
import { ModalLayout } from '@/asset/AssetTask/templates/Cascade/components';
import { useTranslation } from '@/locale/index';
import Upload from './Upload';
import { useApi } from '@/effects';
import { useAsyncEffect } from 'ahooks';
import { modelPage } from '@/api/page.api';
import { mapFileInfo } from './utils';

const UploadModal: FC<UploadFileProps> = ({
  uploadWrapVisible,
  setUploadWrap,
  namespaceID,
  moduleID,
  moduleInfo,
  reload,
  addEditRecord,
  mergeRowKey,
  fileConfig,
  isMobile,
  multiple,
}) => {
  const TaskApi = useApi();
  const uploadHost = useRef<string>('');
  const [form] = Form.useForm();
  const { saveFile } = useSaveFile({ form, setUploadWrap, namespaceID, moduleID, moduleInfo, FetchAPI: TaskApi, reload, addEditRecord, mergeRowKey, uploadHost, fileConfig });
  const [fileList, setList] = useState<any>([]);
  const [t, i18n] = useTranslation();
  const fileCentreSelectList = useRef<any[]>([]);
  const [activeKey, setActiveKey] = useState('1');

  const [fileCentreList, setFileCentreList] = useState([]);
  const normFile = (file: any) => {
    if (Array.isArray(file)) {
      return file;
    }
    setList(file?.fileList);
    return file?.fileList;
  };

  const closeUplaod = () => {
    setUploadWrap(false);
    form?.resetFields();
  };
  const columns = useMemo(() => {
    return [{
      title: '文件名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '文件大小',
      dataIndex: 'doc_size',
      key: 'doc_size',
    },
    {
      title: '文件地址',
      dataIndex: 'doc_url',
      key: 'doc_url',
    }];
  }, []);

  useAsyncEffect(async () => {
    const res = await modelPage({ appId: 'tech', modelId: 'da_document_manage' });
    if (res?.data?.length) {
      setFileCentreList(res?.data?.map((item, idx) => ({ ...item, key: idx })));
    }
  }, []);

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
      fileCentreSelectList.current = selectedRows;
    },
  
  };
  const onSave = () => {
    if (activeKey === '1') {
      saveFile();
    } else if (activeKey === '2') {
      // 拿到数据做映射
      const newFileList = mapFileInfo(fileConfig?.fileFieldMap, fileCentreSelectList.current);
      addEditRecord(newFileList);
      setUploadWrap(false);
    }
  };

  // const beforeUpload = (file:any) => {
  //   // 文件大小限制
  //   if (file.size > size) {
  //     notify.error(`文件大小不能超过${size}`)
  //     return Upload.LIST_IGNORE
  //   }
  // }
  if (!uploadWrapVisible) {
    return null;
  }
  return (
    <ModalLayout
      title={t('UploadAttachment')}
      width="600px"
      visible={uploadWrapVisible}
      onOk={onSave}
      onCancel={closeUplaod}
      okText={t('Save')}
      cancelText={t('Cancel')}
      mobileHeight="40vh"
    >
      <Tabs activeKey={activeKey} onTabClick={(key) => { setActiveKey(key) }}>
        <Tabs.TabPane tab="本地文件" key="1">
          <Form
            form={form}
            name="basic"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
            autoComplete="off"
          >
            <Form.Item name="file" label="文件" getValueFromEvent={normFile}>
              <Upload
                multiple={multiple}
                onHostChange={host => {
                  uploadHost.current = host;
                }}
              />
            </Form.Item>
            <Form.Item
              label={t('Remark')}
              name="attachment_comment"
            >
              <Input />
            </Form.Item>
          </Form>
        </Tabs.TabPane>
        <Tabs.TabPane tab="文件中心" key="2">
          <Table
            dataSource={fileCentreList}
            columns={columns}
            size="small"
            rowSelection={{
              type: 'checkbox',
              ...rowSelection,
            }}
          />
        </Tabs.TabPane>
      </Tabs>

    </ModalLayout>
  );
};


export default UploadModal;