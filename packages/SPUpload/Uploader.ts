import { chunkUpload } from '@/common/asset-apis/assetModel';
import { Api as FetchAPI, notify } from '@/utils';
import SparkMD5 from 'spark-md5';
import { getNeedUploadUrl, mergeFile, singleFileComplete } from './api';
interface File {
  uid: string;
  name: string;
  size: number;
  type: string;
  slice: any;
}

type EventType = 'error' | 'progress' | 'finish';

interface Chunk {
  file: File;
  md5: string;
  percent: number;
  num: number;
  status?: 'done' | 'error' | 'uploading';
}

interface Config {
  TaskApi: any;
}
interface IOptions {
  onProgress: (event: { percent: number }) => void;
  onError: (event: Error, body?: Object) => void;
  onSuccess: (body: Object) => void;
}

export default class Uploader {
  private url = '';
  private chunkSize = 1024 * 1024 * 10;
  private files: Array<{ file: File; chunks: Chunk[]; fileMd5: string }> = [];
  private uploadFileurl: Array<{
    fileMd5: string;
    uploadUrls: any[];
    uploadId: string;
  }> = [];
  private events: { [eventtype: string]: any[] } = {};
  private TaskApi = null;
  private currentFile = {};

  constructor(config: Config) {
    this.TaskApi = config.TaskApi;
  }

  log(v: any) {
    console.log('Uploader', v);
  }

  async uploadAction(
    chunk: {
      file: Blob;
      md5: string;
      partNumber: number;
      uploadId: string;
      uploadUrl: string;
    },
    // uploadInfo: { done: boolean; uploadUrl: string; uploadId: string },
    // uploadId: string,
  ) {
    // 校验该分片是否已经上传
    // const { done } = uploadInfo;
    // if (done) {
    //   chunk.percent = 100;
    //   return { uploadInfo };
    // }
    const { file, md5, partNumber, uploadId, uploadUrl } = chunk;
    // const formData = new FormData();
    // formData.append('file', file);
    // 上传文件
    // const host = uploadInfo?.uploadUrl;
    // const options = {
    //   onUploadProgress: (progressEvent: any) => {
    //     const res = Number(
    //       ((progressEvent.loaded / progressEvent.total) * 100).toFixed(1),
    //     );
    //     chunk.percent = res;
    //   },
    // };
    // 这里必须直接file文件流，不可以formData包裹，不然minio接口
    const result = await chunkUpload(FetchAPI, uploadUrl, file, {});
    const [err, res2] = result || [];
    if (err) {
      notify.error(err?.message);
      return Promise.reject(false);
    } else {
      // 告诉后端，上传完成
      const [err, res] = await singleFileComplete(
        {
          md5: md5,
          partNumber,
          uploadId: uploadId,
        },
        this.TaskApi,
      );
      if (err) {
        notify.error(err?.message);
        // chunk.status = 'error';
        return Promise.reject(false);
      }
      // chunk.status = 'done';
      // chunk.percent = 100;

      return true;
    }
  }

  upload() {
    const promiseList = [];
    // 遍历所有的文件
    // for (let i = 0; i < this.files?.length; i++) {
    //   // 拿到文件、和对应文件的所有分块的上传地址
    //   const file = this.files[i];
    //   const uploadurls = this.uploadFileurl?.find(item => item?.fileMd5 === file?.fileMd5)?.uploadUrls || [];
    //        file.chunks.forEach((chunk) => {
    //     promiseList.push(this.uploadAction(chunk));
    //   });
    // }
    this.files.forEach((file) => {
      const uploadInfo = this.uploadFileurl?.find(
        (item) => item?.fileMd5 === file?.fileMd5,
      );
      const uploadurls = uploadInfo?.uploadUrls || [];

      this.currentFile = file;
      const n = file.chunks.length;
      file.chunks.forEach((chunk, index) => {
        const fileInfo = uploadurls[index];
        promiseList.push(
          this.uploadAction(chunk, fileInfo, uploadInfo?.uploadId!),
        );
        file?.file?.onProgress?.({ percent: Math.floor(index / n) });
      });
    });

    Promise.all(promiseList)
      .then((res) => {
        mergeFile(
          {
            objectName: this.files[0].fileMd5,
            uploadId: this.uploadFileurl[0].uploadId,
          },
          this.TaskApi,
        ).then((res) => {
          this.currentFile?.onSuccess();
        });
      })
      .catch((err) => {
        console.log('test----->, err, ----->', err);
      });
    // 基于文件分片信息获取上传id
    // 文件上传
    // 文件合并
    // 保存
  }

  async addFile(file: File, options: IOptions) {
    const res = await this.getChunks(file, options);
    // this.files.push({
    //   file,
    //   fileMd5,
    //   chunks: chunks,
    // });
  }

  async getChunks(
    file: File,
    options: IOptions,
  ): Promise<{ chunks: Chunk[]; fileMd5: string }> {
    const chunkLength = Math.ceil(file.size / this.chunkSize);
    const chunks: Chunk[] = [];
    const cb = (percent: number) => {
      options.onProgress({ percent });
    };
    const fileMd5 = await this.getMd5(file, cb, this.chunkSize);
    getNeedUploadUrl(
      {
        md5: fileMd5,
        objectName: file.name,
        partCount: chunkLength,
      },
      this.TaskApi,
    ).then(async (res) => {
      file.url = res?.url;

      if (!res?.done) {
        let blobSlice =
          File.prototype.slice ||
          File.prototype.mozSlice ||
          File.prototype.webkitSlice;
        const multiParts = res?.multiParts || [];
        for (let index = 0; index < multiParts.length; index++) {
          const part = multiParts[index];
          const { partNumber: i } = part;
          // const blob = file.slice((i-1) * this.chunkSize, (i) * this.chunkSize);
          let start = (i - 1) * this.chunkSize;
          let end = start + this.chunkSize;
          if (end > file.size) {
            end = file.size;
          }
          // const blob = blobSlice.call(file, start, end);
          const blob = file.slice(start, end);
          await this.uploadAction({
            file: blob,
            md5: fileMd5,
            partNumber: i,
            uploadId: res.uploadId,
            uploadUrl: part.uploadUrl,
          });
          options.onProgress({ percent: Math.floor(index / mergeFile.length) });
        }
        const [err, suc] = await mergeFile(
          {
            objectName: file.name,
            md5: fileMd5,
            uploadId: res.uploadId,
          },
          this.TaskApi,
        );
        if (err) {
          options.onError(err);
          return;
        }
        if (suc) {
          file.url = file?.url || suc?.data;
          options.onSuccess(suc);
        }
      } else {
        options.onSuccess({});
      }

      // this.uploadFileurl.push({
      //   fileMd5: fileMd5,
      //   uploadUrls: res?.multiParts,
      //   uploadId: res?.uploadId,
      // });

      // for (let i = 0; i < chunkLength; i++) {
      //   const blob = file.slice(i * this.chunkSize, (i + 1) * this.chunkSize);
      //   // const chunkFile = new window.File([blob], `chunk-${i}`);
      //   chunks.push({
      //     file: blob,
      //     md5: `${fileMd5}-${i}`,
      //     percent: 0,
      //     num: i,
      //   });
      //   // todo 添加分片进度条的回调
      //   // console.log('test----->, precent, ----->', (i / chunkLength) * 100);
      // }

      // this.upload();
    });

    return { chunks, fileMd5 };
  }

  async getMd5(file: File, calMd5Callback, chunkSize) {
    const md5 = await this.calculateFileMd5(file, calMd5Callback, chunkSize);
    return md5;
  }

  emit(eventType: EventType, value: any) {
    this.events[eventType]?.forEach((cb) => cb?.(value));
  }

  on(eventType: EventType, cb: any) {
    if (!this.events[eventType]) {
      this.events[eventType] = [];
    }
    this.events[eventType].push(cb);
  }

  /**
   * 分块计算文件的md5值
   * @param file 文件
   * @param chunkSize 分片大小
   * @returns Promise
   */
  calculateFileMd5(file, calMd5Callback, chunkSize) {
    return new Promise((resolve, reject) => {
      let blobSlice =
        File.prototype.slice ||
        File.prototype.mozSlice ||
        File.prototype.webkitSlice;
      let chunks = Math.ceil(file.size / chunkSize);
      let currentChunk = 0;
      let spark = new SparkMD5.ArrayBuffer();
      let fileReader = new FileReader();
      calMd5Callback(0);
      fileReader.onload = function (e) {
        spark.append(e.target.result);
        currentChunk++;
        if (currentChunk < chunks) {
          calMd5Callback((currentChunk / chunks) * 100);
          loadNext();
        } else {
          let md5 = spark.end();
          calMd5Callback(100);
          resolve(md5);
        }
      };

      fileReader.onerror = function (e) {
        reject(e);
      };

      function loadNext() {
        let start = currentChunk * chunkSize;
        let end = start + chunkSize;
        if (end > file.size) {
          end = file.size;
        }
        fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
      }

      loadNext();
    });
  }
}
