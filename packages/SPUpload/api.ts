
export const generatePresignedUrl = async (params: any, TaskApi: any, options?: {}) => {
  const [err, res] = await TaskApi({
    method: 'post',
    url: `/api/gateway/metabase/file/generate_presigned_url`,
    data: params,
    ...options
  });
  return res?.data;
};

export const getNeedUploadUrl = async (params: any, TaskApi: any) => {
  const [err, res] = await TaskApi({
    method: 'post',
    url: `/api/gateway/metabase/file/multipart/init`,
    data: params,
  });
  return res?.data;
};

export const singleFileComplete = async (params: any, TaskApi: any) => {
  const result = await TaskApi({
    method: 'post',
    url: `/api/gateway/metabase/file/multipart/item/complete`,
    data: params,
  });
  return result;
};

export const mergeFile = async (params: any, TaskApi: any) => {
  const result = await TaskApi({
    method: 'post',
    url: `/api/gateway/metabase/file/multipart/complete`,
    data: params,
  });
  return result;
};