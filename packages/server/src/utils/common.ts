export type Env = 'dev' | 'prod';

// 获取项目运行环境
export const getEnv: () => Env = () => {
  return process.env.RUNNING_ENV as Env;
};
