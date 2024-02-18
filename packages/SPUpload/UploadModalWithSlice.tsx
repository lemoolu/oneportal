/*
 * @Author: 六弦(melodyWxy)
 * @Date: 2022-07-04 14:35:49
 * @LastEditors: sfy
 * @LastEditTime: 2023-05-16 11:21:01
 * @FilePath: /lcp-asset/packages/lcp-pro/src/components/SPTableWithModel/effect/component/UploadFile/index.tsx
 * @Description: update here
 */

import React, { FC, useState, useRef } from 'react';
import { Modal, Input, Form, Upload } from 'antd';
import { useSaveFile } from './effect';
import { UploadFileProps } from './type';
import { ModalLayout } from '@/asset/AssetTask/templates/Cascade/components';
import { useTranslation } from '@/locale/index';
// import Upload from './Upload';
import { useApi } from '@/effects';
import { CloudUploadOutlined } from '@ant-design/icons';
import useMetaStore from '@/store/useMetaStore';
import { getFileNameWithUid, getFileSizeOfMB } from './utils';
import { Api as FetchAPI } from '@/utils';
import { getPolicy, policyUpload } from '@/common/asset-apis/assetModel';
import Resumable from 'resumablejs';
import Uploader from './Uploader';

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
  multiple,
}) => {
  const TaskApi = useApi();
  const uploadHost = useRef<string>('');
  const [form] = Form.useForm();
  const { saveFile } = useSaveFile({ form, setUploadWrap, namespaceID, moduleID, moduleInfo, FetchAPI: TaskApi, reload, addEditRecord, mergeRowKey, uploadHost, fileConfig });
  const [fileList, setList] = useState<any>([]);
  const [t, i18n] = useTranslation();
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

  const { isMobile } = useMetaStore();
  const ref = useRef('');

  const handleUpload = (fileObj: any,) => {
    console.log('test----->, fileObj, ----->', fileObj);
    const { file, onProgress, onSuccess, onError } = fileObj;

    const fileName = getFileNameWithUid(fileObj.file);
    const uploader = new Uploader({TaskApi});
    uploader.addFile(file, {
      onProgress, onSuccess, onError
    });
    // uploader.upload();
    // const uploader = new Resumable({
    //   target: '/api/photo/redeem-upload-token',
    //   query: {
    //     upload_token: 'my_token',
    //   },
    //   // chunkSize: 1 * 1024 * 1024,
    // });
    // uploader.on('uploadStart', () => {
    //   console.log('uploadStart, file');
    // });
    // uploader.on('fileAdded', (message, file) => {
    //   console.log('fileAdded', file);
    // });
    // uploader.on('fileError', (message, file) => {
    //   console.log('message, file', message, file);
    // });
    // uploader.on('catchAll', (...arg) => {
    //   console.log('catchAll', arg);
    // });
    // uploader.addFile(file);
    // setTimeout(() => {
    //   uploader.upload();
    // }, 500);
    // console.log(file, uploader, uploader.getSize());

    // 获取签名
    // getPolicy(FetchAPI, fileName).then((res) => {
    //   const { xamzAlgorithm, xamzCredential, policy, xamzSignature, xamzDate, host } = res;
    //   onHostChange?.(host);
    //   ref.current = host;
    //   const formData = new FormData();
    //   formData.append('key', fileName);
    //   formData.append('x-amz-algorithm', xamzAlgorithm);
    //   formData.append('x-amz-credential', xamzCredential);
    //   formData.append('policy', policy);
    //   formData.append('x-amz-signature', xamzSignature);
    //   formData.append('x-amz-date', xamzDate);
    //   formData.append('file', file.file);
    //   // 上传文件
    //   policyUpload(FetchAPI, host, formData).then(() => {
    //     file.onProgress({ percent: 100 });
    //     file.onSuccess();
    //   });
    // });
  };

  if (!uploadWrapVisible) {
    return null;
  }
  return (
    <ModalLayout
      title={t('UploadAttachment') + '-切片'}
      width="600px"
      visible={uploadWrapVisible}
      onOk={saveFile}
      onCancel={closeUplaod}
      okText={t('Save')}
      cancelText={t('Cancel')}
      mobileHeight="40vh"
    >
      <Form
        form={form}
        name="basic"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 16 }}
        autoComplete="off"
      >
        <Form.Item label="文件" getValueFromEvent={normFile} name='file'>
          {/* <Upload
            multiple={multiple}
            onHostChange={host => {
              uploadHost.current = host;
            }}
          /> */}
          <Upload.Dragger
            multiple
            maxCount={10}
            action={'#'}
            customRequest={handleUpload}
            showUploadList={undefined}
            onChange={({ file, fileList }) => {
              // const uploaded = fileList.filter(f => f.status === 'done');
              // onChange?.({
              //   file: {
              //     name: file.name,
              //     size: file.size,
              //     uid: file.uid,
              //     status: file.status,
              //     url: `${ref.current}/${getFileNameWithUid(file)}`,
              //   },
              //   fileList: fileList.map(f => ({
              //     name: f.name,
              //     size: f.size,
              //     uid: f.uid,
              //     status: f.status,
              //     url: `${ref.current}/${getFileNameWithUid(f)}`,
              //   })),
              // });
            }}
          >
            <div style={{ height: '40px', background: 'rgba(1,100,200,0.1)', margin: '30px 70px', lineHeight: '40px', color: '#0164C8', fontSize: '14px' }}>
              <div> <CloudUploadOutlined /> 选择或拖拽上传文件</div>
            </div>
          </Upload.Dragger>
        </Form.Item>
        <Form.Item
          label={t('Remark')}
          name="attachment_comment"
        >
          <Input />
        </Form.Item>
      </Form>
    </ModalLayout >
  );
};


export default UploadModal;