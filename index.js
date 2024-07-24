
const fs = require("fs");
const args = process.argv.slice(2);
const cdnClient = require("tencentcloud-sdk-nodejs").cdn.v20180606.Client;


// 检查环境变量是否存在
if (!process.env['secretId']) {
  console.error(`错误: 必须设置环境变量 secretId`);
  process.exit(1);
}
if (!process.env['secretKey']) {
  console.error(`错误: 必须设置环境变量 secretKey`);
  process.exit(1);
}

const client = new cdnClient({
  credential: {
    secretId: process.env['secretId'],
    secretKey: process.env['secretKey']
  },
  profile: {
    httpProfile: {
      endpoint: "cdn.tencentcloudapi.com"
    }
  }
});


try {
  if (args.length === 0) {
    throw new Error('没有提供参数');
  }

  switch (args[0]) {
    case 'safe':
      safeConfig();
      break;

    default:
      break;
  }

} catch (error) {
  console.error(`错误: ${error.message}`);
  process.exit(1);
}

function safeConfig() {
  return new Promise((resolve, reject) => {
    try {
      const safeData = JSON.parse(fs.readFileSync('./option/safe.json', 'utf8'));
      client.DescribeDomains({
        "Limit": 1000
      }).then(data => {
        let promises = [];
        data?.Domains.forEach(element => {
          const params = { ...safeData };
          params['Domain'] = element?.Domain;
          promises.push(client.UpdateDomainConfig(params));
          console.log(`提示：域名 ${params['Domain']} 更新完成！`)
        });

        Promise.all(promises).then(() => {
          resolve();
        }).catch(err => {
          reject(err);
        })
      },
        err => {
          reject(err);
        }
      );
    } catch (err) {
      reject(err);
    }
  })
}
