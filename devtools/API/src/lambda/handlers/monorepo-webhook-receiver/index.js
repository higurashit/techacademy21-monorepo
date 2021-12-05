const path = require('path');

// Layer読み込み
// TODO: node_modules配下に作成するとcommonLayerのみで読み込める
const commonLayer = require('/opt/nodejs/commonLayer');

// メイン処理
exports.handler = async (event) => {
  console.log({ event });

  /* ここから追加 */
  const settings = getSettingsFromS3();
  const body = JSON.parse(event.body);
  const { repository, ref, commits } = body;
  console.log({ repository, ref, commits });

  // 対象リポジトリとブランチを取得
  const { setting, error } = chooseSetting({ settings, repository, ref });
  if (error) {
    return {
      ...commonLayer.responseCreate(200),
      body: JSON.stringify(error.message),
    };
  }
  console.log({ setting });
  const { TargetBranch } = setting;

  // Pipeline実行対象の判定
  const needsDeployServices = setting.Services.map((service) => {
    const needsExecute = needsExecutePipeline({ commits, service });
    return needsExecute ? service : null;
  }).filter((x) => !!x);

  console.log({ needsDeployServices });

  needsDeployServices.forEach((service) =>
    startCodePipeline({ pipelineName: service.CodePipelineName[TargetBranch] })
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
    .map((service) => `・${service.CodePipelineName[TargetBranch]}`)
    .join('\n');
  return {
    ...commonLayer.responseCreate(200),
    body: JSON.stringify(`Launched the following pipeline.\n${msg}`),
  };
};

// 入力チェック
const chooseSetting = ({ settings, repository, ref }) => {
  // 対象リポジトリの取得
  const targetRepoSetting = settings.filter((setting) => {
    console.log({ repository, setting });
    return repository.full_name === setting.RepositryName;
  })[0];
  console.log({ targetRepoSetting });
  if (targetRepoSetting.length === 0) {
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
  // 直接記載
  // TODO: S3から読み込み
  return [
    {
      RepositryName: 'higurashit/techacademy21-monorepo',
      TargetBranches: ['master', 'staging', 'develop'],
      Services: [
        {
          ServiceName: 'OKAZU Frontend Service',
          ChangeMatchExpressions: ['services/Frontend/.*'],
          IgnoreFiles: ['*.pdf', '*.md'],
          IgnoreDirectories: ['services/Frontend/docs'],
          CodePipelineName: {
            master: 'MA-higurashit-prd-Frontend-CodePipeline',
            staging: 'MA-higurashit-stg-Frontend-CodePipeline',
            develop: 'MA-higurashit-dev-Frontend-CodePipeline',
          },
        },
        {
          ServiceName: 'OKAZU Backend(OPEN) Service',
          ChangeMatchExpressions: ['services/Backend-open/.*'],
          IgnoreFiles: ['*.pdf', '*.md'],
          IgnoreDirectories: ['services/Backend-open/docs'],
          CodePipelineName: {
            master: 'MA-higurashit-prd-Backend-open-CodePipeline',
            staging: 'MA-higurashit-stg-Backend-open-CodePipeline',
            develop: 'MA-higurashit-dev-Backend-open-CodePipeline',
          },
        },
        {
          ServiceName: 'OKAZU Backend(ONLY MEMBER) Service',
          ChangeMatchExpressions: ['services/Backend-only-member/.*'],
          IgnoreFiles: ['*.pdf', '*.md'],
          IgnoreDirectories: ['services/Backend-only-member/docs'],
          CodePipelineName: {
            master: 'MA-higurashit-prd-Backend-only-CodePipeline',
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
