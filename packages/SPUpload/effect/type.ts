/*
 * @Author: 六弦(melodyWxy)
 * @Date: 2022-07-04 14:41:37
 * @LastEditors: sfy
 * @LastEditTime: 2022-12-29 10:42:18
 * @FilePath: /lcp-asset/packages/lcp-pro/src/components/SPTableWithModel/effect/component/UploadFile/effect/type.ts
 * @Description: update here
 */
// import { ModuleInfo } from '../../../../../../../common/model-apis/type';
import { MutableRefObject } from 'react';

export interface UseSaveFilePropParams {
  form: any;
  setUploadWrap: UpdateUploadWrap;
  namespaceID: string;
  moduleID: string;
  moduleInfo: any;
  mergeRowKey: any;
  addEditRecord: any;
  reload: any;
  uploadHost: any;
  fileConfig?: any;
  FetchAPI: any;
}

export interface UseSaveFileProp {
  (o: UseSaveFilePropParams): any;
}

export type UpdateUploadWrap = (isShow: boolean) => void;

export interface UseRenderProps {
  (params: {
    fileConfig: {
      fileModule: boolean;
      fileAutoSave: boolean;
      fileFieldMap: Array<{ name: string; value: string }>;
    };
    columns: any[];
  }): any;
}
