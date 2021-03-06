const path = require('path');

// aws-sdkを利用してS3にアクセス
const aws = require('aws-sdk');
aws.config.region = 'ap-northeast-1';
const s3 = new aws.S3();
const codepipeline = new aws.CodePipeline();

// Layer読み込み
// TODO: node_modules配下に作成するとcommonLayerのみで読み込める
const commonLayer = require('/opt/nodejs/commonLayer');

// メイン処理
exports.handler = async (event) => {
  console.log({ event });

  // S3 から起動パイプラインの設定を取得
  const settings = await getSettingsFromS3();

  // GitHub Webhook の取得
  const body = JSON.parse(event.body);
  const { repository, ref, commits } = body;
  console.log({ repository, ref, commits });

  // GitHub Webhook の内容からリポジトリとブランチを取得
  const { setting, error } = chooseSetting({ settings, repository, ref });
  if (error) {
    return {
      ...commonLayer.responseCreate(200),
      body: JSON.stringify(error.message),
    };
  }
  console.log({ setting });
  const { TargetBranch } = setting;

  // GitHub Webhook の情報を元に起動が必要なパイプラインを判定
  const needsDeployServices = setting.Services.map((service) => {
    const needsExecute = needsExecutePipeline({ commits, service });
    return needsExecute ? service : null;
  }).filter((x) => !!x);
  console.log({ needsDeployServices });

  // GitHubにリリース対象が無い旨を返却（無視ファイル、無視ディレクトリ配下のみの場合）
  if (needsDeployServices.length === 0) {
    return {
      ...commonLayer.responseCreate(200),
      body: JSON.stringify('There was no release target.'),
    };
  }

  // パイプラインの起動
  try {
    const tasks = needsDeployServices.map((service) =>
      startCodePipeline({
        pipelineName: service.CodePipelineName[TargetBranch],
      })
    );
    const ret = await Promise.all(tasks);
  } catch (e) {
    throw new Error(e.message);
  }

  // GitHub に起動対象のパイプライン名を返却
  const msg = needsDeployServices
    .map((service) => `・${service.CodePipelineName[TargetBranch]}`)
    .join('\n');
  return {
    ...commonLayer.responseCreate(200),
    body: JSON.stringify(`Launched the following pipeline.\n${msg}`),
  };
};

// S3から起動条件を取得
const getSettingsFromS3 = async () => {
  const settingsFile = {
    Bucket: 'ma-higurashit-github-resolver-settings',
    Key: 'settings.json',
  };
  const data = await s3.getObject(settingsFile).promise();
  return JSON.parse(data.Body);
};

// GitHub Webhook の内容からリポジトリとブランチを取得
const chooseSetting = ({ settings, repository, ref }) => {
  // 対象リポジトリの取得
  const targetRepoSetting = settings.filter((setting) => {
    console.log({ repository, setting });
    return repository.full_name === setting.RepositryName;
  })[0];
  console.log({ targetRepoSetting });

  if (targetRepoSetting.length === 0) {
    // リポジトリが対象外の場合
    return {
      error: {
        message: `${repository.full_name} repository is not the target.`,
      },
    };
  }
  // 対象ブランチの取得
  const branchName = ref.replace('refs/heads/', '');
  const targetBranch = targetRepoSetting.TargetBranches.filter(
    (branch) => branch === branchName
  );
  console.log({ targetBranch });

  if (targetBranch.length === 0) {
    // ブランチが対象外の場合
    return {
      error: { message: `${branchName} branch is not the target.` },
    };
  }

  return {
    setting: {
      ...targetRepoSetting,
      TargetBranch: branchName,
    },
  };
};

// GitHub Webhook の情報を元に起動が必要なパイプラインを判定
const needsExecutePipeline = ({ commits, service }) => {
  // 無視ファイル、無視ディレクトリを取得
  const { ChangeMatchExpressions, IgnoreFiles, IgnoreDirectories } = service;

  // 各コミットのうち1つでも対象であればtrueを返す
  return commits.some((commit) => {
    const added = commit.added ? commit.added : [];
    const removed = commit.removed ? commit.removed : [];
    const modified = commit.modified ? commit.modified : [];
    // 各ファイルのうち1つでも対象であればtrueを返す
    return [...added, ...removed, ...modified].some((file) =>
      needDeploy(file, ChangeMatchExpressions, IgnoreFiles, IgnoreDirectories)
    );
  });
};

// ファイルが対象かどうかを判定
const needDeploy = (
  filepath,
  ChangeMatchExpressions,
  ignoreFiles,
  ignoreDirectories
) => {
  // 対象のディレクトリに含まれているかを判定
  const isMatchExpressions = ChangeMatchExpressions.some((expression) => {
    const reg = new RegExp(`^${expression}`);
    return !!filepath.match(reg);
  });
  if (!isMatchExpressions) return false;

  // 無視対象のディレクトリに含まれているかを判定
  const isIgnoreDirectory = ignoreDirectories.some((ignoreDirectory) => {
    const reg = new RegExp(`^${ignoreDirectory}($|/)`);
    return !!filepath.match(reg);
  });
  if (isIgnoreDirectory) return false;

  // 無視対象のファイルかを判定
  const filename = path.basename(filepath);
  const ext = path.extname(filepath);
  const isIgnoreFile = ignoreFiles.some(
    (ignoreFile) => ignoreFile === `*${ext}` || ignoreFile === filename // 拡張子一致もしくはファイル名一致
  );
  if (isIgnoreFile) return false;

  return true;
};

// Pipelineの起動
const startCodePipeline = async ({ pipelineName }) => {
  const params = {
    name: pipelineName,
  };
  await codepipeline.startPipelineExecution(params).promise();
};
