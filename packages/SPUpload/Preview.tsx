import { useApi } from '@/effects';
import { useTranslation } from '@/locale/index';
import { notify } from '@/utils';
import { DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import { useSetState } from 'ahooks';
import { Modal } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { generatePresignedUrl } from './api';
import styles from './index.module.less';
import { download } from './utils';

export default function Preview(props: {
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
  const [previewProps, setPreviewProps] = useSetState({
    visible: false,
  });
  const [t, i18n] = useTranslation();
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(null);
  const TaskApi = useApi();
  const [fileShareUrl, setFileUrl] = useState(''); // 修改过服务,默认文件地址不能打卡，需要请求拿到新的地址

  const {
    fileName,
    fileUrl,
    fileType,
  } = useMemo(() => {
    const res = {
      fileName: props.fileName,
      fileUrl: props.fileUrl,
      fileType: '',
    };
    if (props.fileFieldMap) {
      const url =
        props.fileFieldMap?.find((item: any) => item.value === 'url')?.name ||
        'url';
      const attachmentName =
        props.fileFieldMap?.find(
          (item: any) => item.value === 'attachment_name',
        )?.name || 'attachment_name';
      res.fileUrl = props.record?.[url];
      res.fileName = props.record?.[attachmentName];
    }
    if (res.fileUrl) {
      const arr = res.fileUrl?.split('.');
      res.fileType = arr?.[arr.length - 1] || '';
    }

    return res;
  }, [props.fileName, props.fileUrl, props.fileFieldMap, props.record]);

  const isImg = ['png', 'jpg', 'jpeg'].includes(fileType);

  const getShareUrl = async () => {
    if (!fileUrl) {
      notify.error('文件地址不存在');
      return null;
    }
    const res: Promise<any> = await generatePresignedUrl(
      {
        expiryTime: 1, // 这个是时间
        objectName: fileUrl?.split('/static/')?.[1], // 这个是文件名
        timeType: 'hours', // 这个是单位 seconds minutes hours days
      },
      TaskApi,
      {
        messageOptions: {
          error: false,
        },
      },
    );
    setFileUrl(res?.url);
    return res?.url;
  };

  useEffect(() => {
    fileUrl && isImg && !props.children && getShareUrl();
  }, [fileUrl, TaskApi]);


  const onPreviewClick = async (e) => {
    e?.stopPropagation();
    const url = await getShareUrl();
    if (url) {
      if (['pdf'].includes(fileType)) {
        window.open(url, '_blank');
      } else {
        setPreviewProps({ visible: true });
      }
    } else {
      notify.error('该文件不存在');
    }
  };

  const onDownload = async () => {
    download({
      fileUrl,
      fileName,
      TaskApi,
    });
  };

  const closeModal = () => {
    setPreviewProps({
      visible: false,
    });
  };

  return (
    <>
      {props.children ? (
        <div onClick={onPreviewClick}>{props.children}</div>
      ) : (
        <>
          {isImg ? (
            <div className={styles.previewBox}>
              <div className={styles.previewIcon} onClick={onPreviewClick}>
                <EyeOutlined style={{ color: '#fff', fontSize: 16 }} />
              </div>
              <img src={fileShareUrl} className={styles.img} />
            </div>
          ) : (
            <div>
              <a href={fileShareUrl} target="_blank" rel="noreferrer">
                {fileShareUrl}
              </a>
              <a onClick={onDownload} style={{ padding: 4 }}>
                <DownloadOutlined />
              </a>
            </div>
          )}
        </>
      )}
      {previewProps.visible && (
        <Modal
          title="预览"
          width="800px"
          visible={true}
          footer={null}
          onCancel={closeModal}
          maskClosable={false}
        >
          <div>
            {isImg ? <img style={{ width: '100%' }} src={fileShareUrl} /> : ''}
            {
              // ['pdf'].includes(fileType) ?
              //   <div style={{ margin: '12px 0px' }}>
              //     {/* <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
              //       <Page pageNumber={pageNumber} />
              //     </Document> */}
              //     <a href={fileUrl} target="_blank">预览：{fileName}</a>
              //   </div> : ''
            }
            <div style={{ padding: 8 }}>
              <a onClick={onDownload}>下载</a>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
