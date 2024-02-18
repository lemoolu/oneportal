import { notify } from "@/utils";
import { generatePresignedUrl } from "./api";

export function getFileNameWithUid(file: { uid: string; name: string }) {
  const [name, nameWithOutSuffix, suffix] =
    file?.name?.match(/([\s\S]+)(\.[a-zA-Z0-9_-]+)$/) || [];
  const uid = file.uid.replace('rc', 'sp');
  return `${uid}${suffix}`;
}

export function getFileSizeOfMB(file: { size: number }) {
  return file.size / 1024 / 1024;
}
export const mapFileInfo = (
  fileFieldMap: Array<{
    name: string;
    value: string;
  }>,
  fileList: any[],
) => {

  const map = {
    attachment_name: 'name',
    attachment_size: 'doc_size',
    url: 'doc_url',
    attachment_comment: 'remark',
  };
  const res = [];
  if (fileFieldMap?.length && fileList?.length) {
    for (const file of fileList) {
      const record: any = {};
      for (const item of fileFieldMap) {
        record[item.name] = file[map[item.value]];
      }
      res.push(record);
    }
  }

  return res;
};


export async function download({
  fileUrl,
  fileName,
  TaskApi,
}: {
  fileUrl?: string;
  TaskApi?: any;
  fileName?: string;
}) {
  if (!fileUrl) {
    notify.error('文件地址不存在');
    return null;
  }

  // 生成下载地址
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
  const downloadUrl = res?.url;
  if (!downloadUrl) {
    notify.error('文件下载地址生成失败');
    return null;
  }

  // 生成下载文件
  const x = new window.XMLHttpRequest();
  x.open('GET', downloadUrl, true);
  x.responseType = 'blob';
  x.onload = () => {
    const url = window.URL.createObjectURL(x.response);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || fileUrl?.split('/static/')?.[1];
    a.click();
  };
  x.send();
}
