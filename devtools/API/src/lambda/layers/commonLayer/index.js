const aws = require('aws-sdk');

aws.config.region = 'ap-northeast-1';
const s3 = new aws.S3();

// 環境設定
let isSandBox = false;
isSandBox = !!process.env.ENV
  ? process.env.ENV === 'tmp' || process.env.ENV === 'dev'
    ? true
    : false
  : false;

module.exports = {
  // Lambdaプロキシ統合レスポンスの作成
  responseCreate: (statusCode) => {
    const defaultResponse = isSandBox
      ? { headers: { 'Access-Control-Allow-Origin': '*' } }
      : {};
    switch (statusCode) {
      case 200:
        return { ...defaultResponse, statusCode: 200 };
      case 400:
        return {
          ...defaultResponse,
          statusCode: 400,
          body: JSON.stringify({ message: 'Bad Request' }),
        };
      case 500:
        return {
          ...defaultResponse,
          statusCode: 500,
          body: JSON.stringify({ message: 'Internal Server Error' }),
        };
      default:
        return {
          ...defaultResponse,
          statusCode: 555,
          body: JSON.stringify({
            message: 'Creating a response with the wrong settings',
          }),
        };
    }
  },
};
