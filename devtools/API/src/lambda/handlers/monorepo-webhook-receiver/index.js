const path = require('path');
// const commonLayer = require('commonLayer');

// メイン処理
exports.handler = async (event) => {
  console.log({ event });

  /* ここから追加 */
  const settings = getSettingsFromS3();
  const { repositry, ref, commits } = event.body;

  // 対象リポジトリとブランチを取得
  const { setting, error } = chooseSetting({ settings, repositry, ref });
  if (error) {
    return {
      ...commonLayer.responseCreate(200),
      body: JSON.stringify(error.message),
    };
  }

  // Pipeline実行対象の判定
  const needsDeployServices = setting.Services.map((service) => {
    const needsExecute = needsExecutePipeline({ commits, service });
    return needsExecute ? service : null;
  }).filter((x) => !!x);

  console.log({ needsDeployServices });

  needsDeployServices.forEach((service) =>
    startCodePipeline({ pipelineName: service.CodePipelineName })
  );

  // GitHubにリリース対象なしを返却
  if (needsDeployServices.length === 0) {
    return {
      ...commonLayer.responseCreate(200),
      body: JSON.stringify('There was no release target.'),
    };
  }

  // GitHubにリリース対象ありを返却
  const msg = needsDeployServices
    .map((service) => `・${service.CodePipelineName}`)
    .join('\n');
  return {
    ...commonLayer.responseCreate(200),
    body: JSON.stringify(`Launched the following pipeline.\n${msg}`),
  };
};

// 入力チェック
const chooseSetting = ({ settings, repositry, ref }) => {
  // 対象リポジトリの取得
  const targetRepoSetting = settings.filter((setting) => {
    console.log({ repositry, setting });
    return repositry.full_name === setting.RepositryName;
  })[0];
  console.log({ targetRepoSetting });
  if (targetRepoSetting.length === 0) {
    return {
      error: { message: `${repositry.full_name} repositry is not the target.` },
    };
  }
  // 対象ブランチの取得
  const branchName = ref.replace('refs/heads/', '');
  const targetBranch = targetRepoSetting.TargetBranches.filter(
    (branch) => branch === branchName
  );
  console.log({ targetBranch });
  if (targetBranch.length === 0) {
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

// S3から起動条件を取得
const getSettingsFromS3 = () => {
  // 直接記載(いずれS3)
  return [
    {
      RepositryName: 'higurashit/techacademy21-monorepo',
      TargetBranches: ['main', 'staging', 'develop'],
      Services: [
        {
          ServiceName: 'OKAZU Frontend Service',
          ChangeMatchExpressions: 'services/Frontend/.*',
          IgnoreFiles: ['*.pdf', '*.md'],
          IgnoreDirectorys: ['Frontend/docs'],
          CodePipelineName: {
            main: 'MA-higurashit-prd-Frontend-CodePipeline',
            staging: 'MA-higurashit-stg-Frontend-CodePipeline',
            develop: 'MA-higurashit-dev-Frontend-CodePipeline',
          },
        },
        {
          ServiceName: 'OKAZU Backend(OPEN) Service',
          ChangeMatchExpressions: 'services/Backend-open/.*',
          IgnoreFiles: ['*.pdf', '*.md'],
          IgnoreDirectorys: ['Backend-open/docs'],
          CodePipelineName: {
            main: 'MA-higurashit-prd-Backend-open-CodePipeline',
            staging: 'MA-higurashit-stg-Backend-open-CodePipeline',
            develop: 'MA-higurashit-dev-Backend-open-CodePipeline',
          },
        },
        {
          ServiceName: 'OKAZU Backend(ONLY MEMBER) Service',
          ChangeMatchExpressions: 'services/Backend-only-member/.*',
          IgnoreFiles: ['*.pdf', '*.md'],
          IgnoreDirectorys: ['Backend-only-member/docs'],
          CodePipelineName: {
            main: 'MA-higurashit-prd-Backend-only-CodePipeline',
            staging: 'MA-higurashit-stg-Backend-only-CodePipeline',
            develop: 'MA-higurashit-dev-Backend-only-CodePipeline',
          },
        },
      ],
    },
  ];
};

// Pipeline実行対象の判定
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
const startCodePipeline = ({ pipelineName }) => {};
