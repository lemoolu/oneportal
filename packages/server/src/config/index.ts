import dev from './config.dev';
import prod from './config.prod';
import { getEnv } from '../utils';

const config = { dev, prod };

// 配置类型
export type Config = typeof dev;

// 读取项目配置
export default () => {
  const environment = getEnv();
  return config[environment];
};
