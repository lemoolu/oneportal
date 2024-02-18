import React, { FC, useState, useRef } from 'react';
import { Modal, Input, Form, Upload } from 'antd';
import { CloudUploadOutlined } from '@ant-design/icons';
import { AddOutline } from 'antd-mobile-icons';
import { getPolicy, policyUpload } from '@/common/asset-apis/assetModel';
// import { useSaveFile } from './effect';
// import { UploadFileProps } from './type';
import { ModalLayout } from '@/asset/AssetTask/templates/Cascade/components';
import { Api as FetchAPI, notify } from '@/utils';
import useMetaStore from '@/store/useMetaStore';
import { getFileNameWithUid } from './utils';

export default function SPUpload({
  onChange,
  multiple = true,
  onHostChange,
  disabled,
  children,
  maxCount,
  showUploadList,
}: {
  onChange?: (val: {
    file: any;
    fileList: Array<{ name: string; size?: number; url?: string; status?: string }>;
  }) => void;
  onHostChange?: (host: string) => void;
  multiple?: boolean;
  disabled?: boolean;
  children?: any;
  maxCount?: number;
}) {
  const { isMobile } = useMetaStore();
  const ref = useRef('');

  const handleUpload = (file: any) => {
    const fileName = getFileNameWithUid(file.file);
    // 获取签名
    getPolicy(FetchAPI, fileName).then((res) => {
      const { xamzAlgorithm, xamzCredential, policy, xamzSignature, xamzDate, host } = res;
      onHostChange?.(host);
      ref.current = host;
      const formData = new FormData();
      formData.append('key', fileName);
      formData.append('x-amz-algorithm', xamzAlgorithm);
      formData.append('x-amz-credential', xamzCredential);
      formData.append('policy', policy);
      formData.append('x-amz-signature', xamzSignature);
      formData.append('x-amz-date', xamzDate);
      formData.append('file', file.file);
      // 上传文件
      const options = {
        onUploadProgress: (progressEvent) => {
          const res = Number((progressEvent.loaded / progressEvent.total * 100).toFixed(1));
          file.onProgress({ percent: res });
        },
      };
      policyUpload(FetchAPI, host, formData, options).then((result) => {
        const [err, res] = result || [];
        if (err) {
          notify.error(err?.message);
          file.onError(err);
          return;
        }
        file.onSuccess();
      });
    });
  };

  const uploadProps = {
    multiple,
    maxCount,
    action: '#',
    customRequest: handleUpload,
    showUploadList,
    onChange: ({ file, fileList }) => {
      // const uploaded = fileList.filter(f => f.status === 'done');
      onChange?.({
        file: {
          name: file.name,
          size: file.size,
          uid: file.uid,
          status: file.status,
          url: `${ref.current}/${getFileNameWithUid(file)}`,
        },
        fileList: fileList.map(f => ({
          name: f.name,
          size: f.size,
          uid: f.uid,
          status: f.status,
          url: `${ref.current}/${getFileNameWithUid(f)}`,
        })),
      });
    },
    disabled,
  };

  if (children) {
    return (
      <Upload {...uploadProps}>{children}</Upload>
    );
  }
  return (
    <Upload.Dragger {...uploadProps} >
      <div style={{ height: '40px', background: 'rgba(1,100,200,0.1)', margin: '30px 70px', lineHeight: '40px', color: '#0164C8', fontSize: '14px' }}>
        {
          !isMobile ?
            <div> <CloudUploadOutlined /> 选择或拖拽上传文件</div> :
            <AddOutline fontSize={38} />
        }
      </div>
    </Upload.Dragger>
  );
}
