/*
 * @Author: 六弦(melodyWxy)
 * @Date: 2022-07-04 14:35:57
 * @LastEditors: sfy
 * @LastEditTime: 2023-05-16 10:56:36
 * @FilePath: /lcp-asset/packages/lcp-pro/src/components/SPTableWithModel/effect/component/UploadFile/type.ts
 * @Description: update here
 */
import { ModuleInfo } from '@/common/model-apis/type';

export interface UploadFileProps {
  uploadWrapVisible: boolean;
  setUploadWrap: UpdateUploadWrap;
  namespaceID: string;
  moduleID: string;
  moduleInfo: ModuleInfo;
  FetchAPI: any;
  mergeRowKey: any;
  fileConfig?: any;
  addEditRecord: any;
  reload: any;
  isMobile?: boolean;
  multiple?: boolean;
}

export type UpdateUploadWrap = (isShow: boolean) => void;
