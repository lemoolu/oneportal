import { UseRenderProps } from './type';

function formatFileSize(fileSize: number) {
  if (fileSize < 1024) {
    return `${fileSize}B`;
  } else if (fileSize < (1024 * 1024)) {
    const temp = fileSize / 1024;
    return `${temp.toFixed(2)}KB`;
  } else if (fileSize < (1024 * 1024 * 1024)) {
    var temp = fileSize / (1024 * 1024);
    return `${temp.toFixed(2)}MB`;
  } else {
    var temp = fileSize / (1024 * 1024 * 1024);
    return `${temp.toFixed(2)}GB`;
  }
}

const useRender: UseRenderProps = ({
  fileConfig,
  columns,
}) => {
  if (fileConfig?.fileModule && fileConfig?.fileFieldMap) {
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
    const filed = (columns || []).find((x) => x.dataIndex === fileSizeField);

    if (filed) {
      filed.render = (v: string | number) => {
        if (v) {
          const value = Number(v);
          return formatFileSize(value);
        }
        return v;
      };
    }
  }
  return columns;
};

export default useRender;
