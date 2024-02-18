import { ButtonLayout } from '@/asset/AssetTask/templates/Cascade/components';
import { Form, InputNumber, Modal, Space, message } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '@/locale/index';
import { useSetState } from 'ahooks';
import { notify } from '@/utils';
import styles from './index.module.less';
import { EyeOutlined, CheckCircleFilled } from '@ant-design/icons';
import { generatePresignedUrl } from './api';
import { useApi } from '@/effects';
import moment from 'moment';
// import { Document, Page, pdfjs } from 'react-pdf';

export default function Share(props: {
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

  const {
    fileName,
    fileUrl,
    fileType,
  } = useMemo(() => {
    let fileName = props.fileName;
    let fileUrl = props.fileUrl;
    let fileType = '';
    if (props.fileFieldMap) {
      const url = props.fileFieldMap?.find((item: any) => item.value === 'url')?.name || 'url';
      const attachmentName = props.fileFieldMap?.find((item: any) => item.value === 'attachment_name')?.name || 'attachment_name';
      fileUrl = props.record?.[url];
      fileName = props.record?.[attachmentName];
    }
    if (fileUrl) {
      const arr = fileUrl.split('.');
      fileType = arr?.[arr.length - 1];
    }
    return {
      fileName,
      fileUrl,
      fileType,
    };
  }, [props.fileName, props.fileUrl, props.fileFieldMap, props.record]);

  useEffect(() => {
    setState({ isShared: false });
  }, [fileUrl]);

  const onClick = (e) => {
    e?.stopPropagation();
    if (fileUrl) {
      setPreviewProps({ visible: true });
    } else {
      notify.error('文件地址不存在');
    }
  };

  const closeModal = () => {
    setPreviewProps({
      visible: false,
    });
  };

  const [state, setState] = useSetState({
    day: 1,
    hour: 0,
    isShared: false,
    shareUrl: '',
    expiredTime: '',
  })
  const TaskApi = useApi();

  const onGen = () => {
    const hours = state.day * 24 + state.hour;
    generatePresignedUrl({
      "expiryTime": hours, //这个是时间
      "objectName": fileUrl?.split('/static/')?.[1], //这个是文件名
      "timeType": "hours"  //这个是单位 seconds minutes hours days
    }, TaskApi).then(res => {
      setState({
        isShared: true,
        shareUrl: res.url,
        expiredTime: moment().add('hour', hours).format('YYYY-MM-DD HH:mm'),
      })
    });
  }

  const onCopy = () => {
    const inputElement = document.querySelector('#shareUrl');
    inputElement?.select();
    document.execCommand('copy');
    message.success('链接复制成功');
  }

  return (
    <>
      {props.children ?
        <div onClick={onClick}>
          {props.children}
        </div>
        :
        <ButtonLayout type="link" key="preview">
          {t('Share')}
        </ButtonLayout>
      }
      {previewProps.visible &&
        <Modal
          title="分享设置"
          width="600px"
          visible={true}
          footer={
            state.isShared ?
              <Space>
                <ButtonLayout type="primary" onClick={onCopy}>
                  复制链接
                </ButtonLayout>
              </Space>
              :
              <Space>
                <ButtonLayout type="primary" onClick={onGen}>
                  生成链接
                </ButtonLayout>
                <ButtonLayout type="normal" onClick={closeModal}>
                  取消
                </ButtonLayout>
              </Space>
          }
          onCancel={closeModal}
          maskClosable={false}
        >
          {state.isShared &&
            <div>
              <div style={{ paddingBottom: 12 }}>
                <CheckCircleFilled style={{ fontSize: '16px', color: '#23B067' }} /> 成功创建链接
              </div>

              <div style={{ padding: 12, marginBottom: 8, backgroundColor: '#F6F8FB' }}>
                {state.shareUrl}
              </div>
              <div style={{ padding: 2 }}>链接有效期：{state.day}天{state.hour}小时</div>
              <div style={{ padding: 2 }}>到期时间：{state.expiredTime}</div>
              <input id="shareUrl" value={state.shareUrl} style={{ opacity: 0 }}></input>
            </div>
          }
          {!state.isShared &&
            <div>
              <Form
                layout={'vertical'}
              >
                <Form.Item label="链接有效期" required>
                  <Space>
                    <Form.Item name="day">
                      <InputNumber min={0} value={state.day} onChange={v => setState({ day: v })} /> 天
                    </Form.Item>
                    <Form.Item name="hour">
                      <InputNumber min={0} value={state.hour} onChange={v => setState({ hour: v })} /> 小时
                    </Form.Item>
                  </Space>
                </Form.Item>
              </Form>
            </div>
          }
        </Modal>
      }
    </>
  );
}
