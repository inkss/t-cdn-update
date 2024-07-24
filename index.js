
const fs = require("fs");
const args = process.argv.slice(2);
const cdnClient = require("tencentcloud-sdk-nodejs").cdn.v20180606.Client;

// 检查环境变量是否存在
function checkEnvVar(varName) {
  if (!process.env[varName]) {
    console.error(`错误: 必须设置环境变量 ${varName}`);
    process.exit(1);
  }
}

checkEnvVar('secretId');
checkEnvVar('secretKey');

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

(async () => {
  try {
    if (args.length === 0) {
      throw new Error('没有提供参数');
    }

    switch (args[0]) {
      case 'safe':
        await safeConfig();
        break;

      default:
        console.error('错误: 未知命令');
        process.exit(1);
    }

  } catch (error) {
    console.error(`错误: ${error.message}`);
    process.exit(1);
  }
})();

async function safeConfig() {
  try {
    const safeData = JSON.parse(fs.readFileSync('./option/safe.json', 'utf8'));
    const data = await client.DescribeDomains({ "Limit": 1000 });
    const promises = data?.Domains.map(async (element) => {
      const params = { ...safeData, 'Domain': element?.Domain };
      await client.UpdateDomainConfig(params);
      console.log(`提示：域名 ${element?.Domain} 更新完成！`);
    });

    await Promise.all(promises);
  } catch (err) {
    console.error(`错误: ${err.message}`);
    process.exit(1);
  }
}
