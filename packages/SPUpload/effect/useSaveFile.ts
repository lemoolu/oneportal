/*
 * @Author: 六弦(melodyWxy)
 * @Date: 2022-07-04 14:41:56
 * @LastEditors: sfy
 * @LastEditTime: 2022-12-29 10:41:33
 * @FilePath: /lcp-asset/packages/lcp-pro/src/components/SPTableWithModel/effect/component/UploadFile/effect/useSaveFile.ts
 * @Description: update here
 */
import { message } from 'antd';
import { UseSaveFileProp } from './type';
import { addAssetModuleByRequest } from '@/common/asset-apis/addAssetModuleByRequest';
import useValuesStore from '@/store/useValuesStore';
import { notify } from '@/utils';

export const useSaveFile: UseSaveFileProp = ({ form, setUploadWrap, namespaceID, moduleID, moduleInfo, FetchAPI, reload, addEditRecord, mergeRowKey, uploadHost, fileConfig }) => {
  const { realoadValue } = useValuesStore();
  const saveFile = async () => {
    const fileList = form?.getFieldsValue().file;
    await form.validateFields();
    if (!(fileList?.length > 0)) {
      notify.error('请上传文件');
      return;
    }
    if (fileList.some((item: any) => item.status !== 'done')) {
      notify.error('文件上传失败');
      return;
    }
    const reqList: any[] = [];
    const addRecords: any[] = [];
    // 模型字段映射
    let fileNameField = 'attachment_name';
    let fileSizeField = 'attachment_size';
    let fileRemarkField = 'attachment_comment';
    let fileUrlField = 'url';
    if (fileConfig?.fileFieldMap && fileConfig?.fileFieldMap?.length > 0) {
      fileNameField = fileConfig.fileFieldMap.find((item: any) => item.value === 'attachment_name')?.name || 'attachment_name';
      fileSizeField = fileConfig.fileFieldMap.find((item: any) => item.value === 'attachment_size')?.name || 'attachment_size';
      fileRemarkField = fileConfig.fileFieldMap.find((item: any) => item.value === 'attachment_comment')?.name || 'attachment_comment';
      fileUrlField = fileConfig.fileFieldMap.find((item: any) => item.value === 'url')?.name || 'url';
    }
    fileList.forEach((item: any) => {
      // const values = {
      //   attachment_comment: form?.getFieldsValue()?.attachment_comment,
      //   attachment_name: item.name,
      //   attachment_size: item.size,
      //   url: `${uploadHost.current}/${item.name}`,
      // }
      const values: Record<any, any> = {};
      values[fileNameField] = item.name;
      values[fileSizeField] = item.size;
      values[fileRemarkField] = form?.getFieldsValue()?.attachment_comment;
      // values[fileUrlField] = `${uploadHost.current}/${item.name}`;
      values[fileUrlField] = item.url;
      if (fileConfig?.fileAutoSave) {
        const p = new Promise((resolve) => {
          resolve(
            addAssetModuleByRequest(FetchAPI, {
              namespaceID,
              moduleID,
              moduleInfo,
              values: { ...values, ...(fileConfig.mainModuleData || {}) },
            }),
          );
        });
        reqList.push(p);
      } else {
        const record: Record<any, any> = values;
        // const module = moduleInfo.clone();
        // record.RECORD = new compose.Record(module, record);
        // Object.keys(record.RECORD.values).forEach((json) => {
        //   if (record.RECORD.values[json] !== undefined) {
        //     record[json] = record.RECORD.values[json];
        //   }
        // });
        addRecords.push({ ...record, ...(fileConfig?.fileData || {}) });
      }
    });
    Promise.all(reqList).then(() => {
      if (fileConfig?.fileAutoSave) {
        realoadValue();
        // reload();
      } else {
        addEditRecord(addRecords);
      }
      setUploadWrap(false);
      form?.resetFields();
    });
  };
  return {
    saveFile,
  };
};
