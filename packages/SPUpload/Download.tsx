import { ButtonLayout } from '@/asset/AssetTask/templates/Cascade/components';
import { message } from 'antd';
import React from 'react';
import { useTranslation } from '@/locale/index';
import { notify } from '@/utils';
import { useApi } from '@/effects';
import { download } from './utils';

export default function Download(props: {
  // 形式1：文件名
  fileName?: string;
  // 形式1：文件下载地址
  fileUrl?: string;
  // 形式2：上传文件映射
  fileFieldMap?: Array<{ name: string; value: string }>;
  // 形式2：行数据
  record?: any;
  children?: React.ReactNode;
}) {
  const TaskApi = useApi();
  const [t, i18n] = useTranslation();
  let fileName = props.fileName;
  let fileUrl = props.fileUrl;
  if (props.fileFieldMap) {
    const url = props.fileFieldMap?.find((item: any) => item.value === 'url')?.name || 'url';
    const attachmentName = props.fileFieldMap?.find((item: any) => item.value === 'attachment_name')?.name || 'attachment_name';
    fileUrl = props.record?.[url];
    fileName = props.record?.[attachmentName];
  }

  const onClick = () => {
    if (fileUrl) {
      download({
        fileUrl,
        fileName,
        TaskApi,
      });
    } else {
      notify.error('该文件地址不存在');
    }
  };

  const child = props.children || (
    <ButtonLayout type="link" key="editable">
      {t('Download')}
    </ButtonLayout>
  );

  if (React.Children.count(child) === 1) {
    return React.cloneElement(child as any, { onClick });
  }

  return (
    <span onClick={onClick}>
      {child}
    </span>
  );
}
